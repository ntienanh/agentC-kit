# Auth Services

`authApi` là service wrapper gọi các internal Next.js API routes trong `AUTH_INTERNAL_ENDPOINTS`.

## Usage

```ts
import { authApi } from '@/features/auth/services';

const response = await authApi.login({ identifier, password });
```

## Login Contract

- `authApi.login()` gọi `POST /api/auth/login`.
- Route handler gọi backend `/auth/local`.
- Route handler set `httpOnly` auth cookies.
- Client nhận payload để hydrate UI state, không tự set token cookie.

## Types

```ts
import type { LoginRequest, LoginResponse } from '@/features/auth/services';
```
