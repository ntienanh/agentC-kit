---
name: domain-i18n
description: >-
  Kỹ năng Quản trị Đa ngôn ngữ Phân rã theo Domain & Đồng bộ Từ điển (Domain-Scoped i18n & Parity).
  Kích hoạt khi thêm màn hình mới, bổ sung văn bản người dùng, thông báo lỗi, hoặc nhãn biểu mẫu.
  Cưỡng chế Invariant 36: cấm hardcode chuỗi thô trong TSX, cấm file từ điển đơn lẻ (God JSON),
  bắt buộc phân rã namespace theo domain messages/{locale}/{domain}.json, và duy trì đồng bộ 100% key giữa các ngôn ngữ.
inputs:
  - path: "messages/en/<domain>.json"
    required: true
    description: "Tệp từ điển gốc tiếng Anh cho phân hệ nghiệp vụ"
outputs:
  - path: "messages/vi/<domain>.json"
    description: "Tệp từ điển tiếng Việt đồng bộ 1-1 về mặt khóa (key parity)"
tools:
  - view_file
  - write_to_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `domain-i18n` thiết lập kỷ luật quốc tế hóa (i18n) sạch sẽ, bảo đảm mọi chuỗi văn bản hiển thị tới người dùng đều được bản địa hóa mà không làm phình to một tệp JSON khổng lồ duy nhất (God JSON). Kỹ năng này thực thi nghiêm ngặt Invariant 36: nghiêm cấm hardcode chuỗi tiếng Anh hoặc tiếng Việt thô trong mã nguồn TSX/JSX, phân rã từ điển theo không gian tên miền (Domain Namespaces), và bảo đảm sự cân bằng khóa đối xứng 1-to-1 giữa các ngôn ngữ hỗ trợ (`en`, `vi`).

---

# Section 2: Decision Matrix

| Kịch Bản Xử Lý Văn Bản | Quy Chuẩn Bắt Buộc | Điều Cấm (Anti-Pattern) | Hành Động Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Văn bản trong UI Component** | Gọi qua hook `const t = useTranslations('<domain>'); return <h1>{t('title')}</h1>`. | Hardcode chuỗi thô trong JSX (e.g. `<h1>Danh sách đơn hàng</h1>`). | Tạo key trong `messages/{en,vi}/<domain>.json`. |
| **Tổ chức tệp từ điển** | Tách theo domain: `messages/{locale}/player.json`, `messages/{locale}/wallet.json`. | Gom tất cả chuỗi toàn app vào 1 file `en.json` duy nhất (God JSON). | Phân rã tệp JSON theo tên feature. |
| **Thêm từ điển ngôn ngữ mới** | Khi thêm key vào `en/<domain>.json`, BẮT BUỘC thêm key tương ứng vào `vi/<domain>.json`. | Để sót key chưa dịch hoặc thừa key lạ gây lệch cấu trúc JSON (Drift). | Đồng bộ key đối xứng 100%. |
| **Thông báo lỗi xác thực form** | Sử dụng key dịch: `t('validation.required', { field: 'Email' })`. | Hardcode thông báo lỗi trong validation rule (e.g. `message: 'Vui lòng nhập'`). | Dùng localization token. |
| **Cú pháp JSON** | JSON hợp lệ, không có dấu phẩy thừa ở cuối (trailing commas), encoding UTF-8. | Cú pháp JSON lỗi làm sập runtime của `next-intl`. | Xác thực bằng JSON validator. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Khởi Tạo Tệp Từ Điển Theo Domain:**
   - Xác định domain của tính năng (ví dụ: `player`, `wallet`, `bonus`).
   - Tạo hai tệp đối xứng: `messages/en/<domain>.json` và `messages/vi/<domain>.json`.

2. **Định Nghĩa Các Khóa Có Cấu Trúc:**
   - Phân cấp khóa theo chức năng:
     ```json
     {
       "title": "Player Management",
       "filters": { "searchPlaceholder": "Search by name or email...", "status": "Status" },
       "actions": { "create": "New Player", "export": "Export CSV" },
       "table": { "columns": { "id": "ID", "name": "Full Name", "status": "Status", "actions": "Actions" } },
       "validation": { "required": "This field is required." }
     }
     ```

3. **Tiêu Thụ Trong Presentation Component:**
   - Trong React Component:
     ```tsx
     import { useTranslations } from 'next-intl';
     export function PlayerHeader() {
       const t = useTranslations('player');
       return <h1>{t('title')}</h1>;
     }
     ```

4. **Xác Minh Tính Toàn Vẹn & Đồng Bộ Cặp Khóa:**
   - Chạy script kiểm tra cơ học để so sánh cấu trúc cây JSON giữa `en` và `vi`.

---

# Section 4: Mechanical Verification Checklist

- [ ] Không có file bị thiếu: Mọi file trong `messages/en/` đều có mặt trong `messages/vi/`.
- [ ] Khớp 100% các khóa (Key Parity): `node scripts/check-i18n-parity.mjs` trả về Exit Code `0`.
- [ ] Không chứa lỗi cú pháp JSON: Toàn bộ tệp `.json` parse thành công không lỗi cú pháp.
- [ ] Không hardcode chuỗi thô trong JSX: Quét source `src/` không phát hiện chuỗi văn bản không qua `t(...)`.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Thuật ngữ nghiệp vụ trong PRD và kịch bản người dùng.
- **Đầu ra (Downstream Seam):** Các tệp `messages/{en,vi}/<domain>.json` đồng bộ hoàn hảo, cung cấp bản địa hóa cho `frontend-unified-architecture`.
