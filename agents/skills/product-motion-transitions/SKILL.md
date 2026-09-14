---
name: product-motion-transitions
description: >-
  Kỹ năng Thiết kế & Áp dụng Hệ thống Chuyển động Vi mô (Micro-Transitions & Motion Tokens per transitions.dev).
  Cung cấp Universal Motion Tokens Scale (Durations, Easings, Distances, Scales, Blurs) và 32 vi chuyển động
  chuẩn hóa namespaced dưới tiền tố `t-*`, loại bỏ triệt để `transition: all` và bảo đảm tuân thủ prefers-reduced-motion.
inputs:
  - path: "templates/fo/src/styles/transitions.css"
    required: true
    description: "Bộ token chuyển động toàn cục và 32 micro-transitions namespaced t-*"
  - path: "templates/fo/src/app/globals.css"
    required: true
    description: "Tệp CSS gốc tích hợp transitions.css vào ứng dụng"
outputs:
  - path: "templates/fo/src/styles/transitions.css"
    description: "CSS tokens và lớp tiện ích chuyển động vi mô"
  - path: "templates/fo/src/app/globals.css"
    description: "Tệp styles toàn cục đã tích hợp motion tokens"
tools:
  - view_file
  - replace_file_content
  - write_to_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `product-motion-transitions` thiết lập chuẩn mực công nghiệp cho hiệu ứng chuyển động vi mô (Micro-Interactions) trong Front Office dựa trên triết lý và hệ thống của `transitions.dev`. Kỹ năng này loại bỏ triệt để các chuyển động giật cục, thời lượng tùy tiện, và rủi ro hiệu năng do `transition: all` gây ra (gây layout thrashing và repaint toàn diện).

Mục tiêu cốt lõi:
1. **Universal Motion Tokens Scale:** Thống nhất các giá trị định lượng cho thời lượng (`--duration-*`), hàm làm mượt (`--ease-*`), khoảng dịch chuyển (`--distance-*`), tỷ lệ phóng thu (`--scale-*`), và độ nhòe (`--blur-*`).
2. **32 Micro-Transitions Namespaced:** Đóng gói 32 mẫu tương tác vi mô phổ biến dưới không gian tên `t-*` (từ `t-card-resize`, `t-number-pop` đến `t-thinking`, `t-streaming`, `t-banner`).
3. **Accessibility & Mechanical Compliance:** Cưỡng chế nghiêm ngặt chính sách `prefers-reduced-motion` nhằm bảo vệ người dùng nhạy cảm với chuyển động và cấm tuyệt đối `transition: all`.

---

# Section 2: Decision Matrix

| Tương Tác UI | Nhóm Chuyển Động | Token Khuyến Nghị | Lớp Tiện Ích `t-*` | Điều Cấm (Anti-Pattern) |
| :--- | :--- | :--- | :--- | :--- |
| **Hover & Active Phím Bấm** | Micro Scale & Shadow | `--duration-quick`, `--ease-smooth-out` | `.t-avatar`, `.t-like`, `.t-learn-more` | Dùng `transition: all` gây repaint layout. |
| **Mở Hộp Thoại & Popover** | Enter Scale & Fade | `--duration-medium`, `--ease-smooth-out` | `.t-modal`, `.t-dropdown`, `.t-tooltip` | Thời gian kéo dài > 400ms gây cảm giác trễ nải. |
| **Chuyển Tab & Chỉ Báo** | Slide & Width Morph | `--duration-fast`, `--ease-smooth-out` | `.t-tabs`, `.t-morph`, `.t-accordion` | Bỏ qua hardware acceleration (`will-change: transform`). |
| **Thay Đổi Số & Dữ Liệu** | Number Pop & Roll | `--duration-fast`, `--ease-bounce` | `.t-number-pop`, `.t-counter`, `.t-badge` | Thay đổi số đột ngột không qua chuyển cảnh. |
| **Phản Hồi Lỗi Nhập Liệu** | Horizontal Shake | `--duration-medium`, `--ease-in-out` | `.t-error-shake` | Đổi màu viền đơn điệu thiếu điểm nhấn thị giác. |
| **Tải Khung Xương (Skeleton)** | Subtle Pulse & Shimmer | `--duration-slow`, `--ease-linear` | `.t-skel`, `.t-shimmer`, `.t-matrix` | Dùng spinner toàn màn hình làm vỡ layout. |
| **Trạng Thái AI & Dòng Chảy** | Pulse, Glow & Stream | `--duration-stagger`, `--ease-out` | `.t-thinking`, `.t-reasoning`, `.t-streaming` | Render text giật cục không hiệu ứng làm mượt. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Bước 1: Khảo Sát & Nhận Diện Điểm Chuyển Động (`transitions reveal`)**
   - Rà soát các thành phần giao diện mục tiêu để xác định các tương tác vi mô cần thêm hiệu ứng:
     ```bash
     transitions reveal --target "templates/fo/src/components"
     ```
   - Lập danh mục các trạng thái: Hover, Focus, Active, Mounting, Unmounting, Data Mutation.

