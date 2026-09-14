---
name: verification-before-completion
description: >-
  Kỹ năng Chứng cứ Cơ học Trước khi Tuyên bố Hoàn thành (Mechanical Evidence Before Assertions).
  Kích hoạt bắt buộc trước khi tuyên bố hoàn thành bất kỳ nhiệm vụ nào, trước khi handoff giữa các gate,
  hoặc trước khi phát tín hiệu GOAL_COMPLETE. Nghiêm cấm mọi khẳng định cảm tính ("should work", "looks good").
  Bắt buộc thực thi lệnh kiểm tra tươi mới (Fresh Run), đọc Exit Code 0, và trích dẫn bằng chứng cơ học.
inputs:
  - path: "command:verification_target"
    required: true
    description: "Lệnh kiểm tra chứng minh cơ học (build, test, lint, verify-invariants)"
outputs:
  - path: "evidence:verification_proof"
    description: "Bằng chứng đầu ra với Exit Code 0, số test passed, và thời gian thực thi tươi mới"
tools:
  - run_command
  - view_file
---

# Section 1: Overview & Objective

Kỹ năng `verification-before-completion` thiết lập thiết quân luật về tính trung thực và bằng chứng thực nghiệm cho toàn bộ hệ thống. Mục tiêu là triệt tiêu vĩnh viễn hiện tượng agent "tự mãn cảm tính" (Delusional Self-Attestation) hoặc phán đoán "chắc là chạy được rồi" mà không thực sự bấm nút chạy lệnh trong môi trường máy chủ. Kỹ năng này bắt buộc mọi tuyên bố thành công phải đi kèm bằng chứng cơ học từ một lệnh chạy tươi mới (Fresh Run) có mã thoát Exit Code `0`.

---

# Section 2: Decision Matrix

| Tuyên Bố Thành Công | Bằng Chứng Cơ Học Bắt Buộc | Hành Vi Cấm Đoán (Red Flags) | Phán Quyết |
| :--- | :--- | :--- | :--- |
| **"Tests pass 100%"** | Output lệnh test hiển thị `0 failures` với Exit Code `0` được chạy trong lượt này. | Viện dẫn kết quả của lượt chạy trước, "code nhìn đúng chắc test sẽ pass". | REJECT nếu thiếu lệnh test tươi mới. |
| **"Build / Typecheck thành công"** | Output `npm run build` hoặc `tsc --noEmit` trả về Exit Code `0` không có lỗi. | Chỉ kiểm tra bằng mắt rồi đoán typecheck pass. | REJECT nếu không chạy tsc/build. |
| **"Đã sửa xong lỗi (Bug fixed)"** | Chạy lại đúng test case tái hiện bug và nhận kết quả PASS. | Sửa code xong tự suy đoán là hết lỗi mà không chạy lại test. | REJECT nếu không kiểm tra lại. |
| **"Kiến trúc hợp lệ (Invariants pass)"** | Output `bash scripts/verify-invariants.sh` trả về Exit Code `0`. | Tự đọc file rồi tự khẳng định tuân thủ đầy đủ invariants. | REJECT nếu không chạy script. |
| **"Hoàn thành toàn bộ mục tiêu"** | 100% các Gate đã pass cơ học, không còn tiến trình zombie, `<!-- GOAL_COMPLETE -->`. | Tuyên bố hoàn thành khi chưa kiểm tra lại toàn diện hệ thống. | REJECT nếu vi phạm Kernel Axiom 3. |

---

# Section 3: Step-by-Step Execution Protocol

1. **IDENTIFY (Xác Định Lệnh Chứng Minh):**
   - Xác định chính xác câu lệnh nào trong terminal sẽ chứng minh một cách không thể chối cãi rằng công việc đã hoàn thành (ví dụ: `bash scripts/verify-invariants.sh` hoặc `npm test`).

2. **RUN (Thực Thi Lệnh Tươi Mới):**
   - Chạy lệnh hoàn chỉnh trong terminal thông qua `run_command`.
   - Tuyệt đối không dùng kết quả cũ từ cache hoặc lượt trao đổi trước.

3. **READ (Đọc Toàn Bộ Output & Exit Code):**
   - Kiểm tra mã thoát của tiến trình: Exit Code phải chính xác bằng `0`.
   - Đếm số lượng failures/errors được thông báo trong terminal.

4. **VERIFY (Thẩm Định Bằng Chứng):**
   - Nếu Exit Code $\neq 0$: DỪNG LẠI. Không được phép tuyên bố hoàn thành. Nén log lỗi bằng `context-budgeting` và tiến hành sửa chữa.
   - Nếu Exit Code $= 0$: Trích dẫn bằng chứng cụ thể vào báo cáo handoff.

5. **CLAIM (Tuyên Bố Nghiệm Thu):**
   - CHỈ KHI ĐÓ mới được phép gửi thông điệp tuyên bố hoàn thành hoặc phát tín hiệu `<!-- GOAL_COMPLETE -->`.

---

# Section 4: Mechanical Verification Checklist

- [ ] Lệnh kiểm tra được chạy trong phiên làm việc hiện tại: Bằng chứng terminal log tươi mới.
- [ ] Exit Code của tiến trình kiểm tra là 0: `echo $?` trả về `0`.
- [ ] Không chứa bất kỳ cụm từ cảm tính nào trong báo cáo: Không có "probably", "should work", "seems fine".
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Mã nguồn, tệp kiểm thử, hoặc toàn bộ hệ thống sau thi công.
- **Đầu ra (Downstream Seam):** Bằng chứng cơ học có thể kiểm chứng độc lập, cho phép đóng Gate an toàn.
