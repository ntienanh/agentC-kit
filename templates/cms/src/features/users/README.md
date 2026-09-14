# User Management Feature

Quản lý users, self profile, và sessions.

> **English**: User, self-profile and session management for the CMS admin.

## Scope

- CRUD users và tra cứu user detail.
- Quản lý self profile và session-related screens.
- Tổ chức hooks theo subdomain `users` và `sessions`.

## Structure

```text
user-management/
├── components/
│   ├── profile-page/
│   ├── sessions-page/
│   ├── user-create-modal/
│   ├── user-detail-page/
│   ├── user-list-page/
│   └── index.ts
├── hooks/
│   ├── users/
│   ├── sessions/
│   └── index.ts
├── models/
├── services/
├── utils/
└── index.ts
```

## Entry Points

| Layer | Path | Purpose |
| --- | --- | --- |
| Public API | `src/features/user-management/index.ts` | Stable exports cho app layer |
| Users hooks | `src/features/user-management/hooks/users/` | User query/mutation orchestration |
| Sessions hooks | `src/features/user-management/hooks/sessions/` | Session query/mutation orchestration |
| Components | `src/features/user-management/components/` | UI screens cho list/detail/profile/sessions |

## Conventions

- Network layer dùng `services/`.
- Hooks chia theo domain con: `users` và `sessions`.
- Component-level config/helpers dùng `components/*/utils`.
- Error message lấy từ i18n `error.json` theo `error.code`.

## Enhancement Direction

- Tách shared user form schema cho create/edit/profile để giảm duplicated validation.
- Bổ sung session-security docs: revoke flow, current session marker và device metadata.
- Thêm tests cho self-profile update, session list và role/permission display edge cases.
- Chuẩn hóa empty/error states giữa user list, detail page và sessions page.

---

_Last Updated: 2026-06-13_
