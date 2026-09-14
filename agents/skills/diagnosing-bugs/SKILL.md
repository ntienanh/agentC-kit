---
name: diagnosing-bugs
description: >-
  Kỷ luật Chẩn đoán & Xử lý Lỗi Khó, Suy giảm Hiệu năng và Bug Chập chờn (Hard Bugs, Flaky Issues & Performance Regressions).
  Kích hoạt tại Gate 2 hoặc Gate 3 khi hệ thống ném exception, test thất bại, retry count tăng cao, hoặc khi dev yêu cầu
  "diagnose / debug / fix bug". Cưỡng chế quy trình 6 giai đoạn nghiêm ngặt: Xây dựng feedback loop đỏ chặt chẽ trước,
  cô lập minimal repro, đặt 3-5 giả thuyết có thể bác bỏ, gắn thẻ vết [DEBUG-...], viết regression test trước khi sửa, và dọn sạch dấu vết.
inputs:
  - path: "log:error_trace"
    required: true
    description: "Thông báo lỗi, stack trace hoặc mô tả hành vi sai lệch từ người dùng"
outputs:
  - path: "tests/regression/<bug-name>.spec.ts"
    description: "Regression test khóa chặt hành vi lỗi tại seam chính xác trước khi vá mã nguồn"
tools:
  - view_file
  - write_to_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `diagnosing-bugs` thiết lập kỷ luật điều tra cơ học cho các lỗi phức tạp, lỗi chập chờn (flaky) và suy giảm hiệu năng (performance regressions). Tôn chỉ tối thượng: **Tuyệt đối không đọc mã nguồn để phỏng đoán lý thuyết khi chưa có một vòng phản hồi (Feedback Loop) đỏ chặt chẽ**. Mọi phán đoán cảm tính đều bị cấm. Kỹ năng dẫn dắt Agent qua 6 giai đoạn tuần tự, biến việc debug từ trò chơi may rủi thành một quy trình cơ học có thể kiểm chứng 100%, bảo vệ bí mật nhạy cảm qua cơ chế Redact, và khóa chặt lỗi bằng regression test trước khi cho phép sửa mã nguồn.

---

# Section 2: Decision Matrix

| Tình Huống / Dạng Bug | Giao Thức & Hành Động Chuẩn | Điều Cấm (Anti-Pattern) | Kết Quả Bắt Buộc |
| :--- | :--- | :--- | :--- |
| **Bug Logic / API Error** | Tạo Failing Test hoặc kịch bản `curl` chạy trong $\le 2$ giây. Phải đỏ trên đúng triệu chứng lỗi đó. | Nhảy vào sửa code ngay khi vừa đọc xong stack trace (Trial-and-error). | 1 lệnh kiểm thử đỏ lặp lại được. |
| **Bug Chập chờn (Flaky / Non-deterministic)** | Tăng tỉ lệ tái hiện bằng cách lặp 100 lần, ép chạy song song, thu hẹp timing window, ghim seed RNG. | Bỏ qua vì "chạy lại thấy xanh" hoặc đổ lỗi cho môi trường. | Repro rate $\ge 50\%$ để debug. |
| **Suy giảm Hiệu năng (Perf Regression)** | Đo lường baseline trước (`performance.now()`, profiler, query plan), sau đó bisection. | Rải `console.log` khắp nơi làm méo mó thời gian thực thi (Observer Effect). | Baseline đo lường định lượng. |
| **Bug UI / State Frontend** | Viết headless browser script (Playwright) assert trực tiếp DOM/Console/Network. | Đọc code JSX và đoán mò điều kiện re-render. | Script Playwright đỏ độc lập. |
| **Không thể tự tạo loop tự động** | Dừng lại, dùng `resources/hitl-loop.template.sh` để dẫn dắt dev qua terminal hoặc xin file HAR/dump. | Tự bịa dữ liệu giả rồi khẳng định "code không có lỗi". | Báo cáo rõ ràng lý do bế tắc. |
| **Dấu vết Debug sau khi vá lỗi** | Mọi log thăm dò bắt buộc gắn tag `[DEBUG-<id>]`. Sau khi fix xong, dùng grep gỡ sạch 100%. | Để sót log rác, breakpoint, hoặc mock data tạm thời trong production code. | Mã nguồn sạch sẽ, Zero debug logs. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Khử Dữ Liệu Nhạy Cảm (Redaction First):**
   - Trước khi in bất kỳ output, token hoặc header nào ra giao diện, thay thế bằng `<REDACTED>`.

