---
name: implement
description: >-
  Kỹ năng Thực thi Triển khai Mã nguồn & Chu trình Phản hồi Lập trình viên (Worker Implementation Loop,
  Cadence Testing & Typecheck). Kích hoạt tại Gate 2 (Wire-Up & Impl) khi Worker Subagent nhận Dispatch Packet
  (Spec/Tickets). Cưỡng chế quy trình thực thi kỷ luật: TDD tại pre-agreed seams, typecheck định kỳ thường xuyên,
  chạy single test file liên tục, chạy full suite ở cuối chặng, rà soát AST code review, và xác minh trước khi commit.
inputs:
  - path: "docs/specs/<feature>.prd.md"
    required: true
    description: "Đặc tả yêu cầu hoặc Dispatch Packet từ Gate 0/1"
outputs:
  - path: "src/**/<feature>.*"
    description: "Mã nguồn triển khai hoàn chỉnh đạt 100% typecheck và test pass"
tools:
  - view_file
  - write_to_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `implement` thiết lập nhịp điệu làm việc chuẩn mực cho Worker Subagent khi triển khai tính năng tại Gate 2 (Wire-Up & Impl). Thay vì thói quen xấu viết hàng trăm dòng code rồi mới kiểm tra dẫn đến bão lỗi runtime, kỹ năng cưỡng chế **Chu trình phản hồi vi mô (Micro-Cadence Feedback Loop)**:
1. Tiếp nhận phạm vi rõ ràng qua Dispatch Packet (Inputs, Outputs, Acceptance Criteria).
2. Phát triển hướng kiểm thử (TDD) tại các điểm tiếp giáp đã thống nhất (Pre-agreed Seams).
3. Nhịp điệu kiểm tra liên tục: Typecheck thường xuyên $\rightarrow$ Single test liên tục $\rightarrow$ Full test suite ở cuối chặng.
4. Rà soát chất lượng mã nguồn (Code Review & AST analysis) và xác minh cơ học toàn diện trước khi commit.

---

# Section 2: Decision Matrix

| Giai Đoạn Thực Thi | Hành Động & Nhịp Điệu Chuẩn | Điều Cấm (Anti-Pattern) | Kết Quả Bắt Buộc |
| :--- | :--- | :--- | :--- |
| **Tiếp nhận Spec / Ticket** | Đọc kỹ Dispatch Packet và `CONTEXT.md` để nắm vững ranh giới DTO và ngôn ngữ nghiệp vụ. | Nhảy vào code ngay khi chưa hiểu rõ ràng hợp đồng dữ liệu và tiêu chí nghiệm thu. | Xác định pre-agreed seams. |
| **Bắt đầu Lập trình Module** | Áp dụng TDD: Viết test đỏ tại seam trước (`spec-engineering-tdd`), sau đó viết code tối thiểu để pass. | Viết code xong xuôi mới viết test đối phó hoặc sửa test để ép code pass (Invariant 5). | Test đỏ $\rightarrow$ Code $\rightarrow$ Test xanh. |
| **Kiểm tra Kiểu Dữ liệu** | Chạy typecheck định kỳ thường xuyên (`tsc --noEmit`) sau mỗi thay đổi interface/DTO. | Bỏ qua typecheck, chỉ dựa vào phỏng đoán hoặc editor highlight. | 0 lỗi TypeScript (Exit Code 0). |
| **Chạy Test Khi Đang Code** | Chỉ chạy đúng single test file liên quan (`vitest run <file>` hoặc `jest <path>`) sau mỗi chỉnh sửa nhỏ. | Chạy toàn bộ test suite sau mỗi lần sửa 1 dòng code (lãng phí thời gian, đứt mạch tập trung). | Vòng lặp phản hồi $\le 3$ giây. |
| **Hoàn thành Triển khai** | Chạy full test suite, chạy `agentc verify`, và rà soát tác động phụ qua `wireup-review`. | Tự ý tuyên bố xong việc khi chưa chạy kiểm chứng cơ học toàn cục. | 100% Invariants PASS (Exit Code 0). |
| **Lưu trữ Mã nguồn** | Commit gọn gàng vào working branch hiện tại với thông điệp rõ ràng theo chuẩn Conventional Commits. | Để code uncommitted hoặc commit kèm log debug và file rác. | Clean Git Working Tree. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Phân Tích Dispatch Packet & Khóa Điểm Tiếp Giáp (Lock Seams):**
   - Rà soát các tệp đầu vào (`docs/specs/<feature>.prd.md`, `src/contracts/<feature>.contract.ts`).
   - Đối chiếu từ điển `CONTEXT.md` để dùng chính xác tên thực thể.
   - Xác định điểm tiếp giáp kiểm thử (Pre-agreed seam: Service method, Controller endpoint, hoặc Logic Hook).

