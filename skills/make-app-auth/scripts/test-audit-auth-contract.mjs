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
          return fetch('/api/make/auth/session/complete', { headers, redirect: 'manual' });
        }
        if (req.url.includes('/api/make/auth/current-context')) {
          return fetch('/api/make/auth/current-context', { headers });
        }
        return fetch('/api/make/app/schema', { headers });
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
        return fetch('/api/make/auth/session/complete', { headers, redirect: 'manual' });
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
        return fetch('/api/make/auth/session/complete', { headers, redirect: 'manual' });
      }
    `
  });

  const missingExpiredOutput = runAudit(missingExpiredRoot, { expectFailure: true });
  assert.match(missingExpiredOutput, /recoverable_auth_expired_missing/);

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
