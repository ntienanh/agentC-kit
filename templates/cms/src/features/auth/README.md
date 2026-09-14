# Auth Feature

Xác thực người dùng, quản lý phiên đăng nhập, refresh token và bảo vệ route trong CMS admin.

> **English**: User authentication, session lifecycle, token refresh and protected-route enforcement for the CMS admin.

## Scope

- Login/logout và bootstrap session hiện tại.
- Refresh token và session lifecycle trên client.
- Guard route/component theo trạng thái xác thực.
- Public API cho app layer import qua `@/features/auth`.

## Structure

```text
auth/
├── actions/
├── components/
├── guards/
├── hooks/
├── services/
├── stores/
├── utils/
└── index.ts
```

## Entry Points

| Layer | Path | Purpose |
| --- | --- | --- |
| Public API | `src/features/auth/index.ts` | Stable exports cho app layer |
| Session lifecycle | `src/features/auth/hooks/useAuthSessionLifecycle.ts` | Đồng bộ phiên và refresh token |
| Services | `src/features/auth/services/` | Network contract cho auth APIs |
| Guards | `src/features/auth/guards/` | Route/component protection |

## Conventions

- Network layer đặt trong `services/`.
- Session lifecycle xử lý trong `hooks/useAuthSessionLifecycle.ts`.
- App layer import qua `@/features/auth`, tránh import private subpath khi không cần.
- Error message ưu tiên resolve từ i18n `messages/*/error.json` theo `error.code`.

## Enhancement Direction

- Chuẩn hóa auth service DTO với backend response envelope để giảm mapping rải rác.
- Bổ sung test cho refresh-token retry, expired session và logout cleanup.
- Tách rõ guard UX states: loading, unauthenticated, unauthorized và degraded API state.
- Thêm operational dashboard/logging cho lỗi login phổ biến theo `error.code`.

## Operational Docs

- Login troubleshooting: `cms-fe-admin-antd/docs/features/auth/login-operational-checklist.md`

---

_Last Updated: 2026-06-13_
