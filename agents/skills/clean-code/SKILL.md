---
name: clean-code
description: >-
  Kỹ năng Lập trình Sạch theo Nguyên lý Clean Code của Robert C. Martin (Uncle Bob).
  Kích hoạt tại Gate 2 (Wire-Up & Impl) và Gate 3 (Security & Audit) khi viết code mới,
  thẩm định pull request hoặc tái cấu trúc nợ kỹ thuật. Cưỡng chế quy chuẩn đặt tên có chủ đích,
  hàm đơn nhiệm (Single Responsibility) một cấp độ trừu tượng (SLAP), bố cục tòa soạn báo (Newspaper Metaphor),
  triệt tiêu comment rác (Invariant 31) và xử lý ngoại lệ an toàn không null.
inputs:
  - path: "src/**"
    required: true
    description: "Mã nguồn đang phát triển, tệp diff hoặc module cần tái cấu trúc"
outputs:
  - path: "src/**"
    description: "Mã nguồn sạch, tự tài liệu hóa (self-documenting), không comment rác, tuân thủ 100% Invariants"
tools:
  - view_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `clean-code` chuyển hóa tư duy từ "viết code chạy được" (*code that works*) thành "viết code sạch, dễ đọc và bền vững" (*code that is clean*). Dựa trên triết lý của Robert C. Martin (Uncle Bob) và Grady Booch:
> *"Code is clean if it can be read, and enhanced by a developer other than its original author."*

Kỹ năng này thiết lập hệ thống chuẩn mực kỹ thuật định lượng cho lập trình viên và AI subagents:
1. **Tự tài liệu hóa (Self-Documenting):** Code tự bộc lộ rõ mục đích qua tên gọi và cấu trúc, loại bỏ hoàn toàn nhu cầu viết comment giải thích (Invariant 31).
2. **Đơn nhiệm & Đơn cấp độ trừu tượng (SRP & SLAP):** Mỗi hàm chỉ làm 1 việc và chỉ hoạt động ở một tầng trừu tượng duy nhất.
3. **Bố cục Tòa soạn Báo (The Newspaper Metaphor):** Cấu trúc file mã nguồn từ khái quát cấp cao đến chi tiết triển khai cấp thấp.
4. **Xử lý Ngoại lệ An toàn:** Ưu tiên Exceptions có ngữ cảnh, cấm return `null` và truyền `null` tùy tiện.

---

# Section 2: Decision Matrix

| Trụ Cột Kỹ Thuật | Dấu Hiệu Vi Phạm (Code Smells) | Quy Chuẩn Bắt Buộc (Clean Code Standard) | Hành Động Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Meaningful Names** | Tên viết tắt khó hiểu (`d`, `fn`), tên gây hiểu nhầm (`userList` nhưng là `Map`), tên mơ hồ (`Data`, `Info`). | Tên bộc lộ rõ mục đích (`elapsedDays`), lớp là danh từ (`PaymentProcessor`), phương thức là động từ (`processTransaction`). | Đổi tên biến/hàm/lớp mang tính biểu cảm cao, dễ grep tìm kiếm. |
| **Small Functions & SLAP** | Hàm dài quá 20 dòng, lồng ghép nhiều vòng lặp `if/else`, trộn lẫn business logic với regex/parsing. | Hàm $\le 20$ dòng, chỉ làm 1 việc duy nhất (Single Responsibility), duy trì Single Level of Abstraction (SLAP). | Trích xuất hàm con (Extract Method), chuyển chi tiết hạ tầng xuống helper riêng biệt. |
| **Arguments Count** | Hàm nhận $\ge 3$ tham số rời rạc hoặc cờ boolean (`flag: boolean`) điều khiển rẽ nhánh. | Hàm $0$ tham số là lý tưởng, $1-2$ tham số là chấp nhận được. Tuyệt đối cấm cờ boolean làm tham số. | Đóng gói tham số thành DTO/Value Object; tách hàm rẽ nhánh thành 2 hàm độc lập. |
| **Zero Comments (INV-31)** | Viết comment giải thích logic, comment mã cũ bị comment-out, hoặc header javadoc rỗng. | Mã nguồn tự giải thích (Self-documenting code). "Đừng comment code tồi — hãy viết lại nó". | Xóa comment, trích xuất điều kiện phức tạp thành hàm có tên rõ nghĩa. |
| **Newspaper Formatting** | Khai báo hàm helper chi tiết ở đầu file, hàm điều phối chính bị đẩy xuống đáy file. | Mô hình Tòa soạn Báo: Đỉnh file chứa hàm public điều phối cấp cao; đáy file chứa hàm private chi tiết. | Sắp xếp lại thứ tự khai báo theo chiều dọc từ trên xuống dưới (Step-down rule). |
| **Error Handling & Null** | Trả về error code âm, kiểm tra `null` rải rác khắp nơi, return `null` khi không tìm thấy dữ liệu. | Dùng Custom Exceptions thay vì error codes; không bao giờ return `null` hoặc truyền `null` vào tham số. | Ném Domain Exception hoặc trả về Null Object / mảng rỗng `[]`. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Đặt Tên Có Chủ Đích & Tự Tài Liệu Hóa (Intention-Revealing Naming):**
   - Đặt tên biến trả lời rõ: *Tại sao nó tồn tại? Nó làm gì? Nó được dùng như thế nào?*
   - Thay thế các biểu thức logic phức tạp bằng hàm kiểm tra mang tính khẳng định:
     ```typescript
     if (user.isEligibleForDiscount(currentDate)) {
       applyDiscount(user);
     }
     ```
   - Cấm thêm tiền tố hoặc hậu tố thừa thãi (`IUser`, `UserDTOType` khi ngữ cảnh đã rõ ràng).

