---
name: code-refactor
description: >-
  Kỹ năng Tái cấu trúc Mã nguồn Dựa trên Đồ thị Tác động AST (Blast-Radius Controlled Refactoring).
  Kích hoạt khi sửa đổi các hàm/hợp đồng dùng chung, tái cấu trúc logic, hoặc tối ưu hóa hiệu năng.
  Sử dụng trực tiếp các công cụ MCP của code-review-graph (get_impact_radius, get_review_context_tool)
  để tính toán bán kính ảnh hưởng đa tầng, trích xuất lát cắt ngữ cảnh phẫu thuật dưới 2000 tokens (Invariant 6),
  và khoanh vùng chính xác bộ test bị tác động để chạy lại với chi phí tối thiểu.
inputs:
  - path: "target_symbol_or_file"
    required: true
    description: "Ký hiệu (symbol) hoặc đường dẫn tệp cần tái cấu trúc"
  - path: "max_depth"
    required: false
    description: "Độ sâu phân tích callers-of-callers (mặc định 3, tối đa 5)"
outputs:
  - path: "docs/refactor/impact-summary.json"
    description: "Báo cáo bán kính ảnh hưởng, cấp độ rủi ro và danh sách test bị ảnh hưởng"
  - path: "context:surgical_slice"
    description: "Lát cắt ngữ cảnh phẫu thuật tinh gọn <= 2000 tokens"
tools:
  - code-review-graph:get_impact_radius
  - code-review-graph:get_review_context_tool
  - code-review-graph:query_graph_tool
  - view_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `code-refactor` biến quá trình tái cấu trúc mã nguồn từ "mò mẫm trong bóng tối" thành một quy trình phẫu thuật chính xác có kiểm soát bán kính tác động (Blast-Radius Engineering). Thay vì đọc toàn bộ codebase làm tràn bộ nhớ ngữ cảnh, kỹ năng này truy vấn đồ thị AST qua MCP server để xác định chính xác những file nào thực sự gọi đến hàm bị sửa, thẩm định ranh giới đường nối sạch (clean seam), xử lý các ký hiệu độc lập (isolated / 0 consumers), trích xuất duy nhất chữ ký hàm (Signatures) của callers trong ngân sách $\le 2000$ tokens (Invariant 6), và kích hoạt cơ chế fallback nén lát cắt khi bán kính vượt quá ngân sách.

---

# Section 2: Decision Matrix

| Cấp Độ Rủi Ro (Risk Level) | Điều Kiện Kích Hoạt | Hành Động Kỹ Thuật Bắt Buộc | Ngân Sách Ngữ Cảnh Bắt Buộc |
| :--- | :--- | :--- | :--- |
| **ISOLATED (Ký hiệu độc lập)** | `total_affected_files == 0` hoặc 0 consumers (hàm isolated / độc lập). | Tái cấu trúc an toàn ngay tại file nguồn, chỉ chạy test đơn vị cục bộ. | $\le 500$ tokens. |
| **LOW (Leaf Node)** | `total_affected_files <= 2` | Xác nhận ranh giới clean seam; chạy test đơn vị đồng vị trí (`*.spec.ts`). | $\le 800$ tokens. |
| **MEDIUM (Feature Slice)** | `3 <= total_affected_files <= 6` | Trích xuất chữ ký (signatures) của callers tại đường nối clean seam; chạy test phân hệ. | $\le 1500$ tokens. |
| **HIGH (Shared Contract / Core)** | `total_affected_files > 6` hoặc thuộc `@repo/contracts` | Trích xuất signature stub; bắt buộc chạy test toàn bộ affected tests; thông báo Tech Lead. | $\le 2000$ tokens (Invariant 6). |
| **OVERFLOW (Vượt quá 2000 tokens)** | Context slice vượt quá 2000 tokens do quá nhiều callers. | Kích hoạt cơ chế fallback: nén mạnh (compress) chỉ giữ lại file chính và stub callers tier-1. | $\le 2000$ tokens strict. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Đo Lường Bán Kính Tác Động & Thẩm Định Đường Nối Sạch (Clean Seam Analysis):**
   - Gọi `get_impact_radius(target: "<SymbolName>", depth: 3)`.
   - Kiểm tra xem symbol có phải là isolated (0 consumers / độc lập) hay không.
   - Thẩm định ranh giới đường nối sạch (clean seam) giữa caller và module để bảo đảm việc sửa đổi không làm rò rỉ chi tiết cài đặt nội bộ.
   - Trích xuất: Tổng số file bị ảnh hưởng, danh sách callsites, và danh sách bài test bị tác động (`affected_tests`).
   - Phân loại cấp độ rủi ro (ISOLATED, LOW, MEDIUM, HIGH).

2. **Trích Xuất Lát Cắt Phẫu Thuật (Surgical Context Slicing):**
   - Gọi `get_review_context_tool(files: [...], max_tokens: 2000, include_caller_signatures: true)`.
   - Giữ nguyên nội dung chi tiết của file mục tiêu cần sửa.
   - Với các callers: Chỉ trích xuất chữ ký hàm (interface / method signatures), loại bỏ toàn bộ function body và comments rác.
   - *Cơ chế fallback:* Nếu bán kính tác động vượt quá ngân sách 2000 tokens, tự động nén (compress / slice fallback) loại bỏ callers tier-2, chỉ giữ callers trực tiếp tier-1.

3. **Áp Dụng Thay Đổi Mã Nguồn Tối Giản:**
   - Tiến hành tái cấu trúc dựa trên lát cắt ngữ cảnh siêu tập trung tại đúng ranh giới đường nối seam.
   - Tuân thủ nguyên lý `ponytail`: Shortest working diff wins.

4. **Xác Minh Cơ Học Mục Tiêu (Targeted Verification):**
   - Chỉ chạy danh sách `affected_tests` do MCP tool trả về, không chạy lan man toàn bộ test suite.
   - Xác nhận tất cả affected tests chuyển sang màu XANH với Exit Code `0`.

---

# Section 4: Mechanical Verification Checklist

- [ ] Bán kính tác động được tính toán trước khi sửa mã: `test -f docs/refactor/impact-summary.json`.
- [ ] Ranh giới đường nối sạch (clean seam) được thẩm định trước khi thay đổi mã nguồn.
- [ ] Lát cắt ngữ cảnh không vượt quá 2000 tokens (Invariant 6); cơ chế fallback nén hoạt động khi quá tải.
- [ ] 100% affected tests được thực thi và đạt Exit Code 0: `npm test -- <affected_tests>` trả về 0 failures.
- [ ] Không làm phát sinh lỗi typecheck: `npm run type-check` trả về Exit Code `0`.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Tệp/Symbol cần refactor và AST graph từ `code-review-graph` MCP.
- **Đầu ra (Downstream Seam):** `docs/refactor/impact-summary.json` và mã nguồn đã tái cấu trúc an toàn với kiểm chứng cơ học tại clean seam.
