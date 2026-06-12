#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const auditScript = path.join(scriptDir, 'audit-auth-contract.mjs');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'make-app-auth-audit-'));

try {
  const goodRoot = createFixture('good-service-fronted', {
    ui: `
      import { createMakeAppAuth } from '@qfeius/make-app-auth';
      const auth = createMakeAppAuth({ gatewayBaseUrl: '/api/make', unifiedLogin: true, apiAuthRedirect: true });
      const init = await auth.init({ redirect: true });
      if (init.reason === 'state_expired' || init.reason === 'challenge_expired') {
        await auth.login({ redirect: true });
      }
      export async function loadSchema() {
        return auth.api.get('/app/schema', { credentials: 'include' });
      }
    `,
    service: `
      function applyForwardedHostContext(headers, source) {
        if (!headers.get('x-forwarded-host')) {
          const host = source.get('host');
          if (host) headers.set('x-forwarded-host', host);
        }
        if (!headers.get('x-forwarded-proto')) headers.set('x-forwarded-proto', 'https');
      }
      export async function proxy(req) {
        const headers = new Headers({ cookie: req.headers.get('cookie') || '' });
        applyForwardedHostContext(headers, req.headers);
        if (req.url.includes('/api/make/auth/session/complete')) {
          return fetch('http://make-gateway/make/auth/session/complete', { headers, redirect: 'manual' });
        }
        if (req.url.includes('/api/make/auth/current-context')) {
          return fetch('http://make-gateway/make/auth/current-context', { headers });
        }
        return fetch('http://make-gateway/make/data/v1/record', { headers });
      }
    `
  });

  assert.match(runAudit(goodRoot), /status: PASS/);

  const missingHostRoot = createFixture('missing-host-context', {
    ui: `
      import { createMakeAppAuth } from '@qfeius/make-app-auth';
      const auth = createMakeAppAuth({ gatewayBaseUrl: '/api/make', unifiedLogin: true, apiAuthRedirect: true });
      const init = await auth.init({ redirect: true });
      if (init.reason === 'state_expired' || init.reason === 'challenge_expired') {
        await auth.login({ redirect: true });
      }
      export async function loadSchema() {
        return auth.api.get('/app/schema', { credentials: 'include' });
      }
    `,
    service: `
      export async function proxy(req) {
        const headers = new Headers({ cookie: req.headers.get('cookie') || '' });
        return fetch('http://make-gateway/make/auth/session/complete', { headers, redirect: 'manual' });
      }
    `
  });

  const missingHostOutput = runAudit(missingHostRoot, { expectFailure: true });
  assert.match(missingHostOutput, /forwarded_host_context_missing/);
  assert.match(missingHostOutput, /forwarded_proto_context_missing/);

  const missingExpiredRoot = createFixture('missing-expired-handling', {
    ui: `
      import { createMakeAppAuth } from '@qfeius/make-app-auth';
      const auth = createMakeAppAuth({ gatewayBaseUrl: '/api/make', unifiedLogin: true, apiAuthRedirect: true });
      await auth.init({ redirect: true });
      export async function loadSchema() {
        return auth.api.get('/app/schema', { credentials: 'include' });
      }
    `,
    service: `
      function applyForwardedHostContext(headers, source) {
        if (!headers.get('x-forwarded-host')) {
          const host = source.get('host');
          if (host) headers.set('x-forwarded-host', host);
        }
        if (!headers.get('x-forwarded-proto')) headers.set('x-forwarded-proto', 'https');
      }
      export async function proxy(req) {
        const headers = new Headers({ cookie: req.headers.get('cookie') || '' });
        applyForwardedHostContext(headers, req.headers);
        return fetch('http://make-gateway/make/auth/session/complete', { headers, redirect: 'manual' });
      }
    `
  });

  const missingExpiredOutput = runAudit(missingExpiredRoot, { expectFailure: true });
  assert.match(missingExpiredOutput, /recoverable_auth_expired_missing/);

  const businessApiScopeRoot = createFixture('business-api-wrong-scope', {
    ui: `
      import { createMakeAppAuth } from '@qfeius/make-app-auth';
      const auth = createMakeAppAuth({ gatewayBaseUrl: '/api/make', unifiedLogin: true, apiAuthRedirect: true });
      const init = await auth.init({ redirect: true });
      if (init.reason === 'state_expired' || init.reason === 'challenge_expired') {
        await auth.login({ redirect: true });
      }
      export async function loadSchema() {
        return auth.api.get('/app/schema', { credentials: 'include' });
      }
    `,
    service: `
      const MAKE_API_BASE_URL = 'http://make-gateway/api/make';
      function applyForwardedHostContext(headers, source) {
        const host = source.get('host');
        if (host) headers.set('x-forwarded-host', host);
        headers.set('x-forwarded-proto', 'https');
      }
      export async function proxy(req) {
        const headers = new Headers({ cookie: req.headers.get('cookie') || '' });
        applyForwardedHostContext(headers, req.headers);
        if (req.url.includes('/api/make/auth/session/complete')) {
          return fetch('http://make-gateway/make/auth/session/complete', { headers, redirect: 'manual' });
        }
        return fetch(MAKE_API_BASE_URL + '/data/v1/record', { headers });
      }
    `
  });

  const businessApiScopeOutput = runAudit(businessApiScopeRoot, { expectFailure: true });
  assert.match(businessApiScopeOutput, /service_fronted_business_gateway_scope_wrong/);

  const spoofedForwardedHostRoot = createFixture('spoofed-forwarded-host', {
    ui: `
      import { createMakeAppAuth } from '@qfeius/make-app-auth';
      const auth = createMakeAppAuth({ gatewayBaseUrl: '/api/make', unifiedLogin: true, apiAuthRedirect: true });
      const init = await auth.init({ redirect: true });
      if (init.reason === 'state_expired' || init.reason === 'challenge_expired') {
        await auth.login({ redirect: true });
      }
      export async function loadSchema() {
        return auth.api.get('/app/schema', { credentials: 'include' });
      }
    `,
    service: `
      function applyForwardedHostContext(headers, source) {
        if (!headers.get('x-forwarded-host')) {
          const host = source.get('host');
          if (host) headers.set('x-forwarded-host', host);
        }
        if (!headers.get('x-forwarded-proto')) headers.set('x-forwarded-proto', 'https');
      }
      export async function proxy(req) {
        const headers = new Headers({
          cookie: req.headers.get('cookie') || '',
          'x-forwarded-host': req.headers.get('x-forwarded-host') || ''
        });
        applyForwardedHostContext(headers, req.headers);
        return fetch('http://make-gateway/make/auth/session/complete', { headers, redirect: 'manual' });
      }
    `
  });

  const spoofedForwardedHostOutput = runAudit(spoofedForwardedHostRoot, { expectFailure: true });
  assert.match(spoofedForwardedHostOutput, /forwarded_host_passthrough_present/);

  const rawDownloadUrlRoot = createFixture('raw-download-url', {
    ui: `
      import { createMakeAppAuth } from '@qfeius/make-app-auth';
      const auth = createMakeAppAuth({ gatewayBaseUrl: '/api/make', unifiedLogin: true, apiAuthRedirect: true });
      const init = await auth.init({ redirect: true });
      if (init.reason === 'state_expired' || init.reason === 'challenge_expired') {
        await auth.login({ redirect: true });
      }
      export function ReceiptPreview() {
        return <img src="/api/make/data/v1/download/ExpensePoc/receipt.jpg" />;
      }
      export async function loadSchema() {
        return auth.api.get('/app/schema', { credentials: 'include' });
      }
    `,
    service: `
      function applyForwardedHostContext(headers, source) {
        if (!headers.get('x-forwarded-host')) {
          const host = source.get('host');
          if (host) headers.set('x-forwarded-host', host);
        }
        if (!headers.get('x-forwarded-proto')) headers.set('x-forwarded-proto', 'https');
      }
      export async function proxy(req) {
        const headers = new Headers({ cookie: req.headers.get('cookie') || '' });
        applyForwardedHostContext(headers, req.headers);
        if (req.url.includes('/api/make/auth/session/complete')) {
          return fetch('http://make-gateway/make/auth/session/complete', { headers, redirect: 'manual' });
        }
        return fetch('http://make-gateway/make/data/v1/record', { headers });
      }
    `
  });

  const rawDownloadUrlOutput = runAudit(rawDownloadUrlRoot, { expectFailure: true });
  assert.match(rawDownloadUrlOutput, /service_fronted_raw_download_resource/);

  console.log('audit-auth-contract tests: PASS');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

function createFixture(name, files) {
  const root = path.join(tempRoot, name);
  write(path.join(root, 'apps/ui/src/app.ts'), files.ui);
  write(path.join(root, 'apps/service/src/app.ts'), files.service);
  return root;
}

function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

function runAudit(root, options = {}) {
  try {
    return execFileSync(process.execPath, [
      auditScript,
      root,
      '--mode',
      'service-fronted',
      '--published'
    ], { encoding: 'utf8' });
  } catch (error) {
    if (options.expectFailure) {
      return `${error.stdout ?? ''}${error.stderr ?? ''}`;
    }
    throw error;
  }
}
