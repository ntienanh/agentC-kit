# Permissions Feature

Quản lý permissions và RBAC mapping cho admin.

> **English**: Permission management and RBAC mapping for the admin application.

## Scope

- Quản lý permission catalog và RBAC mapping UI.
- Hỗ trợ cấu hình bảng/form cho permission-related screens.
- Expose utilities và services phục vụ role/ability workflows.

## Structure

```text
permissions/
├── components/
│   ├── utils/
│   └── index.ts
├── hooks/
├── services/
├── types/
├── utils/
└── index.ts
```

## Entry Points

| Layer | Path | Purpose |
| --- | --- | --- |
| Public API | `src/features/permissions/index.ts` | Stable exports cho permission feature |
| Components | `src/features/permissions/components/` | UI cho permission management |
| Services | `src/features/permissions/services/` | API contracts |
| Feature utils | `src/features/permissions/utils/` | Query keys, cache helpers, formatters |

## Conventions

- `components/utils` chứa table/form helpers cục bộ cho UI permissions.
- `utils` chứa query keys/cache keys và utility cấp feature.
- Services chỉ xử lý network contract.

## Enhancement Direction

- Đồng bộ permission naming matrix với backend seed để tránh drift giữa UI và API.
- Bổ sung docs mapping giữa permissions feature và roles/auth abilities.
- Thêm validation/reporting cho duplicate hoặc orphan permission assignments.
- Chuẩn hóa table/form config builder để tái dùng tốt hơn giữa permission-related screens.

---

_Last Updated: 2026-06-13_
