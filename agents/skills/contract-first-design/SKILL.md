---
name: contract-first-design
description: >-
  Kỹ năng Thiết kế Hợp đồng Dữ liệu Tiên phong (Contract-First Design & DIP Tokens).
  Kích hoạt tại Gate 1 (Contract & DB) khi Tech Lead định nghĩa API DTOs, Enums SSOT,
  và Interface DIP Tokens. Cung cấp quy chuẩn RESTful OpenAPI, cấu trúc Response Envelope chuẩn (ADR-007),
  nguyên tắc tiến hóa không gián đoạn (ADR-003 Non-Breaking Evolution), và triệt tiêu mappers thừa (Invariant 41).
inputs:
  - path: "docs/specs/<feature>.prd.md"
    required: true
    description: "Đặc tả PRD đã được phê duyệt từ Gate 0"
outputs:
  - path: "src/contracts/<feature>.contract.ts"
    description: "Tệp hợp đồng DTOs, Enums và DIP Tokens dùng chung"
tools:
  - view_file
  - write_to_file
---

# Section 1: Overview & Objective

Kỹ năng `contract-first-design` bảo đảm toàn bộ hệ thống phát triển xoay quanh Hợp đồng Dữ liệu Bất biến (Single Source of Truth) trước khi viết bất kỳ dòng mã nghiệp vụ nào. Mục tiêu là phát hành các DTOs, Enums và Dependency Inversion Principle (DIP) Injection Tokens tại `@repo/contracts` hoặc `src/contracts/`, định hình rõ ràng giao thức giao tiếp giữa Backend và Frontend, ngăn chặn lỗi runtime type mismatch và triệt tiêu các lớp chuyển đổi mapper trung gian thừa thãi.

---

# Section 2: Decision Matrix

| Kịch Bản Thiết Kế | Hành Động & Giao Thức Chuẩn | Điều Cấm (Anti-Pattern) | Kết Quả Bàn Giao |
| :--- | :--- | :--- | :--- |
| **Thiết kế DTOs mới** | Khai báo class với runtime decorators (`class-validator`, `class-transformer`). Casing `camelCase`. | Dùng interface TypeScript thuần túy (bị xóa ở runtime, không validate được). | File `src/contracts/<feature>.contract.ts`. |
| **Phản hồi API (Response Payload)** | Bắt buộc bọc trong chuẩn `ApiResponse<T>` / `ApiErrorResponse` (ADR-007) chứa `data`, `meta`, `timestamp`. | Trả về payload trần hoặc cấu trúc tự phát không có metadata chuẩn. | Contract DTO Response. |
| **Định nghĩa Domain Enums** | Khai báo tập trung duy nhất tại `@repo/contracts` (Invariant 41). | Khai báo lại enum rải rác cục bộ trong `be` hoặc `cms`. | Enums SSOT. |
| **Tiến hóa API (Thêm trường mới)** | Thêm trường `@IsOptional()`. Không bao giờ thêm trường bắt buộc vào endpoint đang chạy (ADR-003). | Phá vỡ client cũ bằng cách ép bắt buộc trường mới trên API v1. | Non-breaking versioning. |
| **Dependency Injection Backend** | Tạo DIP Token Symbol (`export const REPOSITORY_TOKEN = Symbol(...)`) cho mọi Repository interface. | Inject trực tiếp TypeORM Entity Repository vào Application Service. | DIP Interface Tokens. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Trích Xuất Hợp Đồng Từ PRD:**
   - Đọc kỹ `docs/specs/<feature>.prd.md`, xác định các thực thể, kịch bản tạo/sửa/đọc và danh sách mã lỗi nghiệp vụ.

2. **Khởi Tạo Canonical Enums & Constants:**
   - Định nghĩa các enum trạng thái, vai trò, quyền hạn tập trung (Single Source of Truth per Invariant 41).
   - Thiết lập các hằng số cấu hình thời gian, phân trang tập trung, loại bỏ hoàn toàn Magic Numbers.

3. **Soạn Thảo Request & Response DTOs:**
   - Khai báo các class Request DTO với đầy đủ decorators (`@IsString()`, `@IsNotEmpty()`, `@Min()`, `@IsEnum()`).
   - Khai báo Response DTO tuân thủ Envelope chuẩn:
     ```typescript
     export interface ApiResponse<T> {
       success: boolean;
       statusCode: number;
       data: T;
       meta?: { total?: number; page?: number; limit?: number; timestamp: string };
     }
     ```

4. **Tạo DIP Injection Tokens:**
   - Định nghĩa abstraction interface và Injection Token tương ứng để tách rời tầng Domain/Application khỏi Infrastructure.

5. **Khóa Hợp Đồng Tại Gate 1:**
   - Xuất bản `src/contracts/<feature>.contract.ts` hoặc cập nhật package `@repo/contracts`.
   - Chuyển giao hợp đồng sang `04-backend` và `05-frontend`.

---

# Section 4: Mechanical Verification Checklist

- [ ] File hợp đồng tồn tại: `test -f src/contracts/<feature>.contract.ts`.
- [ ] DTO sử dụng decorators runtime hợp lệ: `grep -q "@Is" src/contracts/<feature>.contract.ts`.
- [ ] Không có enum trùng lặp ngoài contract: Quét mã nguồn không có `enum` cục bộ ngoài `@repo/contracts`.
- [ ] Response tuân thủ Envelope: `grep -q "ApiResponse<" src/contracts/<feature>.contract.ts`.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `docs/specs/<feature>.prd.md` và `docs/debates/<feature>.debate.md`.
- **Đầu ra (Downstream Seam):** `src/contracts/<feature>.contract.ts` mở khóa cho `backend-clean-module`, `frontend-unified-architecture` và `db-migration-and-seed`.
