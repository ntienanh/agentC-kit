---
name: vercel-composition-patterns
description: >-
  Kỹ năng Kiến trúc Thành phần Giao diện theo Chuẩn mực Composition của Vercel và React 19.
  Cưỡng chế mô hình Compound Components, Slots Pattern (asChild), Headless UI Primitives,
  phân định nghiêm ngặt Server/Client Components, và áp dụng quy tắc Chống Monolithic Components
  (giới hạn <= 150 dòng cho mỗi tệp giao diện, phân rã màn hình phức tạp thành các sub-components độc lập).
inputs:
  - path: "src/**"
    required: true
    description: "Mã nguồn giao diện Frontend"
outputs:
  - path: "src/components/**"
    description: "Các thành phần UI dạng Compound modular, không monolithic"
  - path: "src/shared/ui/**"
    description: "UI primitives tuân thủ slots pattern và compound sub-components"
tools:
  - view_file
  - replace_file_content
  - write_to_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `vercel-composition-patterns` loại bỏ triệt để vấn đề "Monolithic Component Bloat" (những file component phình to 300-600 dòng gánh vác mọi logic, giao diện, và re-render giật lag) thường gặp khi AI Agent sinh mã nguồn Frontend.

Dựa trên triết lý thiết kế của Vercel Core Team và Radix UI:
> *"Favor composition over configuration. Build small, focused components that do one thing well and compose them together."*

Mục tiêu kỹ thuật cốt lõi:
1. **Compound Components Pattern:** Cung cấp API linh hoạt dạng cây ghép (`Modal.Root`, `Modal.Trigger`, `Modal.Content`, `Modal.Footer`, `Modal.Close`) chia sẻ ngữ cảnh ngầm định qua React Context, triệt tiêu Prop Drilling.
2. **Slots Pattern (`asChild`):** Sử dụng `@radix-ui/react-slot` để chuyển giao props và hành vi sang thẻ con trực tiếp, không tạo ra các thẻ `div` bọc ngoài gây rác DOM hay vỡ layout CSS.
3. **Quy tắc Chống Monolithic Components (Line Budget <= 150 lines):** Bắt buộc mọi tệp component UI chỉ tập trung hiển thị, không vượt quá 150 dòng mã nguồn. Các màn hình lớn phải phân rã thành các khối sub-components độc lập.
4. **Phân Tách Server vs. Client Components:** Giữ Server Component ở tầng route và container cấp cao nhất để render tĩnh/stream; chỉ đánh dấu `'use client'` tại các nút lá tương tác.

---

# Section 2: Decision Matrix

