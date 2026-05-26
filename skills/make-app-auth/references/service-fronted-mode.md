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
browser -> /api/make/auth/** -> App Service -> http://make-gateway/api/make/auth/**
```

Service code running inside the cluster may call k8s-internal make-gateway routes. UI code must not.

## Session Complete

When proxying `/api/make/auth/session/complete`, Service must return the gateway response to the browser:

- preserve `302`
- preserve `Set-Cookie`
- preserve `Location`

In Node Service code, use `redirect: "manual"` or the equivalent. Do not let server-side fetch follow the redirect internally.

## Validation

- Browser business requests go to Service-owned `/api/make/app/**` paths.
- Browser auth requests go to `/api/make/auth/**`.
- Service calls internal business routes such as `http://make-gateway/make/meta/**` and `http://make-gateway/make/data/**`.
- Service does not call k8s-internal `/api/make/meta/**` or `/api/make/data/**` unless the gateway explicitly supports those internal paths.
- `session/complete` reaches the browser as `302 + Set-Cookie + Location`.
