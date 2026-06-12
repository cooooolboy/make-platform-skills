# Service-Fronted Mode

Use this reference when the generated App keeps a Service layer between UI and make-gateway.

## Boundary

Preserve this contract:

```text
UI -> auth.api('/app/**') -> App Service -> make-gateway -> Make Platform
```

UI business code calls Service-owned paths such as:

```js
await auth.api.get('/app/schema');
await auth.api.post('/app/records/customer', payload);
```

UI must not bypass Service by calling `/data/**`, `/meta/**`, meta/data service domains, or k8s-internal service names directly.

## Deployed Chain

Browser calls stay same-origin under `gatewayBaseUrl=/api/make`.

Business APIs:

```text
browser -> /api/make/app/** -> App Service -> http://make-gateway/make/meta|data/**
```

Auth APIs:

```text
browser -> /api/make/auth/** -> App Service -> http://make-gateway/make/auth/**
```

Service code running inside the cluster must call k8s-internal make-gateway routes without the external `/api` prefix. UI code must not call internal routes directly.

Do not publish a Service-fronted unified-login App without the auth proxy. A missing `/api/make/auth/current-context` route means the browser cannot start or verify unified login, even if business routes such as `/api/make/app/schema` work.

The Service auth proxy must forward browser auth context:

- request `Cookie`
- request host/proxy headers needed by make-gateway to resolve the published App domain, especially `X-Forwarded-Host` and `X-Forwarded-Proto`
- gateway `Set-Cookie`, `Location`, and status code back to the browser

Do not convert the gateway response into a JSON envelope for auth routes.

## Attachment Download Proxy

In Service-fronted apps, file previews and downloads must stay on Service-owned browser paths:

```text
browser img/link -> /api/make/app/files/download/** -> App Service -> make-gateway /make/data/v1/download/**
```

Do not use raw Make download paths such as `/data/v1/download/**`, `/make/data/v1/download/**`, or `/api/make/data/v1/download/**` as UI `src`, `href`, or file metadata URLs when a Service proxy exists.

When the Make download endpoint requires `Authorization`, the browser still must not receive the token. The Service download route must:

- derive forwarded host/proto with the same helper used by auth/business gateway calls
- require the browser App session Cookie
- verify the session first through make-gateway, for example `${makeAuthBaseUrl}/auth/current-context`
- use the deployment-injected download token only after the session check passes
- remove or overwrite any inbound browser `Authorization` before attaching the Service token
- return the upstream binary bytes or stream with safe `Content-Type` and `Content-Disposition`
- keep tokens, cookies, Authorization, and signed query strings out of logs and `/api/config`

## Host Context Helper

Generated Service-fronted Apps must centralize host/proto forwarding in one helper and use it for both auth routes and business routes. Do not trust or pass through client-supplied `X-Forwarded-Host`; derive it from inbound `Host`.

```ts
function applyForwardedHostContext(headers: Headers, source: Headers): void {
  const host = source.get('host');
  if (host) {
    headers.set('x-forwarded-host', firstHeaderValue(host));
  }
  if (!headers.get('x-forwarded-proto')) {
    headers.set('x-forwarded-proto', isLocalHost(headers.get('x-forwarded-host')) ? 'http' : 'https');
  }
}

function firstHeaderValue(value: string): string {
  const commaIndex = value.indexOf(',');
  return commaIndex >= 0 ? value.substring(0, commaIndex).trim() : value.trim();
}

function isLocalHost(host: string | null): boolean {
  const hostname = stripPort(host);
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function stripPort(host: string | null): string | null {
  if (!host) {
    return host;
  }
  const portIndex = host.indexOf(':');
  return portIndex >= 0 ? host.substring(0, portIndex) : host;
}
```

Apply the helper before every upstream make-gateway request:

```ts
const authHeaders = pickProxyHeaders(inboundHeaders, ['cookie']);
applyForwardedHostContext(authHeaders, inboundHeaders);

const businessHeaders = new Headers(init.headers);
applyForwardedHostContext(businessHeaders, inboundHeaders);
```

Internal make-gateway URLs must not use the external `/api` prefix:

```ts
const makeAuthBaseUrl = 'http://make-gateway/make';
const makeBusinessBaseUrl = 'http://make-gateway/make';

await fetch(`${makeAuthBaseUrl}/auth/current-context`, { headers: authHeaders });
await fetch(`${makeBusinessBaseUrl}/data/v1/record`, { headers: businessHeaders });
```

## Session Complete

When proxying `/api/make/auth/session/complete`, Service must return the gateway response to the browser:

- preserve `302`
- preserve `Set-Cookie`
- preserve `Location`

In Node Service code, use `redirect: "manual"` or the equivalent. Do not let server-side fetch follow the redirect internally.

## Validation

These checks belong to the agent, generated tests, CI, or publish pipeline. Do not require the end user to open DevTools or inspect k8s logs after publish to discover the issue.

- Run `scripts/audit-auth-contract.mjs <project-root> --mode service-fronted --published` when a generated project tree is available.
- Browser business requests go to Service-owned `/api/make/app/**` paths.
- Browser auth requests go to `/api/make/auth/**`.
- `/api/make/auth/current-context` is reachable from the published domain and returns a challenge or authenticated context, not a Service 404.
- Service calls internal business routes such as `http://make-gateway/make/meta/**` and `http://make-gateway/make/data/**`.
- Service calls internal auth routes such as `http://make-gateway/make/auth/**`.
- Service does not call k8s-internal `/api/make/auth/**`, `/api/make/meta/**`, or `/api/make/data/**`; `/api` is only for external-domain access.
- Service forwards browser cookies on every auth and business request that depends on App session.
- Service derives `X-Forwarded-Host` from inbound `Host`, does not pass through client-supplied `X-Forwarded-Host`, and adds `X-Forwarded-Proto`; auth and business requests share this helper.
- `session/complete` reaches the browser as `302 + Set-Cookie + Location`.
- At least one authenticated schema/meta request and one record-list request pass through the same Service/auth adapter path before reporting publish success.
