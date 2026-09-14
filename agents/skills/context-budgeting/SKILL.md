---
name: context-budgeting
description: >-
  Kỹ năng Nén Log Lỗi & Định Ngân sách Ngữ cảnh Tinh gọn (Context Budgeting & Log Compression).
  Kích hoạt tại Gate 2 (Wire-Up) khi kiểm thử E2E thất bại hoặc CI/CD gãy.
  Cưỡng chế Invariant 6: nén log lỗi còn tối đa 20 dòng và giới hạn ngân sách <= 2000 tokens,
  cô lập chính xác nguyên nhân gốc rễ (Root Cause) quanh các từ khóa Error/Failed/Exception,
  loại bỏ hoàn toàn rác stack trace và DOM dumps trước khi chuyển giao gói sửa lỗi.
inputs:
  - path: "log:raw_failure_output"
    required: true
    description: "Toàn bộ output thô từ test runner hoặc server logs"
outputs:
  - path: "context:clean_error_packet"
    description: "Gói ngữ cảnh lỗi tinh gọn <= 20 dòng (<= 2000 tokens) neo quanh root cause"
tools:
  - view_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `context-budgeting` bảo vệ cửa sổ ngữ cảnh của các tác tử khỏi nguy cơ "nổ token" (Token Explosion) và "mục rữa ngữ cảnh" (Context Rot). Mục tiêu là biến một khối log lỗi khổng lồ (200–500 dòng chứa rác DOM dumps, stack trace framework, và teardown queries) thành một Gói Lỗi Tinh Gọn (Clean Context Error Packet) dài tối đa 20 dòng và không quá 2000 tokens theo đúng Invariant 6, giúp developer nhìn thấy ngay điểm nghẽn thực sự để sửa chữa với diff nhỏ nhất.

---

# Section 2: Decision Matrix

| Dạng Log / Đầu Vào Lỗi | Phương Pháp Nén Bắt Buộc | Điều Cấm (Anti-Pattern) | Kết Quả Đạt Được |
| :--- | :--- | :--- | :--- |
| **Lỗi Test Runner (Vitest, Jest, Playwright)** | Quét tìm anchor keyword (`Error:`, `Failed:`, `Exception:`). Lấy 5 dòng trước + 15 dòng sau điểm lỗi đầu tiên. | Ném nguyên toàn bộ terminal output 300 dòng vào prompt agent sửa lỗi. | Đoạn trích $\le 20$ dòng tập trung vào assertion gãy. |
| **Playwright DOM Dump / HTML rác** | Loại bỏ toàn bộ cây HTML dump và base64 screenshots. Chỉ giữ lại selector gãy và URL. | Gửi kèm 10,000 tokens HTML dump khiến LLM bị phân tán chú ý. | Tinh gọn selector: `button[name="Submit"]`. |
| **Lỗi Crash Backend NestJS / Node** | Trích xuất exception name, thông điệp lỗi, và 3 dòng callstack thuộc về mã dự án (`src/`). | Giữ lại hàng chục dòng callstack nội bộ của `@nestjs/core` hay `express`. | Vị trí chính xác `file.ts:line`. |
| **Cắt gọt mù quáng bằng tail** | **CẤM DÙNG `tail -n 20` mù quáng.** Gốc rễ thường ở đầu trace, đuôi file chỉ là teardown log. | Lấy 20 dòng cuối file log không chứa thông tin lỗi. | Anchor-based windowing. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Xác Định Điểm Neo Nguyên Nhân Gốc Rễ (Anchor Discovery):**
   - Tìm số dòng xuất hiện lỗi đầu tiên qua biểu thức chính quy:
     ```bash
     grep -n -E -i "(error:|failed:|exception:|panic:|fatal:)" test.log | head -n 1
     ```

2. **Cắt Cửa Sổ Ngữ Cảnh 20 Dòng (Windowing Extraction):**
   - Lấy 4 dòng trước điểm neo và 16 dòng sau điểm neo.
   - Loại bỏ toàn bộ mã màu ANSI terminal: `sed 's/\x1b\[[0-9;]*m//g'`.

3. **Lọc Rác Stack Trace (Noise Filtering):**
   - Lọc bỏ các dòng chứa đường dẫn thư viện ngoài: `node_modules/`, `internal/process/`, `jest-circus/`.
   - Giữ lại duy nhất dòng code của ứng dụng gây lỗi.

4. **Đóng Gói Bàn Giao (Clean Error Packet):**
   - Tạo gói bàn giao tinh gọn cho `04-backend` hoặc `05-frontend`:
     - Phân hệ mục tiêu và kịch bản gãy.
     - Vị trí tệp và dòng code nghi vấn (`src/...:<line>`).
     - Đoạn log nén $\le 20$ dòng ($\le 800$ tokens).
     - Yêu cầu sửa đúng root cause với diff nhỏ nhất (theo triết lý `ponytail`).

---

# Section 4: Mechanical Verification Checklist

- [ ] Gói log lỗi không vượt quá 20 dòng: `wc -l` trên đoạn trích log $\le 20$.
- [ ] Tổng số từ / token ước tính không vượt quá 2000 tokens: `wc -w` $\le 1500$ words.
- [ ] Không chứa HTML DOM dump hay raw binary: Xác nhận nội dung thuần văn bản kỹ thuật.
- [ ] Đoạn trích bắt đúng điểm neo lỗi: Chứa từ khóa `Error`, `Failed`, hoặc `Exception`.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Output lỗi thô từ kiểm thử E2E hoặc build runner.
- **Đầu ra (Downstream Seam):** Gói ngữ cảnh lỗi tinh gọn gửi tới Dev Agent để sửa lỗi trong vòng lặp Gate 2.
