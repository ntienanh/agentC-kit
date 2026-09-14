---
name: web-design-guidelines
description: >-
  Kỹ năng Thẩm định & Chuẩn hóa Thiết kế Giao diện Web theo Chuẩn mực Vercel (Web Interface Guidelines & WCAG AA).
  Kích hoạt tại Gate 1 (Design Review), Gate 2 (Wire-Up & Impl), và Gate 3 (UI Audit) khi xây dựng components,
  kiểm toán khả năng tiếp cận (a11y), trạng thái focus bàn phím, trải nghiệm biểu mẫu (Forms), chống giật layout (Zero CLS),
  và triệt tiêu layout thrashing để duy trì 60fps mượt mà.
inputs:
  - path: "src/app/**"
    required: true
    description: "Mã nguồn trang, layout hoặc giao diện người dùng cần thẩm định"
  - path: "src/components/**"
    required: true
    description: "Các components tương tác hoặc form controls"
outputs:
  - path: "src/**"
    description: "Giao diện người dùng chuẩn hóa WCAG AA, zero layout shift, trải nghiệm focus và form hoàn hảo"
tools:
  - view_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `web-design-guidelines` tích hợp bộ quy chuẩn chất lượng giao diện người dùng cao cấp được Vercel Labs đúc kết trong *Web Interface Guidelines*. Mục tiêu là đưa các tiêu chuẩn thiết kế web hiện đại vào quy trình tự động của AgentC-Kit:
1. **Khả năng tiếp cận phổ quát (Accessibility - WCAG AA):** Bảo đảm giao diện tương tác hoàn hảo với bàn phím và trình đọc màn hình (Screen Readers).
2. **Trạng thái Focus & Điều hướng Nhất quán:** Loại bỏ tình trạng mất focus ring khi click, ngăn thanh điều hướng che khuất phần tử đang tương tác.
3. **Trải nghiệm Biểu mẫu Tôn trọng Người dùng:** Không chặn paste, tự động điền (autocomplete) chuẩn xác, thông báo lỗi inline trực quan.
4. **Hiệu năng & Bền vững Bố cục (Zero CLS & 60fps):** Khai báo kích thước ảnh tường minh chống giật layout, ảo hóa danh sách lớn, và triệt tiêu layout thrashing.

---

# Section 2: Decision Matrix

| Hạng Mục Kiểm Toán | Dấu Hiệu Vi Phạm (UI Smells) | Quy Chuẩn Bắt Buộc (Vercel Guidelines) | Hành Động Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Accessibility (a11y)** | Nút bấm chỉ có icon thiếu nhãn; dùng `<div onClick>` thay vì `<button>` hoặc `<Link>`. | Icon-only button bắt buộc có `aria-label`; dùng `<button>` cho action, `<Link>` cho navigation. | Bổ sung `aria-label` hoặc chuyển sang thẻ HTML ngữ nghĩa chuẩn. |
| **Focus Rings** | Dùng `outline-none` / `outline: none` làm mất dấu vết con trỏ bàn phím; focus ring hiện khi click chuột. | Luôn có viền focus rõ ràng qua `focus-visible:ring-*`; dùng `:focus-visible` thay cho `:focus`. | Thêm `focus-visible:ring-2 focus-visible:ring-offset-2`, loại bỏ outline-none tự do. |
| **Forms & Paste** | Chặn sự kiện paste (`onPaste` + `preventDefault`); thiếu `autocomplete`; checkbox có dead zones. | Cho phép paste tự do; khai báo `autocomplete` chuẩn; nhãn và ô chọn chung 1 hit target. | Xóa handler chặn paste, thêm `autoComplete` và gắn `htmlFor` liên kết nhãn. |
| **Typography & Number** | Dùng ba dấu chấm `...`; số nhảy xê dịch độ rộng khi đếm; rớt chữ mồ côi ở tiêu đề. | Dùng ký tự chuẩn `…`; cột số dùng `tabular-nums`; tiêu đề dùng `text-wrap: balance` hoặc `text-pretty`. | Thêm class `tabular-nums`, thay `...` bằng `…`, áp dụng `text-balance`. |
| **Animation & Motion** | Dùng `transition: all` gây lag; animation không ngắt được khi user thao tác; phớt lờ giảm chuyển động. | Chỉ animate `transform`/`opacity`; tôn trọng `prefers-reduced-motion`; liệt kê cụ thể thuộc tính transition. | Thay `transition: all` bằng `transition-transform transition-opacity motion-reduce:transition-none`. |
| **Images & Layout Shift** | Thẻ `<img>` không có `width`/`height` gây giật layout (CLS); ảnh dưới trang không lazy load. | Luôn khai báo `width` và `height` rõ ràng; ảnh dưới nếp gấp dùng `loading="lazy"`. | Bổ sung thuộc tính kích thước tỉ lệ hoặc dùng Next.js `<Image>` tối ưu. |
| **Content Resilience** | Text dài làm vỡ layout Flexbox; không xử lý trạng thái chuỗi/mảng rỗng gây lỗi giao diện. | Thêm `min-w-0` vào flex children để kích hoạt `truncate`; hiển thị Empty State khi mảng rỗng. | Thêm `min-w-0 truncate` và render fallback component phù hợp. |
| **DOM Performance** | Đọc layout DOM (`offsetHeight`, `getBoundingClientRect`) liên tục trong vòng lặp render. | Gom cụm các thao tác đọc/ghi DOM; danh sách >50 phần tử phải áp dụng ảo hóa (Virtualization). | Chuyển layout measurement vào `useLayoutEffect` có debounced resize observer. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Rà Soát Ngữ Nghĩa & Khả Năng Tiếp Cận (Semantic & ARIA Audit):**
   - Kiểm tra toàn bộ các phần tử tương tác:
     * Nút chỉ chứa icon (như đóng modal, icon search) bắt buộc có `aria-label="Đóng"` hoặc `aria-label="Tìm kiếm"`.
     * Thay thế toàn bộ thẻ `div` hoặc `span` có gắn sự kiện click bằng thẻ `<button>` hoặc `<Link>`.
     * Icon trang trí gắn `aria-hidden="true"`.
     * Cập nhật bất đồng bộ (toast, banner) có `aria-live="polite"`.

