---
name: db-migration-and-seed
description: >-
  Kỹ năng Quản trị Dịch chuyển Schema & Nạp Dữ liệu Hạt giống Chuẩn Xác định (DB Migration & Deterministic Seed).
  Kích hoạt tại Gate 1 (Contract & DB) khi thay đổi cấu trúc bảng, thêm chỉ mục (index), hoặc chuẩn bị môi trường test.
  Cưỡng chế Invariant 7: nạp seed data với UUIDs cố định, mật khẩu bcrypt chuẩn, tính toàn vẹn khóa ngoại 100%,
  và áp dụng kỹ thuật Expand-Contract migration để bảo đảm không gián đoạn dịch vụ (Zero-Downtime DDL).
inputs:
  - path: "docs/specs/<feature>.prd.md"
    required: true
    description: "Đặc tả thực thể và dữ liệu từ PRD"
  - path: "src/contracts/<feature>.contract.ts"
    required: true
    description: "Hợp đồng DTOs để đối chiếu trường dữ liệu"
outputs:
  - path: "migrations/<timestamp>_<feature>.sql"
    description: "Tệp migration DDL chuẩn mở rộng-co hẹp (Expand-Contract)"
  - path: "src/database/seeds/seed.ts"
    description: "Script nạp dữ liệu hạt giống chuẩn xác định không sinh lỗi trùng lặp (Idempotent Seed)"
tools:
  - view_file
  - write_to_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `db-migration-and-seed` bảo đảm cơ sở dữ liệu được tiến hóa an toàn và cung cấp nền tảng dữ liệu hạt giống xác định (Deterministic Seed Data per Invariant 7) trước khi bước vào chặng thi công và kiểm thử E2E. Mục tiêu là loại bỏ tình trạng test chập chờn (flaky tests) do thiếu dữ liệu phụ thuộc, ngăn chặn việc khóa bảng độc quyền (Access Exclusive Lock) gây treo production, và thiết lập các ràng buộc DB vững chắc (CHECK, NOT NULL, FOREIGN KEY) thay vì phó mặc cho code kiểm tra thủ công.

---

# Section 2: Decision Matrix

| Kịch Bản Dữ Liệu | Chuẩn Mực Bắt Buộc | Điều Cấm (Anti-Pattern) | Hành Động Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Đổi tên cột hoặc tách bảng** | Áp dụng mô hình Expand-Contract (Thêm cột mới $\to$ Ghi đúp $\to$ Backfill $\to$ Chuyển đọc $\to$ Xóa cột cũ). | Đổi tên cột trực tiếp bằng `ALTER TABLE ... RENAME COLUMN` làm sập phiên bản app đang chạy. | Viết 2 migration tách rời theo chu kỳ release. |
| **Tạo migration mới** | Bổ sung mệnh đề `NOT NULL` chỉ khi đã có `DEFAULT` value rõ ràng. Thêm chỉ mục dạng `CONCURRENTLY`. | Thêm cột `NOT NULL` không có default value lên bảng triệu dòng gây lỗi khóa bảng. | DDL an toàn không khóa bảng. |
| **Dữ liệu hạt giống (Seed Data)** | Sử dụng UUID v4 cố định chuẩn xác (Deterministic UUIDs) cho bản ghi gốc (Invariant 7). | Sinh UUID ngẫu nhiên (`randomUUID()`) trong seed khiến assertions của E2E test bị trượt. | Cố định UUIDs mẫu cho Admin/User. |
| **Mật khẩu trong Seed Data** | Dùng chuỗi băm mật khẩu bcrypt/argon2 có sẵn (ví dụ hash của `Password123!`). | Lưu mật khẩu dạng văn bản thô (Plaintext) hoặc tự tính bcrypt runtime làm chậm seed. | Dùng chuỗi pre-hashed salt 10. |
| **Tính Idempotent của Seed** | Viết câu lệnh hỗ trợ chạy lại nhiều lần: `ON CONFLICT (id) DO NOTHING` hoặc `DO UPDATE`. | Lệnh insert đơn thuần gây văng lỗi duplicate key khi chạy lại test lần 2. | Đảm bảo Idempotency tuyệt đối. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Thiết Kế Migration DDL (Expand Phase):**
   - Viết tệp migration trong `migrations/<timestamp>_<feature>.sql`.
   - Khai báo các cột mới dưới dạng Nullable hoặc có giá trị mặc định (`DEFAULT`).
   - Tạo Foreign Key với `ON DELETE RESTRICT` hoặc `CASCADE` phù hợp nghiệp vụ.
   - Thêm các ràng buộc kiểm tra toàn vẹn dữ liệu: `ALTER TABLE ... ADD CONSTRAINT chk_balance_non_negative CHECK (balance >= 0)`.

2. **Soạn Thảo Deterministic Seed Data Script:**
   - Tạo hoặc cập nhật `src/database/seeds/seed.ts`.
   - Khai báo các hằng số ID xác định:
     ```typescript
     export const SEED_ADMIN_ID = '00000000-0000-4000-8000-000000000001';
     export const SEED_USER_ID  = '00000000-0000-4000-8000-000000000002';
     export const SEED_HASH     = '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6x8ecGy5KnWwnZDOdaee'; // Password123!
     ```
   - Chèn dữ liệu theo thứ tự cây phụ thuộc: Bảng Master $\to$ Bảng Quan hệ $\to$ Bảng Chi tiết.
   - Cung cấp đủ 5 trạng thái dữ liệu: Active, Pending, Inactive, Blocked, và Soft-deleted để phục vụ kiểm thử boundary.

3. **Thực Thi & Kiểm Tra Rollback:**
   - Chạy migration trên môi trường dev/test.
   - Thực thi lệnh rollback (`migration:revert`) để chứng minh kịch bản hạ cấp hoạt động trơn tru trước khi áp dụng chính thức.

---

# Section 4: Mechanical Verification Checklist

- [ ] File migration có câu lệnh `UP` và `DOWN` (hoặc rollback an toàn): `test -f migrations/*.sql`.
- [ ] Script seed data chạy lại 2 lần liên tiếp không lỗi: `npm run seed && npm run seed` trả về Exit Code `0`.
- [ ] Không chứa mật khẩu plaintext trong seed: Quét mã seed không chứa mật khẩu trần chưa băm.
- [ ] Mọi Foreign Key đều được thỏa mãn (Zero orphan keys): Kiểm tra tính toàn vẹn khóa ngoại đạt 100%.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `src/contracts/<feature>.contract.ts` từ `contract-first-design`.
- **Đầu ra (Downstream Seam):** Cơ sở dữ liệu có schema hoàn chỉnh và dữ liệu hạt giống xác định sẵn sàng cho `backend-clean-module` và `wireup-e2e-verification`.
