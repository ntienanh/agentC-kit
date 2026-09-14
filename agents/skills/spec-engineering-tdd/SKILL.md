---
name: spec-engineering-tdd
description: >-
  Kỹ năng Kỹ nghệ Kiểm thử Đặc tả & Phát triển Hướng Kiểm thử (Unified Spec Engineering & Strict TDD).
  Kích hoạt khi viết test suite trước khi lập trình, thực thi chu trình Red-Green-Refactor,
  hoặc thẩm định độ bao phủ kiểm thử. Cưỡng chế Invariant 5 (Read-Only Test Law),
  Invariant 34 (Đồng vị trí Spec 1-1 co-located), và Invariant 39 (Kim tự tháp 4 phân tầng kiểm thử & chuẩn AAA).
inputs:
  - path: "src/contracts/<feature>.contract.ts"
    required: true
    description: "Hợp đồng DTOs và DIP Tokens làm cơ sở viết assertions"
outputs:
  - path: "src/**/*.spec.ts"
    description: "Tệp spec kiểm thử đơn vị đặt ngang hàng 1-1 với file mã nguồn tương ứng"
  - path: "e2e/**/*.spec.ts"
    description: "Tệp kiểm thử E2E đặt tách biệt ngoài thư mục src/"
tools:
  - view_file
  - write_to_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `spec-engineering-tdd` thiết lập kỷ luật kiểm thử phần mềm bất biến nhằm loại bỏ vĩnh viễn thói quen "viết code trước rồi viết test cho có" hoặc sửa đổi file test để ép code pass (Cheating). Kỹ năng này cưỡng chế:
1. Thiết quân luật TDD (Không viết code nghiệp vụ khi chưa có test thất bại chứng kiến).
2. Quy chuẩn đồng vị trí 1-1 (Invariant 34: Co-located specs).
3. Kim tự tháp kiểm thử 4 phân tầng (Invariant 39) với mô hình cấu trúc Arrange - Act - Assert (AAA) nghiêm ngặt.
4. Bảo vệ bộ test suite ở trạng thái READ-ONLY đối với developer thực thi.

---

# Section 2: Decision Matrix

| Phân Tầng Kiểm Thử | Đối Tượng & Phạm Vi | Kỹ Thuật Mocking Cho Phép | Vị Trí Lưu Trữ Bắt Buộc |
| :--- | :--- | :--- | :--- |
| **Tier 1: Pure Logic Spec** | Utils, DTO Mappers, Value Objects, toán tử. | **Zero Mocking.** Input $\to$ Output thuần túy. Tốc độ $\le 1$ms/test. | `src/**/*.util.spec.ts` (Co-located Invariant 34). |
| **Tier 2A: Backend Service Spec** | NestJS Use-case Services, Application Logic. | Mock Repository qua DIP Token (`@Inject(TOKEN)`). Không chạm DB thật. | `src/**/*.service.spec.ts` (Co-located). |
| **Tier 2B: Frontend Logic Hook Spec** | React Query hooks trong `src/logic/`. | Bọc trong `QueryClientTestWrapper`, dùng `renderHook()`, mock `fetch`. | `src/logic/**/*.spec.ts` (Co-located). |
| **Tier 3: UI Component Spec** | Components trong `src/shared/ui/` hoặc feature views. | React Testing Library (`render`, `screen`, `userEvent`). Assert trên visual DOM / ARIA. | `src/**/*.spec.tsx` (Co-located). |
| **Tier 4: Black-Box E2E Spec** | API Endpoints (Socket OS thật) và User Journeys (Playwright). | **Zero internal memory mock.** Chạy trên tiến trình độc lập. | `test/*.e2e-spec.ts` (BE) hoặc `e2e/*.spec.ts` (FE). |

---

# Section 3: Step-by-Step Execution Protocol

1. **Giai Đoạn RED (The Failing Test):**
   - Đọc hợp đồng tại `src/contracts/<feature>.contract.ts`.
   - Viết bài test đơn vị thể hiện hành vi mong đợi theo chuẩn cấu trúc AAA:
     ```typescript
     describe('PlayerService', () => {
       describe('createPlayer', () => {
         it('should throw ConflictException when email already exists', async () => {
           // Arrange
           const dto = { email: 'existing@example.com', name: 'John' };
           // Act & Assert
           await expect(service.create(dto)).rejects.toThrow(ConflictException);
         });
       });
     });
     ```
   - Chạy lệnh test và **BẮT BUỘC chứng kiến test FAIL** do chưa có logic nghiệp vụ (không phải lỗi cú pháp).

2. **Giai Đoạn GREEN (The Minimal Implementation):**
   - Developer (`04-backend` hoặc `05-frontend`) chỉ được viết lượng mã nguồn tối thiểu tuyệt đối để chuyển test từ ĐỎ sang XANH.
   - Cấm sửa file test để lách assertions.

3. **Giai Đoạn REFACTOR (Code Polish):**
   - Làm sạch mã nguồn: Xóa toàn bộ comments trong `src/` (Invariant 31), chuyển sang direct imports (Invariant 33), bảo đảm test luôn XANH 100%.

4. **Khóa Đóng Dấu Test Suite:**
   - Đóng dấu Read-Only đối với file spec để ngăn chặn chỉnh sửa trái phép.

---

# Section 4: Mechanical Verification Checklist

- [ ] File test nằm ngang hàng 1-1 với file mã nguồn: `test -f src/path/foo.ts && test -f src/path/foo.spec.ts`.
- [ ] Không có thư mục `specs/` hay `__tests__/` bên trong `src/`: `node scripts/check-clean-arch.sh` trả về Exit Code `0`.
- [ ] Mọi test case đều tuân thủ mô hình AAA: Không có assertion mơ hồ (`expect(true).toBe(true)`).
- [ ] Toàn bộ test suite vượt qua với Exit Code 0: `npm test` hoặc `vitest run` trả về 0 failures.
- [ ] Độ bao phủ mã nguồn đạt tối thiểu 80%: `npm run test:cov` đáp ứng ngưỡng yêu cầu.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `src/contracts/<feature>.contract.ts`.
- **Đầu ra (Downstream Seam):** Bộ test suite co-located sẵn sàng làm lưới bảo vệ cho quá trình thi công tại `backend-clean-module` và `frontend-unified-architecture`.