2. **Khởi Tạo Failing Test (Red Phase):**
   - Viết bài kiểm thử đơn vị hoặc integration test độc lập tại seam đã chọn (`spec-engineering-tdd`).
   - Chạy single test để chứng kiến trạng thái **ĐỎ (Exit Code 1)**:
     ```bash
     npm test -- src/modules/<feature>/<feature>.service.spec.ts
     ```

3. **Triển Khai Mã Nguồn Tối Giản (Green Phase):**
   - Viết lượng mã nguồn vừa đủ để thỏa mãn bài test.
   - Tuân thủ cấu trúc Clean Architecture (`backend-clean-module`) hoặc 7-Zone (`frontend-unified-architecture`).
   - Tuyệt đối không thêm comment thừa vào mã nguồn mới (Invariant 31: Zero Comments).

4. **Nhịp Điệu Cadence Kiểm Tra Định Kỳ (Typecheck & Single Test):**
   - Sau mỗi khối logic hoặc chỉnh sửa DTO, chạy kiểm tra kiểu:
     ```bash
     npx tsc --noEmit
     ```
   - Chạy lại single test file để xác nhận trạng thái **XANH (Exit Code 0)**.

5. **Chạy Toàn Bộ Test Suite (Full Test Suite Run):**
   - Khi toàn bộ các seams đã xanh, chạy bộ kiểm thử toàn cục một lần ở cuối chặng:
     ```bash
     npm test
     ```
   - Xác nhận không có bài test cũ nào bị hồi quy (Zero Regressions).

6. **Rà Soát Chất Lượng & Xác Minh Cơ Học Toàn Diện:**
   - Kích hoạt rà soát tác động (`wireup-review`) để bảo đảm không rò rỉ barrel exports (Invariant 33) hoặc trang ma (Invariant 32).
   - Chạy lệnh kiểm tra Invariants:
     ```bash
     ./cli/agentc verify
     ```
   - Xác nhận đạt 100% Exit Code `0`.

7. **Khóa Mã Nguồn Vào Nhánh (Clean Commit):**
   - Ghi nhận commit vào branch làm việc với định dạng: `feat(<domain>): implement <feature-name> per spec`.

---

# Section 4: Mechanical Verification Checklist

- [ ] Bài test đơn vị tại pre-agreed seam được viết và chứng kiến trạng thái ĐỎ trước khi viết code.
- [ ] Lệnh `npx tsc --noEmit` trả về Exit Code `0` (không có lỗi kiểu).
- [ ] Single test file chuyển sang XANH sau khi triển khai mã nguồn.
- [ ] Full test suite chạy thành công 100% ở cuối chặng.
- [ ] Lệnh `./cli/agentc verify` trả về Exit Code `0` (Zero violations).
- [ ] Không có comment mới trong code (Invariant 31).
- [ ] Mã nguồn đã được commit an toàn vào working branch.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Đặc tả PRD, Contract DTOs và Dispatch Packet từ Orchestrator.
- **Đầu ra (Downstream Seam):** Mã nguồn hoàn thiện, test suite xanh, sạch Invariants, sẵn sàng cho `wireup-e2e-verification` và `actionable-security-audit`.
