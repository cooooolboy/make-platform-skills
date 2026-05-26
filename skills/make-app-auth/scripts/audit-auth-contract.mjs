#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const USAGE = `Usage:
  node skills/make-app-auth/scripts/audit-auth-contract.mjs <project-root> [--mode direct|service-fronted|auto] [--published]

Checks Make App unified-login contract drift. This is auth-scoped; it does not verify schema rendering or UI layout.`;

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}

let projectRoot = null;
let mode = 'auto';
let published = false;

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '--published') {
    published = true;
    continue;
  }
  if (arg === '--mode') {
    mode = args[index + 1] || '';
    index += 1;
    continue;
  }
  if (arg.startsWith('--mode=')) {
    mode = arg.slice('--mode='.length);
    continue;
  }
  if (!projectRoot) {
    projectRoot = arg;
    continue;
  }
  failUsage(`Unexpected argument: ${arg}`);
}

if (!projectRoot) {
  projectRoot = process.cwd();
}

if (!['auto', 'direct', 'service-fronted'].includes(mode)) {
  failUsage(`Invalid --mode: ${mode}`);
}

const root = path.resolve(projectRoot);
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
  failUsage(`Project root does not exist or is not a directory: ${root}`);
}

const uiFiles = collectSourceFiles(firstExisting([
  'apps/ui/src',
  'apps/ui',
  'ui/src',
  'src'
]));
const serviceFiles = collectSourceFiles(firstExisting([
  'apps/service/src',
  'apps/service',
  'service/src',
  'server/src'
]));
const allProjectFiles = collectSourceFiles(root);
const uiText = readJoined(uiFiles);
const serviceText = readJoined(serviceFiles);
const projectText = readJoined(allProjectFiles);
const inferredMode = mode === 'auto' ? inferMode() : mode;

const failures = [];
const warnings = [];

if (uiFiles.length === 0) {
  failures.push('no_ui_source: cannot find UI source under apps/ui/src, apps/ui, ui/src, or src');
}

if (!/@qfeius\/make-app-auth/.test(projectText) && !/createMakeAppAuth\s*\(/.test(projectText)) {
  failures.push('sdk_missing: project does not appear to use @qfeius/make-app-auth');
}

for (const hit of findRawMakeFetches(uiFiles)) {
  failures.push(`raw_make_fetch: ${relative(hit.file)} uses raw fetch for ${hit.url}; use auth.api through the shared adapter`);
}

if (hasTokenMode(projectText)) {
  failures.push('token_mode_present: make-app-auth skill only supports unified login; remove unifiedLogin:false, token options, local credentials, and token-mode env switches');
}

if (published) {
  if (!/apiAuthRedirect\s*:\s*true/.test(projectText)) {
    warnings.push('published_api_auth_redirect_missing: generated unified-login Apps should set apiAuthRedirect:true with SDK >= 0.1.2');
  }
  if (!hasRecoverableAuthExpiredHandling(uiText)) {
    failures.push('recoverable_auth_expired_missing: generated unified-login Apps must handle state_expired/challenge_expired by showing a relogin prompt');
  }
}

if (inferredMode === 'service-fronted') {
  if (hasUiDirectGatewayCalls(uiText)) {
    failures.push('service_fronted_ui_bypass: UI calls /data/** or /meta/** through auth.api; UI should call Service-owned /app/** paths');
  }
  if (!/\/api\/make\/auth\b/.test(serviceText)) {
    failures.push('auth_proxy_missing: Service-fronted App must proxy /api/make/auth/** to make-gateway');
  }
  if (!/\/api\/make\/app\b/.test(projectText) && !/auth\.api\.(?:get|post|put|patch|delete|request)\(\s*[`'"]\/app\//.test(uiText)) {
    warnings.push('service_fronted_app_route_missing: could not find Service-owned /api/make/app/** or UI /app/** calls');
  }
  if (/session\/complete/.test(serviceText) && !/redirect\s*:\s*[`'"]manual[`'"]/.test(serviceText) && !/maxRedirects\s*:\s*0/.test(serviceText)) {
    failures.push('session_complete_redirect_not_manual: session/complete proxy must preserve gateway 302/Set-Cookie/Location');
  }
  if (!hasForwardedHostFallback(serviceText)) {
    failures.push('forwarded_host_context_missing: Service-fronted proxy must derive X-Forwarded-Host from inbound Host when the header is absent');
  }
  if (!hasForwardedProtoFallback(serviceText)) {
    failures.push('forwarded_proto_context_missing: Service-fronted proxy must add X-Forwarded-Proto when forwarding to make-gateway');
  }
  if (!/(req\.headers\.cookie|headers\.cookie|(?:request|req)\.headers\.get\(\s*[`'"]cookie[`'"]|(?:source|inboundHeaders|headers)\.get\(\s*[`'"]cookie[`'"]|cookie\s*:)/i.test(serviceText)) {
    warnings.push('cookie_forwarding_not_obvious: could not find obvious Cookie forwarding in Service code');
  }
} else {
  if (/auth\.api\.(?:get|post|put|patch|delete|request)\(\s*[`'"]\/app\//.test(uiText)) {
    failures.push('direct_mode_app_route: direct gateway mode should not call Service-owned /app/** routes');
  }
}

printResult();
process.exit(failures.length > 0 ? 1 : 0);

function failUsage(message) {
  console.error(message);
  console.error(USAGE);
  process.exit(2);
}

function firstExisting(candidates) {
  for (const candidate of candidates) {
    const absolute = path.join(root, candidate);
    if (fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()) {
      return absolute;
    }
  }
  return null;
}

function collectSourceFiles(start) {
  if (!start) {
    return [];
  }
  const files = [];
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop();
    let stat;
    try {
      stat = fs.statSync(current);
    } catch {
      continue;
    }
    if (stat.isDirectory()) {
      if (shouldSkipDir(path.basename(current))) {
        continue;
      }
      for (const child of fs.readdirSync(current)) {
        stack.push(path.join(current, child));
      }
      continue;
    }
    if (stat.isFile() && isSourceFile(current)) {
      files.push(current);
    }
  }
  return files.sort();
}

function shouldSkipDir(name) {
  return new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', '.next', '.turbo']).has(name);
}

function isSourceFile(file) {
  return /\.(cjs|mjs|js|jsx|ts|tsx|json|html|vue|svelte)$/i.test(file);
}

function readJoined(files) {
  return files.map((file) => {
    try {
      return fs.readFileSync(file, 'utf8');
    } catch {
      return '';
    }
  }).join('\n');
}

function inferMode() {
  if (
    serviceFiles.length > 0 &&
    (/auth\.api\.(?:get|post|put|patch|delete|request)\(\s*[`'"]\/app\//.test(uiText) || /\/api\/make\/app\b/.test(projectText))
  ) {
    return 'service-fronted';
  }
  return 'direct';
}

function findRawMakeFetches(files) {
  const hits = [];
  const rawFetch = /(?:window\.)?fetch\s*\(\s*([`'"])([^`'"]*\/api\/make[^`'"]*)\1/g;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    let match;
    while ((match = rawFetch.exec(text))) {
      hits.push({ file, url: match[2] });
    }
  }
  return hits;
}

function hasTokenMode(text) {
  return (
    /authMode\s*=\s*[`'"]token[`'"]/.test(text) ||
    /VITE_MAKE_AUTH_MODE[\s\S]{0,120}(?:\?\?|\|\|)\s*[`'"]token[`'"]/.test(text) ||
    /MAKE_AUTH_MODE[\s\S]{0,120}(?:\?\?|\|\|)\s*[`'"]token[`'"]/.test(text) ||
    /unifiedLogin\s*:\s*false/.test(text) ||
    /\b(?:accessToken|tokenProvider)\s*:/.test(text) ||
    /\btoken\s*:\s*[^,}\n]+/.test(text) ||
    /~\/\.make\/credentials/.test(text)
  );
}

function hasUiDirectGatewayCalls(text) {
  return /auth\.api\.(?:get|post|put|patch|delete|request)\(\s*[`'"]\/(?:data|meta)\b/.test(text);
}

function hasRecoverableAuthExpiredHandling(text) {
  return /state_expired/.test(text)
    && /challenge_expired/.test(text)
    && /auth\.login\(\s*\{\s*redirect\s*:\s*true\s*\}\s*\)/.test(text);
}

function hasForwardedHostFallback(text) {
  const normalized = text.toLowerCase();
  if (!normalized.includes('x-forwarded-host')) {
    return false;
  }
  return (
    /(?:source|inboundheaders|inbound|request\.headers|req\.headers|options\.headers|headers)\.get\(\s*[`'"]host[`'"]\s*\)/i.test(text) ||
    /(?:request|req)\.headers\.host/i.test(text) ||
    /headers\.set\(\s*[`'"]x-forwarded-host[`'"][\s\S]{0,240}\bhost\b/i.test(text) ||
    /[`'"]x-forwarded-host[`'"]\s*:\s*[^,\n}]*\bhost\b/i.test(text)
  );
}

function hasForwardedProtoFallback(text) {
  const normalized = text.toLowerCase();
  if (!normalized.includes('x-forwarded-proto')) {
    return false;
  }
  return (
    /headers\.set\(\s*[`'"]x-forwarded-proto[`'"]/i.test(text) ||
    /[`'"]x-forwarded-proto[`'"]\s*:/i.test(text) ||
    /x-forwarded-proto[\s\S]{0,240}(?:https|http|\$scheme|proto)/i.test(text)
  );
}

function relative(file) {
  return path.relative(root, file) || '.';
}

function printResult() {
  console.log(`make-app-auth contract audit`);
  console.log(`root: ${root}`);
  console.log(`mode: ${inferredMode}${mode === 'auto' ? ' (auto)' : ''}`);
  console.log(`published: ${published ? 'yes' : 'no'}`);

  if (failures.length === 0 && warnings.length === 0) {
    console.log('status: PASS');
    return;
  }

  if (failures.length > 0) {
    console.log('failures:');
    for (const failure of failures) {
      console.log(`- ${failure}`);
    }
  }
  if (warnings.length > 0) {
    console.log('warnings:');
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }
  console.log(`status: ${failures.length > 0 ? 'FAIL' : 'PASS_WITH_WARNINGS'}`);
}
