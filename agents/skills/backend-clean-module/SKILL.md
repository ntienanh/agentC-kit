---
name: backend-clean-module
description: >-
  Kỹ năng Xây dựng Phân hệ Backend Clean Architecture 4 Tầng & DDD (Backend Clean Module & DIP).
  Kích hoạt tại Gate 2 (Wire-Up) khi thi công nghiệp vụ phía server trên NestJS/Node.js.
  Tuân thủ nghiêm ngặt 4 tầng (Domain, Application, Infrastructure, Presentation), sử dụng DIP Tokens
  để đảo ngược phụ thuộc, tích hợp Transactional Unit of Work (UoW), và triển khai Transactional Outbox.
inputs:
  - path: "src/contracts/<feature>.contract.ts"
    required: true
    description: "Hợp đồng DTOs và DIP Tokens từ Gate 1"
outputs:
  - path: "src/modules/<feature>/"
    description: "Cấu trúc module 4 tầng hoàn chỉnh kèm controller và DI configuration"
tools:
  - view_file
  - write_to_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `backend-clean-module` bảo đảm tính nhất quán kiến trúc trên toàn bộ mã nguồn server. Mọi phân hệ nghiệp vụ bắt buộc phải được bóc tách theo mô hình Clean Architecture 4 tầng kết hợp Domain-Driven Design (DDD): `domain/`, `application/`, `infrastructure/`, và `presentation/`. Mục tiêu là loại bỏ sự phụ thuộc trực tiếp vào ORM/Database trong nghiệp vụ cốt lõi, bảo đảm 100% khả năng kiểm thử đơn vị với mock repository, và ngăn chặn các lỗi Circular Dependency runtime.

---

# Section 2: Decision Matrix

| Tầng Kiến Trúc | Thành Phần Chuẩn | Điều Cấm (Anti-Pattern) | Giao Tiếp Cho Phép |
| :--- | :--- | :--- | :--- |
| **1. Domain Layer** | Rich Domain Entity, Repository Interface, Domain Exceptions, Domain Events. | Import bất kỳ thư viện ORM (TypeORM, Prisma, Mongoose) hoặc NestJS decorator nào. | Hoàn toàn độc lập, pure TypeScript. |
| **2. Application Layer** | Use-case Services, DTOs, DIP Token Injection (`@Inject(TOKEN)`). | Truy cập trực tiếp vào DB connection hoặc phụ thuộc vào HTTP request/response. | Gọi Domain qua Repository Interface. |
| **3. Infrastructure Layer** | ORM Entities, Repository Adapters, Database Mappers, Cache, External SDKs. | Bỏ qua Mapper mà dùng ORM entity trực tiếp làm domain entity. | Thỏa mãn Interface của Domain. |
| **4. Presentation Layer** | REST Controllers, Route Handlers, Swagger Docs Decorators. | Viết nghiệp vụ, tính toán tiền bạc, hoặc gọi DB trực tiếp trong controller. | Chuyển tiếp DTO sang Application Service. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Khởi Tạo Tầng Miền Nghiệp Vụ (Domain Layer):**
   - Xây dựng Entity thuần túy: `domain/entities/<feature>.entity.ts` với các phương thức nghiệp vụ nội tại.
   - Định nghĩa Repository Interface Token: `domain/repositories/<feature>.repository.interface.ts`.

2. **Khởi Tạo Tầng Ứng Dụng (Application Layer):**
   - Tạo Use-case Service: `application/services/create-<feature>.service.ts`.
   - Inject repository qua token: `@Inject(FEATURE_REPOSITORY_TOKEN) private readonly repo: IFeatureRepository`.
   - Tích hợp Transactional Unit of Work (UoW) khi cần thay đổi nhiều bảng đồng thời.

3. **Khởi Tạo Tầng Hạ Tầng (Infrastructure Layer):**
   - Tạo ORM Entity: `infrastructure/persistence/<feature>.orm-entity.ts`.
   - Tạo Data Mapper: `infrastructure/mappers/<feature>.mapper.ts` chuyển đổi 2 chiều giữa Domain Entity và ORM Entity.
   - Hiện thực hóa Adapter: `infrastructure/repositories/<feature>.repository.ts implements IFeatureRepository`.

4. **Khởi Tạo Tầng Giao Tiếp (Presentation Layer):**
   - Tạo Controller: `presentation/controllers/<feature>.controller.ts`.
   - Gắn các decorator xác thực payload và phân quyền RBAC (`@UseGuards(JwtAuthGuard, RolesGuard)`).

5. **Đăng Ký Module Dependency Injection:**
   - Khai báo `<Feature>Module` trong `src/modules/<feature>/<feature>.module.ts`, liên kết Token với Adapter trong mảng `providers`.
   - Đăng ký module vào `src/app.module.ts`.

---

# Section 4: Mechanical Verification Checklist

- [ ] Phân hệ có đủ 4 thư mục: `test -d src/modules/<feature>/domain && test -d src/modules/<feature>/application && test -d src/modules/<feature>/infrastructure && test -d src/modules/<feature>/presentation`.
- [ ] Tầng Domain không chứa phụ thuộc ORM: Quét `import` trong `domain/` không chứa `typeorm`, `@nestjs/common`, hoặc `prisma`.
- [ ] Tầng Presentation không gọi DB trực tiếp: Không có `Repository` nào được inject trực tiếp vào Controller.
- [ ] Typecheck pass 100%: `npm run type-check` hoặc `tsc --noEmit` trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `src/contracts/<feature>.contract.ts` từ `contract-first-design`.
- **Đầu ra (Downstream Seam):** Phân hệ backend hoàn chỉnh tại `src/modules/<feature>/` sẵn sàng phục vụ API cho Frontend và kiểm thử E2E.
