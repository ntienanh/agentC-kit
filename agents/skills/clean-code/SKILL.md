---
name: clean-code
description: >-
  Clean Coding Standards based on Robert C. Martin (Uncle Bob) principles.
  Enforces intention-revealing names, Single Responsibility (SRP), Single Level of Abstraction (SLAP),
  Newspaper Metaphor formatting, Zero Garbage Comments (Invariant 31), and robust exception handling.
inputs:
  - path: "src/**"
    required: true
    description: "Active codebase, diff files, or modules undergoing refactoring"
outputs:
  - path: "src/**"
    description: "Clean, self-documenting code without garbage comments, 100% mechanically compliant"
tools:
  - view_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

The `clean-code` skill elevates engineering from *code that works* to *code that is clean, readable, and maintainable*. Grounded in the philosophy of Robert C. Martin (Uncle Bob) and Grady Booch:
> *"Code is clean if it can be read, and enhanced by a developer other than its original author."*

This skill enforces quantitative technical standards for developers and AI subagents:
1. **Self-Documenting Code:** Code expresses its intent through naming and structure, eliminating explanatory comments (Invariant 31).
2. **Single Responsibility & SLAP:** Functions do one thing and operate at a single level of abstraction.
3. **Newspaper Metaphor:** Source files flow from high-level concepts down to low-level implementation details.
4. **Robust Exception Handling:** Prefer contextual Exceptions over error codes; forbid arbitrary `null` returns and parameters.

---

# Section 2: Decision Matrix

| Technical Pillar | Anti-Pattern (Code Smell) | Clean Code Standard | Technical Action |
| :--- | :--- | :--- | :--- |
| **Meaningful Names** | Cryptic abbreviations (`d`, `fn`), misleading names (`userList` for a `Map`), vague terms (`Data`, `Info`). | Intention-revealing names (`elapsedDays`), noun classes (`PaymentProcessor`), verb methods (`processTransaction`). | Rename symbols to expressive, grep-friendly identifiers. |
| **Small Functions & SLAP** | Functions > 20 lines, nested `if/else`, mixing business logic with parsing/regex. | Functions $\le 20$ lines, Single Responsibility (SRP), Single Level of Abstraction (SLAP). | Extract methods; push infrastructure details to dedicated helpers. |
| **Arguments Count** | Functions accepting $\ge 3$ parameters or boolean control flags (`flag: boolean`). | Ideal: 0 args, acceptable: 1-2 args. Forbid boolean flags as parameters. | Encapsulate parameters into DTOs/Value Objects; split branching flags into discrete functions. |
| **Zero Comments (INV-31)** | Explanatory comments, commented-out dead code, or empty Javadoc headers. | Self-documenting code. *"Don't comment bad code — rewrite it."* | Remove comments; extract complex expressions into well-named functions. |
| **Newspaper Formatting** | Low-level helpers at file top; main orchestration functions buried at bottom. | Newspaper Metaphor: High-level public functions at top; low-level private helpers at bottom. | Reorder function declarations vertically (Step-down rule). |
| **Error Handling & Null** | Returning negative error codes, scattered `null` checks, returning `null` when missing data. | Custom Domain Exceptions; never return or accept `null`. | Throw Domain Exception or return Null Object / empty array `[]`. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Intention-Revealing Naming:**
   - Name variables to answer: *Why does it exist? What does it do? How is it used?*
   - Replace complex conditions with expressive boolean functions:
     ```typescript
     if (user.isEligibleForDiscount(currentDate)) {
       applyDiscount(user);
     }
     ```
   - Avoid redundant prefixes or suffixes (`IUser`, `UserDTOType` when context is clear).

2. **Apply The Step-Down Rule & SLAP:**
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
