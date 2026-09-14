---
name: deadlock-arbitration
description: >-
  Kỹ năng Trọng tài Phân xử Bế tắc & Kích hoạt Ngắt mạch (Tech Lead Single Arbiter & Circuit Breaker).
  Kích hoạt khi xảy ra tranh chấp hợp đồng giữa Backend và Frontend, ping-pong sửa lỗi quá 2 lần tại Gate 2,
  hoặc khi hệ thống kích hoạt Circuit Breaker (lần thử thứ 3). Cung cấp Thứ bậc Quyền lực 5 Cấp
  (Security > DBA > Tech Lead > PM > UI) và ban hành phán quyết kỹ thuật tối cao kèm ADR.
inputs:
  - path: "docs/specs/watchdog-audit.json"
    required: false
    description: "Báo cáo lệch đặc tả từ PM Watchdog hoặc lịch sử lỗi E2E"
  - path: "context:dispute"
    required: true
    description: "Bối cảnh tranh chấp hoặc log lỗi 3 lần thử thất bại"
outputs:
  - path: "docs/debates/arbitration-ruling.md"
    description: "Biên bản phán quyết dứt điểm của Trọng tài Tối cao kèm hướng khắc phục"
tools:
  - view_file
  - write_to_file
  - send_message
---

# Section 1: Overview & Objective

Kỹ năng `deadlock-arbitration` thực thi nguyên tắc "Trọng tài Chân lý Duy nhất" (Tech Lead Single Arbiter - Invariant 8). Khi quá trình thi công rơi vào vòng lặp bế tắc (deadlock), tranh chấp hợp đồng giữa các agent, hoặc vượt quá 2 lần sửa chữa không thành công tại Gate 2, Tech Lead lập tức can thiệp với thẩm quyền cao nhất để ra phán quyết kỹ thuật dứt điểm, phá vỡ bế tắc và bảo vệ tiến độ release mà không làm tổn hại đến tính toàn vẹn của hệ thống.

---

# Section 2: Decision Matrix

| Thứ Bậc Tranh Chấp | Lĩnh Vực / Xung Đột | Thẩm Quyền Phán Quyết | Hành Động Dứt Điểm |
| :--- | :--- | :--- | :--- |
| **Cấp 1: Security vs Bất kỳ ai** | Lỗ hổng bảo mật, Secret Leak, Privilege Escalation, injection. | **09-Security (VETO Tuyệt Đối)** | An ninh là tối thượng. Buộc sửa theo bản vá an ninh ngay lập tức. |
| **Cấp 2: DBA vs Backend** | Khóa bảng độc quyền, nguy cơ mất dữ liệu, deadlock DB, missing index. | **06-DBA (VETO Dữ Liệu)** | Bảo vệ ACID và Data Integrity. Buộc đổi giải pháp truy vấn/migration. |
| **Cấp 3: Tech Lead vs Dev Pods** | Kiến trúc Clean Architecture, DIP Tokens, God Barrels, Circular Dependency. | **02-Tech Lead (Trọng Tài Kiến Trúc)** | Khóa cấu trúc code, quyết định interface seam, ban hành phán quyết. |
| **Cấp 4: PM vs Kỹ thuật** | Scope phình to, chậm tiến độ, Appetite cạn kiệt. | **01-PM (Trọng Tài Phạm Vi)** | Cắt bớt tính năng (Scope Hammering), đẩy việc phụ sang Phase 2. |
| **Cấp 5: Design vs Frontend** | Giao diện, CSS tokens, bố cục 5 trạng thái UI. | **03-Design & 05-Frontend (UI/UX)** | Thống nhất trải nghiệm người dùng trong phạm vi API Contract đã khóa. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Nhận Diện Tín Hiệu Ngắt Mạch (Circuit Breaker Tripped):**
   - Kích hoạt ngay khi nhận được cảnh báo thất bại lần thứ 3 (`RETRY_COUNT >= 3`) từ Gate 2 Wire-Up E2E hoặc lượt thứ 3 của `SPEC_DRIFT_ALERT`.

2. **Tiến Hành Điều Tra Nhanh (Timeboxed Investigation $\le 10$ Phút):**
   - Đọc lịch sử bàn giao giữa hai bên tranh chấp qua `view_file`.
   - Áp dụng Thứ bậc Quyền lực 5 Cấp để xác định ranh giới ưu tiên cao nhất (Security > Data Integrity > Architecture > Scope).

3. **Ra Phán Quyết Tối Cao (Issuing the Binding Ruling):**
   - Soạn thảo biên bản `docs/debates/arbitration-ruling.md`.
   - Nêu rõ: Nguyên nhân gốc rễ (Root Cause), Bên được ưu tiên, Hành động sửa đổi bắt buộc cho bên còn lại, và thời hạn hoàn thành trong đúng 1 turn duy nhất.
   - Nếu phát sinh quyết định kiến trúc mới lâu dài, tiến hành tạo Architectural Decision Record (`docs/debates/ADR-xxx.md`).

4. **Khởi Động Lại Tiến Trình (Pipeline Unblocking):**
   - Phát thông điệp phán quyết qua `send_message` tới các bên liên quan.
   - Reset bộ đếm retry và cho phép luồng thực thi tiếp tục.

---

# Section 4: Mechanical Verification Checklist

- [ ] Biên bản phán quyết tồn tại: `test -f docs/debates/arbitration-ruling.md`.
- [ ] Phán quyết chỉ rõ bên chịu trách nhiệm và hành động 1-turn: `grep -q "Hành động bắt buộc" docs/debates/arbitration-ruling.md`.
- [ ] Thứ bậc quyền lực được tuân thủ nghiêm ngặt: Không có quyết định kiến trúc nào được phép phá vỡ an toàn dữ liệu hoặc an ninh.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Tín hiệu Circuit Breaker từ Gate 2 Wire-Up hoặc PM Watchdog Turn 3.
- **Đầu ra (Downstream Seam):** `docs/debates/arbitration-ruling.md` mở khóa luồng thi công cho Dev Agent và tiến vào kiểm thử.