2. **Bước 2: Thẩm Định Hiệu Năng & Khả Năng Truy Cập (`transitions review`)**
   - Đánh giá chuyển động theo 3 nguyên tắc: Không gây jank (chỉ transform & opacity), thời lượng vừa phải ($\le 400\text{ms}$), và tôn trọng trợ năng:
     ```bash
     transitions review --file "templates/fo/src/styles/transitions.css"
     ```
   - Đảm bảo thuộc tính CSS chỉ tác động lên composite layer, không gây reflow/repaint không cần thiết.

3. **Bước 3: Tích Hợp Token & Gắn Lớp Chuyển Động (`transitions apply`)**
   - Nhập `transitions.css` vào điểm khởi nhập giao diện toàn cục:
     ```bash
     transitions apply --class "t-card-resize" --target "<Component>.tsx"
     ```
   - Sử dụng các biến token CSS chuẩn: `var(--duration-fast)`, `var(--ease-smooth-out)`.

4. **Bước 4: Tinh Chỉnh & Đồng Bộ Nhịp Điệu (`transitions refine`)**
   - Khử xung đột hoặc giật khung hình khi nhiều chuyển động diễn ra đồng thời:
     ```bash
     transitions refine --benchmark
     ```
   - Tinh chỉnh `--duration-stagger` cho danh sách phần tử liên hoàn (staggered items).

---

# Section 4: Mechanical Verification Checklist

- [ ] File `transitions.css` tồn tại và định nghĩa đầy đủ 7 tokens thời lượng (`--duration-*`).
- [ ] Định nghĩa đầy đủ 6 tokens hàm làm mượt (`--ease-*`) bao gồm bounce và smooth-out.
- [ ] Định nghĩa các tokens khoảng cách (`--distance-*`), tỷ lệ (`--scale-*`), và độ mờ (`--blur-*`).
- [ ] Toàn bộ 32 micro-transitions được khai báo đầy đủ dưới tiền tố `t-*`.
- [ ] Không có bất kỳ dòng nào chứa `transition: all`:
  ```bash
  ! grep -i "transition: all" templates/fo/src/styles/transitions.css
  ```
- [ ] Có khối `@media (prefers-reduced-motion: reduce)` kiểm soát toàn diện:
  ```bash
  grep -q "prefers-reduced-motion" templates/fo/src/styles/transitions.css
  ```
- [ ] `globals.css` đã import `@import "../styles/transitions.css";`.
- [ ] Kiểm tra kiểu và kiểm thử đơn vị thành công 100%:
  ```bash
  cd templates/fo && yarn typecheck && yarn test
  ```

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Token hệ thống từ `@repo/design-tokens` hoặc `templates/fo/src/styles/design-system.css`.
- **Đầu ra (Downstream Seam):** Tệp `templates/fo/src/styles/transitions.css` phục vụ trực tiếp cho các components tại `templates/fo/src/components/` và `templates/fo/src/shared/ui/`.