2. **Thiết Lập Trạng Thái Focus Chuẩn (Focus Ring Hardening):**
   - Đảm bảo mọi input, button, link có lớp định dạng focus:
     ```html
     <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
     ```
   - Kiểm tra các phần tử sticky hoặc dialog overlay không đè lên phần tử đang được focus bởi bàn phím.

3. **Tối Ưu Trải Nghiệm Biểu Mẫu (Form Ergonomics):**
   - Gán `type` và `inputmode` chính xác (`email`, `tel`, `numeric`).
   - Đặt `spellCheck={false}` cho các trường nhạy cảm (mã OTP, username, email).
   - Kiểm tra đảm bảo không có logic nào chặn paste dữ liệu vào form.
   - Khi submit thất bại, tự động chuyển focus vào trường lỗi đầu tiên.

4. **Chống Giật Bố Cục & Tối Ưu Render (Zero CLS & Compositor Optimization):**
   - Khai báo kích thước hiển thị cố định hoặc `aspect-ratio` cho ảnh và video.
   - Thêm `min-w-0` cho các phần tử con nằm trong `flex` để cơ chế `truncate` hoạt động chính xác.
   - Đảm bảo các thuộc tính animation chỉ tác động lên `transform` và `opacity`.

---

# Section 4: Mechanical Verification Checklist

- [ ] 100% icon-only buttons có `aria-label` hợp lệ.
- [ ] Không có thẻ `<div onClick>` nào được sử dụng thay thế cho button/link (Invariant 32).
- [ ] Không có thuộc tính `outline-none` đơn độc nào thiếu lớp `focus-visible:ring-*` thay thế.
- [ ] Tuyệt đối không chặn sự kiện paste trên bất kỳ input form nào.
- [ ] Cột dữ liệu số hoặc đồng hồ đếm ngược sử dụng `tabular-nums`.
- [ ] Không có khai báo `transition: all` trong CSS / Tailwind classes.
- [ ] 100% thẻ ảnh có kích thước `width`/`height` rõ ràng hoặc container giữ chỗ (Zero CLS).
- [ ] Các phần tử con flexbox chứa text có khai báo `min-w-0` để chống tràn vỡ giao diện.
- [ ] Lệnh kiểm tra kiến trúc cơ học `./cli/agentc verify` trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Bản thiết kế UI từ Gate 0/1, mã nguồn component tại Gate 2, hoặc diff pull request tại Gate 3.
- **Đầu ra (Downstream Seam):** Giao diện người dùng đạt chuẩn WCAG AA, phản hồi mượt mà 60fps, sẵn sàng xuất xưởng (Gate 4: Pack & Ship).