2. **Phase 1: Xây Dựng Vòng Phản Hồi Đỏ (Build a Tight Feedback Loop):**
   - Xây dựng **một lệnh duy nhất** kích hoạt đúng nhánh mã lỗi và assert đúng triệu chứng:
     * *Thứ tự ưu tiên:* 1. Failing test $\rightarrow$ 2. Curl script $\rightarrow$ 3. CLI input fixture $\rightarrow$ 4. Playwright script $\rightarrow$ 5. Replay captured trace $\rightarrow$ 6. Throwaway harness $\rightarrow$ 7. Fuzz loop $\rightarrow$ 8. Git bisect $\rightarrow$ 9. HITL script.
   - *Tiêu chuẩn:* Chạy trong vài giây, xác định (deterministic), chạy tự động không cần người can thiệp.
   - **CẤM sang Phase 2 nếu chưa có lệnh này chuyển sang trạng thái ĐỎ (Exit Code 1).**

3. **Phase 2: Tái Hiện & Tối Thiểu Hóa (Reproduce + Minimise):**
   - Xác nhận lỗi tái hiện đúng triệu chứng người dùng mô tả (Wrong bug = Wrong fix).
   - Cắt gọt dần đầu vào, cấu hình, dữ liệu từng bước một cho đến khi đạt **kịch bản nhỏ nhất vẫn gây lỗi** (mọi thành phần còn lại đều là load-bearing).

4. **Phase 3: Thiết Lập 3–5 Giả Thuyết Có Thể Bác Bỏ (Falsifiable Hypotheses):**
   - Đưa ra 3–5 giả thuyết xếp theo độ ưu tiên trước khi thử nghiệm bất kỳ cái nào.
   - *Cấu trúc bắt buộc:* `"Nếu <X> là nguyên nhân, thì <thay đổi Y> sẽ làm bug biến mất / <thay đổi Z> sẽ làm lỗi nặng hơn."`
   - Hiển thị danh sách giả thuyết cho người dùng xem xét để tận dụng tri thức nghiệp vụ.

5. **Phase 4: Đo Đạc & Thăm Dò (Instrument):**
   - Thay đổi **đúng một biến số tại một thời điểm**.
   - Gắn tag định danh cho mọi log thăm dò: `[DEBUG-<hash>]` (ví dụ: `[DEBUG-f4a1]`).
   - Với lỗi hiệu năng: đo lường trước, sửa sau.

6. **Phase 5: Viết Regression Test & Khắc Phục (Fix + Regression Test):**
   - Chuyển minimal repro thành test case chính thức tại seam phù hợp trước khi sửa code.
   - Quan sát test đỏ $\rightarrow$ Áp dụng bản vá $\rightarrow$ Quan sát test xanh $\rightarrow$ Chạy lại Feedback loop gốc ở Phase 1.

7. **Phase 6: Dọn Dẹp Triệt Để (Cleanup):**
   - Chạy lệnh grep gỡ bỏ toàn bộ dòng chứa `[DEBUG-`.
   - Xóa các harness và tệp prototype tạm thời.
   - Ghi rõ giả thuyết đúng vào commit message để phục vụ bảo trì sau này.

---

# Section 4: Mechanical Verification Checklist

- [ ] Lệnh feedback loop ở Phase 1 đã chạy và phát hiện lỗi thành công (Red Signal).
- [ ] Kịch bản repro đã được tối thiểu hóa (Minimised).
- [ ] Tối thiểu 3 giả thuyết có khả năng bác bỏ được lập trước khi tiến hành sửa mã.
- [ ] Regression test được tạo tại seam chính xác và chuyển từ ĐỎ sang XANH sau khi sửa.
- [ ] Zero debug logs: Lệnh `grep -rn "DEBUG-" src/ tests/` không trả về kết quả nào.
- [ ] Feedback loop ban đầu chạy lại hoàn toàn sạch lỗi (Exit Code 0).

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Exception log, bug report từ người dùng hoặc cảnh báo test fail tại Gate 2/Gate 3.
- **Đầu ra (Downstream Seam):** Bản vá mã nguồn tối giản kèm regression test chuẩn, sẵn sàng cho `wireup-e2e-verification` và `post-mortem-analyzer`.