2. **Áp Dụng Quy Tắc Bậc Thang (The Step-Down Rule & SLAP):**
   - Mỗi hàm chỉ xử lý logic tại một tầng trừu tượng duy nhất.
   - Các hàm đọc theo trình tự bậc thang từ trên xuống dưới:
     * Hàm A gọi hàm B.
     * Hàm B gọi hàm C.
     * Người đọc chỉ cần lướt qua các hàm trên cùng để hiểu toàn bộ luồng nghiệp vụ.

3. **Thực Thi Tách Rời Lệnh và Truy Vấn (Command Query Separation - CQS):**
   - Một hàm hoặc là thay đổi trạng thái của đối tượng (Command), hoặc là trả về thông tin (Query).
   - Tuyệt đối không vừa thay đổi dữ liệu ngầm vừa trả về kết quả gây ngộ nhận:
     ```typescript
     setRoleAndCheckStatus(role);
     ```
     Phải tách thành 2 thao tác rõ ràng:
     ```typescript
     assignRole(role);
     const isActive = verifyActiveStatus();
     ```

4. **Triệt Tiêu Null & Xử Lý Ngoại Lệ Chủ Động (Defensive Without Nulls):**
   - Tuyệt đối cấm trả về `null` từ các hàm tìm kiếm danh sách; luôn trả về mảng rỗng `[]`.
   - Nếu thực thể không tồn tại, ném `EntityNotFoundException` có ngữ cảnh cụ thể (ID, thời điểm) thay vì trả về `null`.
   - Bao bọc các lời gọi phụ thuộc ngoại vi bằng `try-catch` ngay tại ranh giới và chuyển đổi thành Domain Exceptions.

---

# Section 4: Mechanical Verification Checklist

- [ ] Tất cả tên biến, hàm, lớp bộc lộ rõ chủ đích và không dùng tên viết tắt vô nghĩa.
- [ ] 100% hàm có độ dài $\le 20$ dòng và chỉ thực hiện 1 trách nhiệm duy nhất (SRP).
- [ ] Mỗi hàm duy trì một cấp độ trừu tượng duy nhất (SLAP).
- [ ] Số lượng tham số hàm không vượt quá 2 (trường hợp $\ge 3$ đã đóng gói thành DTO/Object).
- [ ] Không có cờ boolean nào được dùng làm tham số rẽ nhánh hàm.
- [ ] Mã nguồn đạt chuẩn tự tài liệu hóa, 0 vi phạm Invariant 31 (Zero Comments).
- [ ] File được bố cục theo đúng quy tắc Tòa soạn Báo (Step-down rule).
- [ ] Không có hàm nào trả về `null` hoặc yêu cầu caller kiểm tra `null` thủ công.
- [ ] Lệnh kiểm tra kiến trúc cơ học `./cli/agentc verify` trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Đặc tả nghiệp vụ từ Gate 0/1 (`docs/specs/*.prd.md`), Dispatch Packet, hoặc mã nguồn cần refactor tại Gate 2/3.
- **Đầu ra (Downstream Seam):** Mã nguồn sạch, tự tài liệu hóa, đạt chuẩn kiểm thử và sẵn sàng cho thẩm định song song 2 trục (`code-review`).
