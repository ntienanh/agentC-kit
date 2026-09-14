# Configuration Structure

This directory contains application and infrastructure configuration, grouped by concern.

## Structure

```text
configs/
├── app/
│   ├── auth/
│   │   └── auth-flow.config.ts
│   ├── design-system/
│   │   ├── README.md
│   │   ├── index.ts
│   │   ├── theme-presets.ts
│   │   ├── theme.config.ts
│   │   ├── tokens.config.ts
│   │   └── tokens.manifest.json
│   ├── env/
│   │   ├── client.config.ts
│   │   ├── index.ts
│   │   └── server.config.ts
│   ├── features/
│   │   ├── feature-registry.config.tsx
│   │   ├── feature-selection.config.ts
│   │   ├── index.ts
│   │   ├── navigation.config.tsx
│   │   └── shell-navigation.config.tsx
│   ├── template/
│   │   ├── app-template.config.ts
│   │   └── index.ts
│   ├── app.config.ts
│   ├── index.ts
│   ├── locale.config.ts
│   └── shell.config.ts
├── core/
│   ├── cache.config.ts
│   ├── error.config.ts
│   ├── http.config.ts
│   ├── index.ts
│   ├── session.config.ts
│   ├── ui-policy.config.ts
│   ├── upload.config.ts
│   └── validation.config.ts
└── index.ts
```

## Usage

Import from root barrel when possible:

```ts
import { APP_CONFIG, VALIDATION_CONFIG } from '@/configs';
```

## Groups

### `app/`
- App-specific settings (routing, locale, shell, feature registry, auth flow, template metadata).
- Can change with product requirements.

### `core/`
- Shared infrastructure settings (API endpoints, HTTP, cache, session, validation, upload, UI policy).
- Should stay stable and reusable.

## Notes

- `template/app-template.config.ts` is the public template surface for shell/runtime consumers.
- `design-system/tokens.manifest.json` is the source for token mapping helpers in `tokens.config.ts`.
- `feature-selection.config.ts` controls enabled/default feature keys.

## Endpoint Ownership

- Feature API endpoints must live with the feature that owns them.
- Endpoint definition files must use the `*.endpoints.ts` suffix.
- Do not put business API endpoints in `src/configs/core`.
- Shared infrastructure endpoints can live in shared infra modules, for example `src/shared/lib/http/proxy.endpoints.ts`.

Examples:

```text
src/features/auth/api/auth.endpoints.ts
src/features/roles/services/roles.endpoints.ts
src/features/permissions/services/permissions.endpoints.ts
src/shared/lib/http/proxy.endpoints.ts
```
