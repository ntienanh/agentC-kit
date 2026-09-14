# Error Handling System

Hệ thống quản lý error codes tập trung cho toàn bộ ứng dụng.

## Cấu trúc

```
src/shared/lib/error/
├── error-codes.ts          # Định nghĩa tất cả error codes
├── get-error-message.ts    # Utility functions để get error message
└── index.ts                # Export tất cả
```

## Error Codes

Tất cả error codes được định nghĩa flat trong `messages/[locale]/error.json`:

```json
{
  "AUTH_EMAIL_REQUIRED": "Email is required.",
  "AUTH_EMAIL_INVALID": "Invalid email format.",
  "AUTH_PASSWORD_MIN_LENGTH": "Password must be at least 8 characters."
}
```

## Usage

### 1. Server Actions

```typescript
'use server';

import { AUTH_ERROR_CODES } from '@/shared/lib/error';

interface ActionState {
  errorCode?: string;
  success?: boolean;
}

export async function myAction(email: string): Promise<ActionState> {
  if (!email) {
    return { errorCode: AUTH_ERROR_CODES.EMAIL_REQUIRED };
  }

  try {
    // Do something
    return { success: true };
  } catch (error) {
    return { errorCode: AUTH_ERROR_CODES.LOGIN_FAILED };
  }
}
```

### 2. Client Components

```typescript
'use client';

import { myAction } from './actions';
import { getErrorMessageClient } from '@/shared/lib/error';
import { useTranslations } from 'next-intl';
import { message } from 'antd';

export function MyComponent() {
  const t = useTranslations('error');

  const handleSubmit = async (email: string) => {
    const result = await myAction(email);

    if (result.errorCode) {
      // Translate error code to message
      const errorMessage = getErrorMessageClient(result.errorCode, t);
      message.error(errorMessage);
      return;
    }

    if (result.success) {
      message.success('Success!');
    }
  };

  return <button onClick={() => handleSubmit('test@example.com')}>Submit</button>;
}
```

### 3. Server Components (nếu cần)

```typescript
import { getErrorMessage, AUTH_ERROR_CODES } from '@/shared/lib/error';

export default async function MyServerComponent() {
  const errorMessage = await getErrorMessage(AUTH_ERROR_CODES.EMAIL_REQUIRED);
  
  return <div>{errorMessage}</div>;
}
```

## Available Error Code Groups

- `HTTP_ERROR_CODES` - HTTP status errors (400, 401, 403, 404, etc.)
- `AUTH_ERROR_CODES` - Authentication & authorization errors
- `VALIDATION_ERROR_CODES` - Input validation errors
- `RESOURCE_ERROR_CODES` - Resource CRUD errors
- `FILE_ERROR_CODES` - File upload/download errors
- `EXTERNAL_ERROR_CODES` - External service errors
- `GENERIC_ERROR_CODES` - Generic errors

## Best Practices

1. **Always use error codes** thay vì hardcode messages
2. **Log errors** ở server-side để debug
3. **Don't expose sensitive info** trong error messages
4. **Use generic messages** cho security-sensitive operations (forgot password, login)
5. **Type-safe** - sử dụng TypeScript types từ `ErrorCode`

## Data/Error Contract (Frontend Standard)

Chuẩn thống nhất cho toàn FE:

- **Single source of truth**
  - `src/shared/lib/http/contract.ts`
    - `unwrapApiResponse(...)`: unwrap `ApiResponse<T>` hoặc throw `AppError` chuẩn.
  - `src/shared/lib/error/app-error.ts`
    - `normalizeApiError(...)`: normalize unknown/api error về shape `{ code, message, details }`.

- **Không xử lý ad-hoc ở hooks/components**
  - Không lặp lại pattern `if (response.error)`, `if (!response.data)`, hoặc tự `throw new AppError(...)` cho API response.
  - Dùng `unwrapApiResponse(...)` để fail-fast và thống nhất trace.

- **Fallback codes chuẩn**
  - Network failure: `NETWORK_ERROR`
  - Request timeout: `REQUEST_TIMEOUT`
  - Các fallback business code khác: truyền rõ vào `unwrapApiResponse(response, 'FEATURE_FAILED_CODE')`.

- **Abort semantics**
  - User-cancelled request (AbortSignal từ caller) phải được giữ là `AbortError` để TanStack Query xử lý cancellation đúng.
  - Chỉ timeout thực sự mới map về `REQUEST_TIMEOUT`.

- **UI error layer**
  - UI layer chỉ translate/render từ error code/message đã normalize (`resolveErrorMessage`, `showErrorMessage`).
  - Tránh duplicate thông báo giữa local handling và global handling.

## Local vs Global Error UI

Sử dụng đúng layer để tránh duplicate toast/notification:

- **Local (`showErrorMessage` / `resolveErrorMessage` / `message.error`)**
  - Dùng cho expected business errors trong user action cụ thể (submit form, create/update/delete, permission update).
  - Ưu tiên khi cần fallback code theo ngữ cảnh (`USER_UPDATE_FAILED`, `ROLE_CREATE_FAILED`, ...).

- **Global (`ErrorContext` + `ErrorNotification`)**
  - Dùng cho unhandled/unexpected errors ở mức cross-cutting.
  - Global mutation fallback đi qua `QueryClientWrapperProvider` → `ErrorContext` → `ErrorNotification`.

- **Rule quan trọng**
  - Một lỗi chỉ nên hiển thị ở **một layer**.
  - Nếu đã handle local rõ ràng, không show lại ở global cho cùng lỗi đó.

## Adding New Error Codes

1. Thêm vào `messages/en/error.json`:
```json
{
  "MY_NEW_ERROR": "My new error message"
}
```

2. Thêm vào `error-codes.ts`:
```typescript
export const MY_ERROR_CODES = {
  NEW_ERROR: 'MY_NEW_ERROR',
} as const;
```

3. Thêm vào `ERROR_CODES`:
```typescript
export const ERROR_CODES = {
  ...MY_ERROR_CODES,
  // ...
} as const;
```

4. Sử dụng:
```typescript
import { MY_ERROR_CODES } from '@/shared/lib/error';

return { errorCode: MY_ERROR_CODES.NEW_ERROR };
```
