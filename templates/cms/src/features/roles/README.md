# Roles Feature

Quản lý roles và phân quyền theo vai trò.

> **English**: Role management and role-based permission assignment for the admin application.

## Scope

- CRUD role và gán permission theo role.
- Expose role entities và hook orchestration cho app layer.
- Kết nối chặt với permissions feature nhưng giữ boundary public API.

## Structure

```text
roles/
├── components/
├── hooks/
├── models/
├── services/
├── utils/
└── index.ts
```

## Entry Points

| Layer | Path | Purpose |
| --- | --- | --- |
| Public API | `src/features/roles/index.ts` | Stable exports cho role feature |
| Hooks | `src/features/roles/hooks/` | Query/mutation orchestration |
| Models | `src/features/roles/models/` | Shared role entities trong feature |
| Services | `src/features/roles/services/` | Backend contract |

## Conventions

- Network layer dùng `services/`.
- Hooks tách query/mutation rõ ràng.
- Models chứa role entities dùng chung trong feature.

## Enhancement Direction

- Chuẩn hóa role-permission diffing để edit form không phải tự xử lý merge logic.
- Thêm guardrails cho system roles hoặc immutable roles nếu backend hỗ trợ.
- Bổ sung tests cho assign/revoke permissions và optimistic update rollback.
- Viết thêm docs cho quan hệ `roles` ↔ `permissions` ↔ `auth` để onboarding nhanh hơn.

---

_Last Updated: 2026-06-13_
