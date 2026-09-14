---
name: wireup-e2e-verification
description: >-
  Kỹ năng Kiểm thử Đối kháng & Thẩm định Nối dây Thực tế (True Black-Box Wire-Up E2E).
  Kích hoạt tại Gate 2 (Wire-Up) khi thẩm định chất lượng tích hợp giữa Backend và Frontend.
  Cưỡng chế Invariant 30: nghiêm cấm mock in-memory giả lập ("simulateHttpRequest"),
  bắt buộc kiểm thử API qua network socket thực tế (cURL / Supertest trên live OS port)
  và kiểm thử UI qua Headless Browser (Playwright) tương tác click/type thật trên cây visual DOM.
inputs:
  - path: "docs/specs/<feature>.prd.md"
    required: true
    description: "Đặc tả kịch bản Gherkin và tiêu chí nghiệm thu Acceptance Criteria"
  - path: "http://localhost:<port>"
    required: true
    description: "Tiến trình server thật đang lắng nghe trên cổng mạng OS"
outputs:
  - path: "docs/qa-evidence/<feature>-wireup-evidence.json"
    description: "Bằng chứng kiểm thử hộp đen thực tế gồm HTTP status, response payload và Playwright traces"
tools:
  - run_command
  - view_file
  - write_to_file
---

# Section 1: Overview & Objective

Kỹ năng `wireup-e2e-verification` đóng vai trò là "lò sát hạch sự thật" (The Ground Truth Gate) tại Gate 2. Mục tiêu là triệt tiêu hoàn toàn hiện tượng "ảo tưởng kiểm thử" (Test Illusion / LARPing) khi các agent tự tạo hàm mock trong bộ nhớ rồi tự xưng là E2E test. Kỹ năng này cưỡng chế Invariant 30: mọi bài test tích hợp phải được thực thi độc lập từ bên ngoài qua network socket thực tế hoặc trình duyệt headless tự động (Playwright) mở DOM thật.

---

# Section 2: Decision Matrix

| Đối Tượng Kiểm Thử | Phương Thức Bắt Buộc (True Black-Box) | Điều Cấm (Anti-Pattern / Mock Giả Lập) | Bằng Chứng Nghiệm Thu |
| :--- | :--- | :--- | :--- |
| **API Endpoints (Backend)** | Gửi HTTP request thực qua network socket (`curl -s -X POST http://localhost:4000/api/...`). | Tạo hàm mock `simulateRequest(req, res)` gọi trong bộ nhớ node process (Invariant 30). | HTTP 200/201, JSON envelope có `timestamp`, thời gian phản hồi $<200$ms. |
| **UI Flows & Pages (Frontend)** | Chạy Playwright Headless Browser: Mở page thật, click button thật, assert trên visual DOM tree. | Mount component bằng jsdom rồi tự kích hoạt `props.onClick()` và dán nhãn E2E. | Playwright trace, screenshot visual tree, URL chuyển hướng đúng. |
| **Kịch Bản Lỗi & Boundary** | Gửi payload thiếu trường hoặc sai định dạng để nhận đúng mã HTTP 400/422 kèm error envelope. | Bỏ qua việc kiểm thử các kịch bản lỗi biên trong PRD. | Response JSON chứa `errorCode` chuẩn ADR-007. |
| **Xử Lý Thất Bại Lần 1-2** | Kích hoạt `context-budgeting` nén log lỗi $\le 20$ dòng, chuyển giao cho Dev sửa đúng root cause. | Ném nguyên stack trace 300 dòng làm tràn token context của Dev Agent. | Gói ngữ cảnh lỗi tinh gọn $\le 2000$ tokens. |
| **Xử Lý Thất Bại Lần 3** | Kích hoạt Circuit Breaker, chuyển `deadlock-arbitration` cho Tech Lead làm trọng tài phán quyết. | Tiếp tục vòng lặp ping-pong vô tận giữa QC và Dev làm cạn kiệt token. | Biên bản phán quyết tối cao. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Khởi Động & Kiểm Tra Sức Khỏe Môi Trường (Pre-Flight Probing):**
   - Xác nhận tiến trình backend đang lắng nghe trên cổng OS: `nc -z 127.0.0.1 <port>` hoặc `curl -s http://localhost:<port>/health`.
   - Nạp dữ liệu hạt giống xác định (Deterministic Seed Data).

2. **Thực Thi Kiểm Thử API Socket Hộp Đen (API Black-Box):**
   - Lần lượt thực thi từng kịch bản Gherkin trong PRD bằng `curl`:
     ```bash
     curl -i -s -X POST http://localhost:4000/api/v1/players \
       -H "Content-Type: application/json" \
       -d '{"name":"Test User","email":"test@example.com"}'
     ```
   - Trích xuất HTTP Status Code, kiểm tra cấu trúc Envelope `ApiResponse<T>`, đo thời gian đáp ứng.

3. **Thực Thi Kiểm Thử UI Bằng Playwright Headless Browser:**
   - Chạy kịch bản người dùng thật trên trình duyệt không đầu:
     ```bash
     npx playwright test e2e/<feature>.spec.ts --reporter=line
     ```
   - Tương tác với form, nhấn nút submit, xác nhận trạng thái loading skeleton và dữ liệu hiển thị trên bảng.

4. **Biên Tập Bằng Chứng Nghiệm Thu (QA Evidence Artifact):**
   - Xuất bản kết quả ra tệp `docs/qa-evidence/<feature>-wireup-evidence.json` bao gồm:
     - Số kịch bản kiểm thử đã chạy và tỷ lệ thành công (100%).
     - Thời gian chạy từng request.
     - Xác nhận Exit Code `0`.

---

# Section 4: Mechanical Verification Checklist

- [ ] Lệnh kiểm tra chạy qua tiến trình thật trên port mạng OS, không qua in-memory mock: Exit Code `0`.
- [ ] 100% kịch bản Gherkin trong PRD đều có test tương ứng: `grep -c "Scenario:" docs/specs/<feature>.prd.md` khớp số test cases.
- [ ] File bằng chứng nghiệm thu được sinh ra: `test -f docs/qa-evidence/<feature>-wireup-evidence.json`.
- [ ] Không có assertion dựa trên cảm tính ("looks good", "should pass"): Toàn bộ assertions đều assert trên HTTP code hoặc DOM text.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `docs/specs/<feature>.prd.md`, Backend module đang chạy, và Frontend views.
- **Đầu ra (Downstream Seam):** `docs/qa-evidence/<feature>-wireup-evidence.json` mở khóa Gate 2 để bước sang Gate 3 (`actionable-security-audit`).
