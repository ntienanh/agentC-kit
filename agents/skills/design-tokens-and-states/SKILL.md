---
name: design-tokens-and-states
description: >-
  Kỹ năng Thiết kế Design Tokens & Quy chuẩn 5 Trạng thái Giao diện (Design Tokens & 5-State UI Architecture).
  Kích hoạt khi thiết kế hoặc thẩm định giao diện UI, cấu hình bảng màu thương hiệu (Brand Palette),
  hoặc xây dựng components. Cung cấp Single Source of Truth cho Design Tokens (Invariant 38)
  và bao phủ trọn vẹn 5 trạng thái bắt buộc (Ideal, Empty, Skeleton Loading, Error, và Form/Overflow).
inputs:
  - path: "docs/specs/<feature>.prd.md"
    required: true
    description: "Đặc tả PRD với yêu cầu màn hình và dữ liệu hiển thị"
outputs:
  - path: "src/shared/styles/tokens.css"
    description: "Tệp CSS custom properties định nghĩa bảng Design Tokens SSOT"
  - path: "docs/specs/ui-states-spec.md"
    description: "Đặc tả 5 trạng thái giao diện và responsive layout cho các components"
tools:
  - view_file
  - write_to_file
---

# Section 1: Overview & Objective

Kỹ năng `design-tokens-and-states` loại bỏ hoàn toàn bẫy "chỉ thiết kế màn hình lý tưởng" và tình trạng mã màu tùy tiện rải rác trong mã nguồn. Mục tiêu là thiết lập một hệ thống Design Tokens duy nhất (Tokens SSOT per Invariant 38) điều phối bảng màu (OKLCH/CSS Variables), khoảng cách (spacing), độ bo góc (border-radius), và chuẩn hóa tài liệu đặc tả 5 trạng thái giao diện bắt buộc cho mọi component hiển thị dữ liệu.

---

# Section 2: Decision Matrix

| Trạng Thái / Yếu Tố UI | Chuẩn Mực Bắt Buộc | Điều Cấm (Anti-Pattern) | Hành Động Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Màu sắc & Tokens (Invariant 38)** | Dùng biến CSS hoặc semantic token classes (`bg-primary`, `text-status-error`). | Hardcode mã màu hex tự do (e.g. `#10b981`, `bg-emerald-500/10`) trong JSX. | Khai báo token tập trung tại `tokens.css`. |
| **1. Ideal State** | Hiển thị dữ liệu đầy đủ, căn lề chuẩn theo spacing tokens, hỗ trợ Dark Mode. | Bỏ qua việc cắt ngắn chuỗi dài (không xử lý text overflow). | Dùng truncate + tooltip cho text dài. |
| **2. Empty State** | Hiển thị minh họa SVG tinh gọn + dòng giải thích thân thiện + Nút CTA hành động. | Màn hình trắng tinh hoặc chỉ ghi dòng chữ "No data" đơn điệu. | Dựng `<EmptyState onAction={...} />`. |
| **3. Skeleton Loading** | Khung xương pulse (`animate-pulse`) mô phỏng đúng bố cục và số dòng của layout thật. | Dùng spinner xoay tròn toàn màn hình làm giật khung hình layout. | Dựng `<TableSkeleton />` hoặc `<CardSkeleton />`. |
| **4. Error / Failure State** | Hiển thị banner thông báo lỗi thân thiện (không lộ stack trace) + Nút `Thử lại` (Retry). | Không bắt lỗi khiến màn hình crash trắng trang (White Screen of Death). | Bọc trong `<ErrorBoundary />` với nút Retry. |
| **5. Form / Mutation State** | Disable submit button khi đang gửi request (`isPending`), hiển thị lỗi validation inline. | Cho phép người dùng click đúp (double-click submit) gây race condition. | Khóa nút bấm và gắn icon loading. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Khởi Tạo Bảng Design Tokens Tập Trung (Invariant 38):**
   - Thiết lập các giá trị gốc cho bảng màu thương hiệu (Brand Palette), trạng thái ngữ nghĩa (Success, Warning, Error, Info), font scale, và spacing scale tại `src/shared/styles/tokens.css` hoặc `@repo/design-tokens`.
   - Bảo đảm cả CMS và FO đều kế thừa chung giá trị gốc.

2. **Đặc Tả Danh Mục `TARGET_UI_MANIFEST`:**
   - Xác định rõ danh sách các components giao diện cần xây dựng cho tính năng trong file `docs/specs/ui-states-spec.md`.

3. **Thiết Kế Chi Tiết 5 Trạng Thái Giao Diện:**
   - *Loading:* Thiết kế khung Skeleton với tỷ lệ chiều rộng 60%, 80%, 100% khớp layout bảng thật.
   - *Empty:* Thiết lập icon minh họa, tiêu đề và nút CTA (ví dụ: *"Tạo bản ghi đầu tiên"*).
   - *Error:* Thông báo lỗi dễ hiểu kèm cơ chế retry hook.
   - *Success:* Layout bảng và card responsive trên màn hình mobile ([ADR-006]).
   - *Form:* Hiển thị thông báo lỗi validate inline và cờ `isPending`.

4. **Bàn Giao Cho Frontend:**
   - Chuyển giao đặc tả UI states để Frontend hiện thực hóa mà không cần suy đoán.

---

# Section 4: Mechanical Verification Checklist

- [ ] File tokens tồn tại và không chứa hex hardcode trong UI: `test -f src/shared/styles/tokens.css`.
- [ ] Không sử dụng class màu tùy tiện không thuộc bảng token: `node scripts/check-tokens.sh` (nếu có) hoặc grep kiểm tra.
- [ ] Đặc tả 5 trạng thái được ghi nhận đầy đủ: `grep -q "Empty State" docs/specs/ui-states-spec.md && grep -q "Skeleton" docs/specs/ui-states-spec.md`.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `docs/specs/<feature>.prd.md`.
- **Đầu ra (Downstream Seam):** `tokens.css` và `docs/specs/ui-states-spec.md` cung cấp hợp đồng giao diện cho `frontend-unified-architecture`.
