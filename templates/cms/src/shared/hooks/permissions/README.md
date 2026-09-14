# Permission Hooks

Các hooks để kiểm tra permissions dựa trên CASL ability system.

## Overview

Permission hooks sử dụng backend format `"resource:action"` (e.g., `"users:read"`, `"media:upload"`).

## Hooks

### `useCan(action, subject)`

Kiểm tra user có permission cụ thể không.

```typescript
const { hasPermission, checkPermission } = useCan('read', 'users');

if (hasPermission) {
  // User có thể read users
}

// Check permission khác
if (checkPermission('update', 'media')) {
  // User có thể update media
}
```

### `useMultiplePermissions(permissions, requireAll?)`

Kiểm tra nhiều permissions cùng lúc.

```typescript
const { hasPermissions, results, grantedPermissions } = useMultiplePermissions(
  [
    { action: 'read', subject: 'users' },
    { action: 'update', subject: 'users' },
  ],
  true, // requireAll = true → cần tất cả permissions
);
```

### `usePermissions(subject)`

Kiểm tra tất cả common permissions cho một subject.

```typescript
const permissions = usePermissions('users');
// { read: true, create: false, update: false, delete: false, export: true }
```

### `useCanAccessField({ subject, field, action? })`

Kiểm tra field-level permission.

```typescript
const canAccessEmail = useCanAccessField({
  subject: 'users',
  field: 'email',
  action: 'read', // optional, default: 'read'
});
```

### `useAllowedFields({ subject, action? })`

Lấy danh sách fields được phép access.

```typescript
const allowedFields = useAllowedFields({ subject: 'users', action: 'read' });
// ['id', 'username', 'email'] hoặc null nếu không có field restrictions
```

### `useFieldPermissions(subject, fields, action?)`

Kiểm tra permissions cho nhiều fields cùng lúc.

```typescript
const fieldPermissions = useFieldPermissions('users', ['email', 'phone', 'address']);
// { email: true, phone: false, address: false }
```

### `useGuard(action, subject)`

Guard hook redirect về /403 nếu user thiếu permission.

```typescript
// Trong component
useGuard('read', 'users'); // Redirect nếu không có permission
```

### `usePageGuard(action, subject, options?)`

Guard một page với permission checks và custom redirect.

```typescript
const { isAuthorized, isLoading } = usePageGuard('update', 'users', {
  redirectTo: '/dashboard', // optional, default: '/403'
});

// Hoặc check nhiều permissions
usePageGuard('read', 'all', {
  permissions: [
    { action: 'read', subject: 'users' },
    { action: 'update', subject: 'media' },
  ],
  requireAll: false, // Chỉ cần 1 trong các permissions
});
```

### `useMultiPageGuard(permissions, options?)`

Shorthand cho check nhiều permissions.

```typescript
useMultiPageGuard([
  { action: 'read', subject: 'users' },
  { action: 'update', subject: 'media' },
]);
```

## Usage Patterns

### Route Guard

```typescript
'use client';

import { useGuard } from '@/shared/hooks';

export default function UsersPage() {
  useGuard('read', 'users');

  return <div>Users List</div>;
}
```

### Conditional Rendering

```typescript
const { hasPermission } = useCan('update', 'users');

return (
  <div>
    {hasPermission && <Button>Edit User</Button>}
  </div>
);
```

### Field-Level Access Control

```typescript
const fieldPermissions = useFieldPermissions('users', ['email', 'phone', 'salary']);

return (
  <Form>
    {fieldPermissions.email && <Input name="email" />}
    {fieldPermissions.phone && <Input name="phone" />}
    {fieldPermissions.salary && <Input name="salary" />}
  </Form>
);
```

## Backend Contract

Permissions từ backend theo format `"resource:action"`:

```typescript
{
  "user": {
    "permissions": [
      "users:read",
      "users:create",
      "media:upload",
      "roles:manage"
    ]
  }
}
```

## See Also

- `@/shared/rbac` - CASL ability system
- `@/shared/rbac/types.ts` - Permission types và enums
- `PERMISSION_MIGRATION.md` - Migration guide từ enum-based sang string-based
