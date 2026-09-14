---
name: wireup-review
description: >-
  Kỹ năng Kiểm tra Nối dây Toàn Vòng đời Qua Đồ thị AST (AST Whole-Lifecycle Wire-Up Review).
  Kích hoạt khi thẩm định nối dây tính năng (Invariant 32: Whole-Lifecycle Wire-Up & Anti-Phantom Pages),
  kiểm tra component mồ côi hoặc route chưa liên kết menu. Sử dụng trực tiếp các công cụ MCP của code-review-graph
  (query_graph_tool, get_impact_radius) để truy vết 7 mắt xích (DTO -> BE Module -> QueryKey -> Hook -> Table -> Next.js Page -> Navigation Manifest).
inputs:
  - path: "feature_name"
    required: true
    description: "Tên tính năng cần thẩm định nối dây (ví dụ: 'player', 'wallet', 'bonus')"
outputs:
  - path: "docs/specs/wireup-review-report.json"
    description: "Báo cáo trạng thái toàn vẹn của 7 mắt xích nối dây kèm danh sách node mồ côi"
tools:
  - code-review-graph:query_graph_tool
  - code-review-graph:get_impact_radius
  - view_file
---

# Section 1: Overview & Objective

Kỹ năng `wireup-review` thay thế các kịch bản quét text-regex mỏng manh bằng việc truy vấn đồ thị cú pháp trừu tượng (AST Directed Acyclic Graph) thông qua MCP Server `code-review-graph`. Mục tiêu là xác minh một cách không thể chối cãi chuỗi 7 mắt xích bắt buộc của Invariant 32 (Whole-Lifecycle Wire-Up), bảo đảm rằng mọi tính năng sinh ra đều được kết nối từ Data Contract, qua Backend Controller, Query Key Factory, Logic Hook, Presentation Table, Route Page, cho đến Navigation Menu mà không có bất kỳ component hay hook mồ côi nào. Kỹ năng này phát hiện ngay các ký hiệu không có liên kết (unconnected / 0 callers) và cảnh báo nguy cơ phụ thuộc vòng lặp (circular dependency) trong đồ thị module.

---

# Section 2: Decision Matrix

| Tình Huống Thẩm Định | Công Cụ MCP Gọi Đầu Tiên | Tham Số Tra Cứu Đồ Thị AST | Tiêu Chí Đạt Chuẩn (Pass Condition) |
| :--- | :--- | :--- | :--- |
| **Kiểm tra mắt xích DTO** | `query_graph_tool` | `query_type: "find_references"`, `symbol: "<Feature>Dto"` | DTO được tham chiếu bởi cả Backend Controller và Frontend Service. |
| **Kiểm tra Hook mồ côi / 0 callers** | `query_graph_tool` | `query_type: "find_callers"`, `symbol: "use<Feature>Logic"` | Có ít nhất 1 UI Component hoặc Page gọi trực tiếp hook (báo lỗi nếu 0 callers hoặc unconnected). |
| **Kiểm tra Trang ma (Phantom Page)** | `query_graph_tool` | `query_type: "find_symbol"`, `path: "src/app/**/<feature>/page.tsx"` | Tệp route tồn tại và xuất bản Next.js page component hợp lệ (không để trang empty). |
| **Kiểm tra Navigation Menu** | `query_graph_tool` | `query_type: "find_hierarchy"`, `path: "src/manifests/**"` | Đường dẫn URL của feature có mặt trong menu/manifest registry. |
| **Phát hiện phụ thuộc vòng lặp (circular)** | `query_graph_tool` | `query_type: "find_hierarchy"`, `symbol: "<Feature>Module"` | Đồ thị AST không chứa chu trình phụ thuộc vòng lặp (circular dependency cycle) giữa các modules. |
| **Phát hiện mắt xích bị gãy** | Ghi nhận lỗi và vị trí đứt gãy trong báo cáo audit, phát cờ `BROKEN_SEAM`. | Bỏ qua việc kiểm tra menu khiến người dùng không thể truy cập từ giao diện. | Chặn đóng Gate 2. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Truy Vết Hợp Đồng DTO (Mắt xích 1):**
   - Gọi `query_graph_tool(symbol: "<Feature>Dto", query_type: "find_references")`.
   - Nếu callers = 0 hoặc unconnected (không có liên kết) $\rightarrow$ Báo lỗi mắt xích DTO chưa được tiêu thụ.

2. **Truy Vết Hook Nhạc Trưởng & Query Key (Mắt xích 2, 3, 4):**
   - Gọi `query_graph_tool(symbol: "use<Feature>Logic", query_type: "find_callers")`.
   - Xác nhận hook có sử dụng query key factory từ `src/shared/query-keys/`.
   - Nếu số callers = 0 $\rightarrow$ Báo lỗi Hook mồ côi (vi phạm Invariant 32).

3. **Truy Vết Presentation Component & Route Page (Mắt xích 5, 6):**
   - Kiểm tra Component hiển thị `<Feature>Table` có được import vào Next.js App Router page (`src/app/[locale]/(protected)/<feature>/page.tsx`).
   - Ngăn chặn các trang rỗng (empty page) không render component chính.

4. **Kiểm Tra Phụ Thuộc Vòng Lặp (Detect Circular Dependencies):**
   - Phân tích chu trình phụ thuộc (circular cycle) giữa backend modules và frontend slices.
   - Nếu phát hiện import vòng lặp (circular imports) qua barrels $\rightarrow$ Yêu cầu phá vỡ chu trình bằng Direct Imports.

5. **Thẩm Định Navigation Manifest (Mắt xích 7):**
   - Gọi `query_graph_tool(symbol: "navigationItems", query_type: "find_hierarchy")`.
   - Xác nhận đường dẫn `/<feature>` đã được đăng ký vào Shell Navigation hoặc Sidebar Menu.

6. **Xuất Bản Báo Cáo Nối Dây (Wire-Up Seam Report):**
   - Xuất bản tệp `docs/specs/wireup-review-report.json` với trạng thái `PASSED` hoặc `INCOMPLETE`.

---

# Section 4: Mechanical Verification Checklist

- [ ] Toàn bộ 7 mắt xích nối dây đều được xác nhận qua đồ thị AST: Báo cáo trả về status `PASSED`.
- [ ] Không có component hoặc hook mồ côi: Zero callers count = 0, không có ký hiệu unconnected.
- [ ] Đồ thị AST không chứa chu trình phụ thuộc vòng lặp (circular dependencies).
- [ ] URL tính năng có mặt trong Navigation Manifest: Đạt Exit Code `0`.
- [ ] File báo cáo nối dây tồn tại: `test -f docs/specs/wireup-review-report.json`.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Tên tính năng và đồ thị AST từ `code-review-graph` MCP.
- **Đầu ra (Downstream Seam):** `docs/specs/wireup-review-report.json` xác nhận tính năng đã hoàn chỉnh toàn bộ vòng đời, sẵn sàng kiểm thử.
