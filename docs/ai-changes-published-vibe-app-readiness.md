# AI Change: Published Vibe App Readiness

- Date: 2026-05-26 16:49 CST
- Summary: Tightened make-platform-skills guidance for published/vibe App readiness after the PoC surfaced auth proxy and blank-page gaps.
- Modules: `skills/make-app-auth`, `skills/makeui`.
- Decision: `make-app-auth` stays auth-scoped and diagnoses unified login, cookies, callback routing, 401/403, and Service auth proxy only.
- Decision: `makeui` owns runtime schema normalization, no-blank-screen states, render error boundaries, and UI smoke expectations.
- Decision: Published/vibe readiness cannot fall back to token/mock mode; missing domain, gateway routing, or callback prerequisites are blockers.
- Decision: Added `scripts/audit-auth-contract.mjs` to statically catch raw `/api/make` fetches, direct-vs-Service route drift, missing Service auth proxy, and published token defaults.
- Decision: Removed token mode from `make-app-auth`; the skill now supports unified login only and deletes `references/local-token-mode.md`.
- Verification: `node --check`, fixture audit runs, `git diff --check`, and installed skill diff checks passed.
