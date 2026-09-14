---
name: deep-module-architecture
description: >-
  Kỹ năng Thiết kế Mô-đun Sâu & Đường Nối Sạch (Deep Module Architecture & Clean Seam Design).
  Kích hoạt khi Tech Lead hoặc Developer thiết kế ranh giới mô-đun, tái cấu trúc God Barrels (Invariant 33),
  hoặc tối ưu hóa tính cục bộ (Locality). Triệt tiêu các module nông (Shallow Modules) bằng Bài kiểm tra xóa
  (The Deletion Test) và bảo đảm giao diện tối giản giấu kín hành vi mạnh mẽ.
inputs:
  - path: "src/**"
    required: true
    description: "Mã nguồn mô-đun hoặc component cần kiểm tra ranh giới và độ sâu"
outputs:
  - path: "src/**"
    description: "Cấu trúc mô-đun sâu với interface tối giản và direct component imports"
tools:
  - view_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `deep-module-architecture` áp dụng nguyên lý thiết kế của John Ousterhout và Matt Pocock: xây dựng các mô-đun có giao diện nhỏ gọn (Low Interface Complexity) nhưng ẩn giấu hành vi nghiệp vụ mạnh mẽ và phức tạp (High Depth). Mục tiêu là triệt tiêu hoàn toàn các mô-đun nông thừa thãi (Shallow Modules), loại bỏ các "God Barrels" cấp cao gây ô nhiễm bundle JS và phá vỡ Tree-Shaking (Invariant 33), và neo giữ hệ thống tại các đường nối sạch (Clean Seams).

---

# Section 2: Decision Matrix

| Dấu Hiệu Mã Nguồn / Cấu Trúc | Đánh Giá Bản Chất | Hành Động Bắt Buộc | Lối Thoát / Tối Ưu |
| :--- | :--- | :--- | :--- |
| **Tệp `index.ts` gom re-export toàn bộ components trong `src/components/`** | Shallow God Barrel (Vi phạm Invariant 33). | **Xóa bỏ tệp `index.ts` ngay lập tức.** Chuyển các call-sites sang Direct Component Imports. | Direct imports (e.g. `@/shared/ui/button/AppButton`). |
| **Một Service chỉ pass-through dữ liệu sang Repository mà không có business logic** | Shallow Service thừa thãi (Fail bài test Deletion). | Gộp logic hoặc loại bỏ lớp trung gian, gọi trực tiếp hoặc đưa vào Domain Entity. | Xóa lớp proxy vô nghĩa. |
| **Nhiều hàm liên quan đến 1 quy trình bị phân tán thành 5 helper nhỏ** | Phân mảnh cục bộ (Broken Locality). | Gom toàn bộ state, validation, retry, transaction vào 1 Deep Module duy nhất. | Deep Module có 1 interface duy nhất. |
| **`index.ts` tại Monorepo Package Boundary (`@repo/contracts/src/index.ts`)** | Boundary chuẩn (Zero runtime cost, chỉ export DTOs/types/enums). | **Cho phép tồn tại.** Giữ cho việc phân phối types trong monorepo tinh gọn. | Hợp đồng công khai của package. |
| **Leaf Slice Public API (`src/features/<feature>/index.ts`)** | Local Leaf Boundary (Chỉ export Table và Hook của chính feature cho Page). | **Cho phép tồn tại** nếu không chứa components nặng hay re-export module chéo. | Giao diện công khai lát cắt cục bộ. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Thực Hiện Bài Kiểm Tra Xóa (The Deletion Test):**
   - Đặt câu hỏi: *"Nếu xóa module/file này đi, độ phức tạp sẽ tập trung lại (concentrate) hay bị phân tán (scatter) sang các caller?"*
   - Nếu "Tập trung lại" $\rightarrow$ Module đó là Shallow hoặc God Barrel vô dụng $\rightarrow$ Xóa ngay.
   - Nếu "Phân tán khắp nơi" $\rightarrow$ Module thực sự đóng gói hành vi cốt lõi $\rightarrow$ Giữ lại và gia tăng độ sâu.

2. **Triệt Tiêu God Barrels (Enforce Invariant 33):**
   - Quét tìm và xóa các tệp re-export trung gian: `src/components/index.ts`, `src/shared/index.ts`, `src/shared/ui/index.ts`.
   - Trong Backend NestJS: Xóa việc re-export Service/Controller/Repository qua `index.ts` giữa các module nhằm chặn đứng lỗi Circular Dependency và vỡ runtime Dependency Injection.

3. **Thu Gọn Giao Diện Bề Mặt (Deepening the Interface):**
   - Giảm số lượng tham số và hàm public của module xuống mức tối thiểu tuyệt đối.
   - Ẩn toàn bộ chi tiết triển khai (database transaction, retry, cache, token validation) vào bên trong implementation.
   - Caller chỉ tương tác với 1-2 phương thức rõ ràng (ví dụ: `execute(command)` hoặc `transition(event)`).

4. **Kiểm Thử Trực Tiếp Qua Giao Diện (Test Through the Seam):**
   - Viết unit test tập trung 100% vào Interface công khai của Deep Module.
   - Tuyệt đối cấm mock các hàm private hoặc phụ thuộc vào cấu trúc nội bộ bên trong.

---

# Section 4: Mechanical Verification Checklist

- [ ] Không có God Barrel nào tồn tại trong `src/components/index.ts` hay `src/shared/index.ts`: `test ! -f src/components/index.ts`.
- [ ] Không có import dạng `from '@/components'` hay `from '@/shared'`: `node scripts/check-no-barrels.mjs` trả về Exit Code `0`.
- [ ] Mọi module nghiệp vụ đều vượt qua Deletion Test: Không có class/service rỗng chuyển tiếp dữ liệu đơn thuần.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Kiến trúc hệ thống và các tệp mã nguồn hiện hữu.
- **Đầu ra (Downstream Seam):** Cấu trúc mã nguồn với Direct Imports, không God Barrels, tuân thủ Invariant 33.
