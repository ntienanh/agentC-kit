---
name: actionable-security-audit
description: >-
  Kỹ năng Kiểm định An ninh & Cung cấp Bản vá Khắc phục Thực thi (Actionable Security Audit & Patch Remediation).
  Kích hoạt tại Gate 3 (Security & Audit) để rà soát mã nguồn trước khi xuất xưởng.
  Thực hiện phân tích tĩnh SAST, phát hiện rò rỉ bí mật (Secret Leaks), kiểm tra OWASP Top 10,
  và cưỡng chế Invariant 9: nghiêm cấm phủ quyết suông (Empty Veto); mọi cảnh báo bảo mật
  bắt buộc phải đi kèm bản vá khắc phục cụ thể dạng unified diff (.patch).
inputs:
  - path: "src/**"
    required: true
    description: "Toàn bộ mã nguồn dự án cần quét an ninh"
outputs:
  - path: "docs/security/security-report.md"
    description: "Báo cáo kiểm toán bảo mật chi tiết theo chuẩn OWASP"
  - path: "docs/security/remediation.patch"
    description: "Bản vá khắc phục lỗ hổng dạng unified diff (bắt buộc khi phát hiện lỗi)"
tools:
  - run_command
  - view_file
  - write_to_file
---

# Section 1: Overview & Objective

Kỹ năng `actionable-security-audit` bảo đảm tính an toàn bảo mật tuyệt đối cho hệ thống tại Gate 3 mà không làm tắc nghẽn dòng chảy phát triển phần mềm. Mục tiêu là phát hiện sớm các lỗ hổng Injection, rò rỉ khóa bí mật, thiếu phân quyền RBAC, và thư viện lỗi thời. Kỹ năng này cưỡng chế Invariant 9: an ninh phải mang tính hành động (Actionable Remediation) — mọi lệnh Phủ Quyết (VETO) đối với code bắt buộc phải cung cấp kèm theo tệp bản vá `.patch` sẵn sàng áp dụng.

---

# Section 2: Decision Matrix

| Hạng Mục Rà Soát | Tiêu Chí Phát Hiện Lỗ Hổng | Hành Động Bắt Buộc Khi Vi Phạm | Yêu Cầu Bản Vá (Invariant 9) |
| :--- | :--- | :--- | :--- |
| **1. Lộ Dữ Liệu Nhạy Cảm (Data Leak)** | Response DTO trả về `passwordHash`, `salt`, `secretKey`, hoặc số thẻ tín dụng trần. | **VETO Gate 3.** Lọc bỏ trường nhạy cảm bằng DTO sanitizer hoặc `@Exclude()`. | Cung cấp file `.patch` bóc tách trường rò rỉ. |
| **2. Bí Mật Hardcode (Secret Leak)** | Hardcode API keys, JWT secret, DB password trong mã nguồn hoặc git history. | **VETO Gate 3.** Chuyển sang biến môi trường (`process.env`) và vô hiệu hóa key cũ. | Cung cấp `.patch` thay thế bằng env config. |
| **3. Lỗ Hổng Injection (SQL / Command)** | Sử dụng nối chuỗi thô trong câu lệnh SQL hoặc truyền biến không validate vào `exec()`. | **VETO Gate 3.** Chuyển sang parameterized queries hoặc TypeORM QueryBuilder binding. | Cung cấp `.patch` sửa câu lệnh truy vấn an toàn. |
| **4. Kiểm Soát Truy Cập (RBAC & Auth)** | Endpoint nhạy cảm thiếu Guard kiểm tra quyền (`@Roles()`) hoặc gắn `@Public()` bừa bãi. | **VETO Gate 3.** Khôi phục Guard xác thực và kiểm tra vai trò người dùng. | Cung cấp `.patch` gắn đúng Guard và Policies. |
| **5. Phủ Quyết An Ninh (Security VETO)** | Cảnh báo lỗ hổng bảo mật mà không gửi kèm giải pháp sửa đổi. | **LỆNH CẤM:** Nghiêm cấm phủ quyết suông (Empty Veto per Invariant 9). | Bắt buộc xuất bản `remediation.patch`. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Quét Khóa Bí Mật & Thông Tin Nhạy Cảm (Secret Scanning):**
   - Quét tìm các chuỗi bí mật tiềm tàng:
     ```bash
     grep -rn -E "(password|secret|private_key|token) *[:=] *['\"][^'\"]+['\"]" src/
     ```

2. **Quét Phân Tích Tĩnh SAST & Thư Viện Phụ Thuộc:**
   - Kiểm tra các CVE đã biết trong dependencies:
     ```bash
     npm audit --audit-level=high || yarn audit --level high
     ```
   - Quét tìm lỗ hổng SQL Injection: tìm các điểm gọi `.query(` có sử dụng string interpolation (`${...}`).

3. **Thẩm Định Response DTO Sanitization:**
   - Kiểm tra toàn bộ Response DTOs xem có trường nhạy cảm nào bị lọt ra ngoài client không.

4. **Tạo Báo Cáo An Ninh & Xuất Bản Bản Vá (Remediation Patch):**
   - Nếu có lỗ hổng: Soạn thảo bản vá `docs/security/remediation.patch` dưới định dạng unified diff (`diff -u`).
   - Lập báo cáo `docs/security/security-report.md` liệt kê rủi ro, phân loại mức độ (Critical, High, Medium) và hướng dẫn áp dụng bản vá bằng lệnh `git apply docs/security/remediation.patch`.

5. **Ký Khóa An Ninh Cho Release:**
   - Khi 0 lỗ hổng nghiêm trọng tồn đọng, ký duyệt mở Gate 3 để bước sang Gate 4.

---

# Section 4: Mechanical Verification Checklist

- [ ] Lệnh quét không phát hiện lỗ hổng mức High/Critical: `npm audit` trả về 0 vulnerabilities mức cao.
- [ ] Không có secret hardcode trong source: Quét regex secret keys trả về Exit Code `0`.
- [ ] Nếu có VETO, file bản vá `.patch` bắt buộc phải tồn tại: `test -f docs/security/remediation.patch`.
- [ ] Bản vá hợp lệ về mặt cú pháp git: `git apply --check docs/security/remediation.patch` trả về Exit Code `0` (nếu có patch).
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Mã nguồn hoàn chỉnh sau khi pass Gate 2 Wire-Up.
- **Đầu ra (Downstream Seam):** `docs/security/security-report.md` và `remediation.patch` mở khóa cho `devops-lifecycle-and-reaper` tại Gate 4.