| Kỹ Thuật Composition | Dấu Hiệu Vi Phạm (Anti-Pattern) | Chuẩn Mực Vercel Composition | Hành Động Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Compound Components** | Một component nhận 15-20 props cấu hình (`showTitle`, `footerAction`, `headerIcon`, `isDismissible`, ...). | Chia nhỏ thành họ component ghép (`<Card.Header>`, `<Card.Title>`, `<Card.Content>`, `<Card.Footer>`). | Trích xuất các khối giao diện thành sub-components, chia sẻ state nội bộ bằng Context nếu cần. |
| **Slots & asChild** | Truyền cờ `isLink={true}` hoặc prop `href` vào `<Button>` để render thẻ `<a>` thay vì `<button>`, sinh `div` bọc lồng nhau. | Sử dụng prop `asChild` của Radix Slot để hợp nhất hành vi trực tiếp vào component con (`<Button asChild><Link href="...">...</Link></Button>`). | Cài đặt và tích hợp `@radix-ui/react-slot` vào các UI primitives. |
| **Component File Size** | Tệp component dài > 200 dòng, chứa cả form input, danh sách bảng, modal xác nhận trong 1 file duy nhất. | **Line Budget <= 150 lines/file**. Mỗi tệp chỉ đảm nhận một phần tử giao diện hoặc bố cục. | Tách các khối con thành các tệp riêng biệt trong cùng thư mục component (ví dụ: `UserFormHeader.tsx`, `UserFormFields.tsx`). |
| **Server/Client Boundary** | Đặt `'use client'` ngay tại root `page.tsx` khiến toàn bộ cây component bên dưới mất khả năng Server Rendering. | Giữ `page.tsx` là Server Component để tận dụng streaming và fetch dữ liệu ban đầu. Đẩy `'use client'` xuống các lá tương tác. | Di chuyển state và handler xuống Client Component lá (`UserActionButtons.tsx`, `UserFilterForm.tsx`). |
| **Children over Render Props** | Sử dụng prop callback phức tạp `renderHeader={() => ...}` hoặc `renderFooter={() => ...}`. | Ưu tiên dùng `children` và JSX composition tự nhiên thay cho render callbacks. | Thay `renderItem={item => ...}` bằng component con nhận trực tiếp `children`. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Bước 1: Thiết Kế Compound Component Cấu Trúc**
   - Khởi tạo Context nội bộ và các sub-components có trách nhiệm rõ ràng:
     ```tsx
     interface CardContextValue {
       density: 'compact' | 'comfortable';
     }
     const CardContext = React.createContext<CardContextValue | null>(null);

     export function CardRoot({ density = 'comfortable', children, className }: CardRootProps) {
       return (
         <CardContext.Provider value={{ density }}>
           <div className={cn('rounded-xl border bg-card text-card-foreground', className)}>
             {children}
           </div>
         </CardContext.Provider>
       );
     }

     export function CardHeader({ children, className }: CardHeaderProps) {
       return <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>;
     }

     export function CardContent({ children, className }: CardContentProps) {
       return <div className={cn('p-6 pt-0', className)}>{children}</div>;
     }
     ```

2. **Bước 2: Triển Khai Slots Pattern với `asChild`**
   - Kế thừa hành vi từ `@radix-ui/react-slot` để người dùng component có thể thay đổi thẻ HTML gốc mà không làm hỏng styles:
     ```tsx
     import { Slot } from '@radix-ui/react-slot';

     export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
       asChild?: boolean;
     }

     export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
       ({ asChild = false, className, ...props }, ref) => {
         const Comp = asChild ? Slot : 'button';
         return <Comp ref={ref} className={cn('inline-flex items-center ...', className)} {...props} />;
       }
     );
     ```

3. **Bước 3: Phân Rã Monolithic Component Đạt Chuẩn Line Budget**
   - Khi một màn hình hoặc form có xu hướng dài quá 150 dòng:
     - Tạo thư mục riêng cho tính năng: `features/<feature>/components/<component-name>/`.
     - Tách thành các tệp chuyên biệt:
       - `index.ts`: Barrel xuất khẩu chính thức.
       - `<Name>Shell.tsx`: Khung bố cục tổng thể.
       - `<Name>Form.tsx`: Vùng nhập liệu.
       - `<Name>Actions.tsx`: Các nút hành động submit/cancel.

---

# Section 4: Mechanical Verification Checklist

- [ ] Tất cả tệp component UI mới đều có độ dài <= 150 dòng (loại trừ tệp cấu hình DTO hoặc test spec).
- [ ] Không có component nào nhận quá 7 props điều khiển hiển thị (nếu quá 7 props, bắt buộc chuyển sang Compound Components).
- [ ] Mọi UI primitives tương tác chính đều hỗ trợ prop `asChild` để tương thích linh hoạt với `next/link`.
- [ ] Tệp `page.tsx` cấp root không chứa chỉ thị `'use client'` trừ khi toàn bộ route đó là một client-side canvas.
- [ ] `./cli/agentc verify` trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Upstream:** Tiếp nhận yêu cầu giao diện từ Gate 0 (`docs/specs/*.prd.md`) và DTO từ Gate 1 (`@repo/contracts`).
- **Downstream:** Chuyển giao các compound components hoàn chỉnh cho Gate 2 (Wire-Up & Test) và Gate 3 (Code Review).
