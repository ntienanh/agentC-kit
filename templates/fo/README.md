# Front Office — Next.js 16 & shadcn/ui Starter Template

Starter Template chuẩn Doanh nghiệp cho cổng thông tin công khai và portal người dùng (Front Office / Client App) xây dựng trên **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS 4**, **Radix UI Primitives (shadcn/ui)**, **React Hook Form**, và **Zod**.

> **Dành cho AI Agents (Cursor, Claude, Antigravity):** Hãy đọc kỹ toàn bộ tài liệu này trước khi tạo hoặc chỉnh sửa bất kỳ trang/tính năng nào trong template.

---

## 🏛️ 1. Nguyên Tắc Kiến Trúc (Architecture & BFF Pattern)

```mermaid
flowchart TD
    subgraph CLIENT ["1. Client Layer (Browser)"]
        Pages["Next.js Pages & Client Components (src/app/...)"]
        ShadcnUI["shadcn/ui Primitives (Button, Input, Form, Dialog)"]
        Forms["React Hook Form + Zod Validation"]
    end

    subgraph BFF ["2. BFF Layer (Backend-For-Frontend)"]
        RouteHandlers["Next.js Route Handlers (src/app/api/*)"]
        Sanitizer["Error Sanitizer & Token Guard"]
    end

    subgraph BACKEND ["3. Backend API (NestJS)"]
        NestApi["NestJS API Endpoints (:4000)"]
    end

    Pages --> ShadcnUI
    Pages --> Forms
    Forms -->|fetch()| RouteHandlers
    RouteHandlers --> Sanitizer
    Sanitizer -->|Secure HTTP| NestApi
```

### Ranh giới kiến trúc:
1. **Mô hình BFF (Backend-For-Frontend)**:
   - Các Route Handler tại `src/app/api/**/route.ts` đóng vai trò là lớp đệm bảo vệ (BFF boundary).
   - Lớp này bọc các lệnh gọi tới NestJS Backend, xử lý cookie phiên làm việc an toàn, che giấu các chi tiết lỗi nội bộ và format lại dữ liệu phù hợp với Client.
2. **Chiến lược Component (shadcn/ui)**:
   - Toàn bộ component UI trong `src/components/ui/` là các headless primitives (Radix UI) được tùy biến phong cách với Tailwind CSS thông qua helper `cn()`.
   - Khi cần thêm component mới, sử dụng CLI: `npx shadcn@latest add <component-name>`.

---

## 🚫 2. Quy Tắc Bất Biến Cho AI Agent (Zero-Tolerance Rules)

1. **CẤM dùng `any`**: Sử dụng interface hoặc type suy luận từ Zod (`z.infer<typeof schema>`).
2. **Xác thực Form bằng Zod**: 100% biểu mẫu nhập liệu phải có Zod Schema rõ ràng, kết hợp `@hookform/resolvers/zod`.
3. **Đầy đủ 4 trạng thái giao diện**: Mọi luồng tương tác hoặc tải dữ liệu phải xử lý đủ:
   - **Loading**: Spinner hoặc Skeleton.
   - **Error**: Thông báo lỗi rõ ràng, có nút Thử lại (Retry) nếu an toàn.
   - **Empty**: Trạng thái dữ liệu trống thân thiện.
   - **Success**: Hiển thị kết quả hoặc thông báo Toast.
4. **Xử lý ClassName với `cn()`**: Luôn dùng hàm `cn(...)` từ `@/lib/utils` để gộp class Tailwind, tránh bị xung đột class CSS.
5. **Thiết kế Composition Patterns**: Tránh lạm phát boolean props (`hasHeader`, `showIcon`, `isCompact`). Ưu tiên Compound Components với Shared Context (`Card.Header`, `Card.Body`) và `children` hơn là `renderX` props.

---

## 📁 3. Cấu Trúc Thư Mục (Directory Anatomy)

```text
src/
├── app/
│   ├── (auth)/                 # Đăng nhập, đăng ký (/login, /register)
│   ├── api/                    # ⭐️ BFF Route Handlers
│   │   ├── auth/               # BFF Proxy cho xác thực
│   │   └── sample/             # ⭐️ REFERENCE BFF ROUTE (/api/sample)
│   ├── layout.tsx              # Root Layout, font, theme provider
│   ├── page.tsx                # Trang chủ (Landing page mẫu)
│   ├── error.tsx               # Error boundary
│   └── globals.css             # Tailwind 4 theme variables & styles
├── components/
│   ├── layout/                 # Header, Footer, Container
│   └── ui/                     # ⭐️ shadcn/ui components (Button, Input, Form, Card, Dialog...)
├── features/
│   └── auth/                   # Luồng xác thực người dùng
└── lib/
    ├── utils.ts                # Helper cn() (clsx + tailwind-merge)
    └── api-client.ts           # Client Fetch wrapper
```

---

## 🛠️ 4. Quy Trình Cho AI Agent Khi Tạo Luồng Mới (Step-by-Step)

1. **Định nghĩa Schema Validation (Zod)**:
   - Tạo file schema trong feature (ví dụ `contact.schema.ts`):
     ```ts
     import { z } from 'zod';
     export const ContactSchema = z.object({
       email: z.string().email(),
       message: z.string().min(10),
     });
     export type ContactFormValues = z.infer<typeof ContactSchema>;
     ```
2. **Tạo BFF Route Handler** (`src/app/api/contact/route.ts`):
   - Nhận POST request, parse body, gọi sang Backend NestJS, trả về kết quả chuẩn `{ data }` hoặc `{ error }`.
3. **Tạo Component Form**:
   - Sử dụng `useForm<ContactFormValues>({ resolver: zodResolver(ContactSchema) })`.
   - Kết hợp các primitive trong `src/components/ui/` (`Input`, `Button`, `Form`).
4. **Tạo Trang (Route Page)** (`src/app/contact/page.tsx`):
   - Đặt layout, tiêu đề và nhúng Form Component.

---

## ⌨️ 5. Cheat Sheet Lệnh Thực Thi

```bash
# Cài đặt thư viện
npm install

# Khởi chạy môi trường dev (cổng 3848)
npm run dev

# Thêm component shadcn mới
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu

# Kiểm tra TypeScript typecheck
npm run typecheck

# Chạy kiểm thử tự động
npm run test

# Build production
npm run build
```
