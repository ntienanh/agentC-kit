---
name: pm-discovery
description: >-
  Kỹ năng Khám phá Sản phẩm Cấp cao, Mài sắc Domain Chủ động & Quản lý Ngữ cảnh Đa Domain
  (High-Leverage Product Discovery, Frontier Grilling, Active Domain Modeling & Continuous Enrichment).
  Kích hoạt khi nhận yêu cầu thô từ người dùng, feature prompt mới, hoặc tại Gate 0 (Spec). Cung cấp bộ lọc
  câu hỏi sắc bén (3 Razor Questions + Frontier Grilling), chủ động học hỏi và làm giàu từ điển nghiệp vụ
  (Ubiquitous Language, Glossary Conflict Resolution, Cross-reference with Code) vào CONTEXT.md / CONTEXT-MAP.md
  và xuất bản PRD chuẩn Gherkin.
inputs:
  - path: "prompt:user_request"
    required: true
    description: "Yêu cầu thô từ người dùng hoặc mô tả tính năng cần phát triển"
outputs:
  - path: "kit-docs/specs/<feature>.prd.md"
    description: "Tài liệu PRD hoàn chỉnh với kịch bản Gherkin, NFRs và Acceptance Criteria"
  - path: "kit-docs/CONTEXT.md"
    description: "Từ điển thuật ngữ nghiệp vụ (Ubiquitous Language) và ranh giới ngữ cảnh domain (hoặc CONTEXT-MAP.md cho đa domain)"
tools:
  - view_file
  - write_to_file
  - replace_file_content
  - ask_question
---

# Section 1: Overview & Objective

Kỹ năng `pm-discovery` định hình 90% kiến trúc sản phẩm bằng cách đặt các câu hỏi phân nhánh then chốt (Frontier Grilling) thay vì làm phiền người dùng bằng các khảo sát vụn vặt. Đồng thời, kỹ năng thực thi kỷ luật **Mô hình hóa Domain Chủ động (Active Domain Modeling)**: không chỉ thụ động đọc ngữ cảnh, mà chủ động thử thách thuật ngữ, phát hiện xung đột từ điển, đối chiếu mã nguồn thực tế, và liên tục làm giàu lõi nghiệp vụ của từng domain qua từng phiên làm việc. Hệ thống quản lý tri thức theo mô hình Ngữ cảnh Đơn lẻ (`CONTEXT.md`) hoặc Bản đồ Đa Ngữ cảnh (`CONTEXT-MAP.md`), kết tinh toàn bộ ngôn ngữ chung (Ubiquitous Language) và quy tắc bất biến vào nền tảng dự án trước khi chuyển giao sang Gate 1.

---

# Section 2: Decision Matrix

| Tình Huống / Dữ Kiện Đầu Vào | Hành Động & Giao Thức Chuẩn | Điều Cấm (Anti-Pattern) | Bước Tiếp Theo / Bàn Giao |
| :--- | :--- | :--- | :--- |
| **Yêu cầu mơ hồ / Đa nghĩa** | Áp dụng 3 Lưỡi Dao Sát Hạch + Frontier Grilling. Gom câu hỏi theo Round qua `ask_question` kèm khuyến nghị A/B cụ thể. | Bắn một tràng 5-10 câu hỏi vụn vặt không có phương án đề xuất. | Nhận phản hồi rồi chuyển sang bước mô hình hóa. |
| **Thuật ngữ xung đột với Glossary hiện tại** | Gọi tên ngay lập tức mâu thuẫn: *"Glossary định nghĩa [X] là A, nhưng bạn đang dùng theo nghĩa B. Đâu là chuẩn?"*. | Im lặng suy diễn hoặc ngầm thay đổi định nghĩa mà không chốt với người dùng. | Cập nhật định nghĩa chuẩn vào `CONTEXT.md`. |
| **Từ ngữ mơ hồ / Nạp chồng nghĩa (Fuzzy Language)** | Đề xuất Canonical Term duy nhất, đưa các từ đồng nghĩa gây nhiễu vào danh sách `_Avoid_`. | Để nhiều từ đồng nghĩa trôi nổi trong PRD và code (`account` vs `user` vs `customer`). | Chốt Canonical Term trong Glossary. |
| **Mâu thuẫn giữa mô tả và mã nguồn hiện tại** | Rà soát code/schema hiện có. Nếu phát hiện code làm ngược lại lời nói, lập tức nêu rõ điểm bất đồng để chốt hướng xử lý. | Tin tưởng mù quáng lời nói của prompt mà không đối chiếu với hiện trạng codebase. | Xác định logic chuẩn trước khi viết PRD. |
| **Hệ thống mở rộng đa domain (Multi-Domain)** | Tạo/cập nhật `CONTEXT-MAP.md` ở root, phân tách `docs/domains/{domain}/CONTEXT.md` cho từng Bounded Context; định nghĩa quan hệ liên domain. | Gom tất cả thuật ngữ của 10 domain khác nhau vào 1 file `CONTEXT.md` khổng lồ gây ô nhiễm ngữ cảnh. | Duy trì Context Map chuẩn xác. |
| **Phát hiện quy tắc / trạng thái thực thể mới** | Ghi nhận ngay lập tức vào `_Domain Rules_` của thực thể trong `CONTEXT.md` (Chủ động làm giàu tri thức). | Để quy tắc nghiệp vụ rải rác trong comment hoặc chỉ nằm trong đầu dev. | Đồng bộ từ điển domain trước khi viết PRD. |
| **Yêu cầu có dấu hiệu phình to phạm vi** | Cắt lát mỏng (Thin Vertical Slice), tách phần cốt lõi cho MVP, đưa phần râu ria vào Phase 2. | Nhận toàn bộ scope mà không đánh giá độ phức tạp và chi phí. | Bàn giao sang `plan-challenge`. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Khảo Sát Bản Đồ Ngữ Cảnh & Ranh Giới Domain (Context Map Audit):**
   - Kiểm tra thư mục gốc: nếu có `CONTEXT-MAP.md`, đọc để xác định các Bounded Contexts hiện có.
   - Xác định tính năng mới thuộc domain nào. Nếu phát sinh domain mới trong hệ thống đa domain, tạo entry trong `CONTEXT-MAP.md` và khởi tạo `docs/domains/{domain}/CONTEXT.md`.
   - Nếu dự án đơn domain: duy trì tệp `CONTEXT.md` tại root.

2. **Lọc Qua 3 Lưỡi Dao Sát Hạch & Frontier Grilling:**
   - *Lưỡi Dao 1 (The Fork of Truth):* Bản chất hệ thống (client offline vs multi-tenant cloud).
   - *Lưỡi Dao 2 (The Data & Privacy Boundary):* Ranh giới dữ liệu (LocalStorage tạm thời vs DB có audit/auth).
   - *Lưỡi Dao 3 (The Exit Action):* Hành động kết thúc luồng nghiệp vụ của người dùng.
   - *Frontier Grilling:* Gom câu hỏi tầng quyết định vào 1 round qua `ask_question`, luôn kèm phương án `(Recommended)`. Tối đa 2 rounds.

3. **Mài Sắc Thuật Ngữ & Thử Thách Kịch Bản Cụ Thể (Active Sharpening):**
   - *Challenge against glossary:* So sánh từng thuật ngữ người dùng nêu với `CONTEXT.md`. Nếu lệch nghĩa, chất vấn để chốt.
   - *Sharpen fuzzy language:* Thay thế các từ mơ hồ bằng danh từ chuyên ngành chính xác.
   - *Discuss concrete scenarios:* Đặt ra kịch bản biên (edge cases) để stress-test mối quan hệ giữa các thực thể.
   - *Cross-reference with code:* Kiểm tra schema và logic code hiện tại xem có hỗ trợ đúng phát biểu không.

4. **Chủ Động Cập Nhật & Làm Giàu Tri Thức Nghiệp Vụ (Inline Context Enrichment):**
   - Cập nhật trực tiếp `CONTEXT.md` (hoặc `docs/domains/{domain}/CONTEXT.md`) ngay trong phiên làm việc.
   - Định dạng chuẩn cho mỗi thực thể:
     ```markdown
     **TermName**:
     {Định nghĩa 1-2 câu về bản chất thực thể - What it IS, not what it DOES}
     _Avoid_: {Danh sách từ cấm, từ đồng nghĩa gây nhầm lẫn}
     _Domain Rules_:
     - {Quy tắc bất biến cốt lõi, điều kiện hợp lệ, state transitions}
     ```
   - **Tuyệt đối không đưa chi tiết kỹ thuật/lập trình** (endpoint HTTP, table name, framework) vào `CONTEXT.md`.

5. **Soạn Thảo PRD Chuẩn Hóa:**
   - Tạo file `docs/specs/<feature>.prd.md`.
   - Cấu trúc: Bối cảnh, Personas, Functional Requirements (Gherkin: Given / When / Then), NFRs, và Acceptance Criteria định lượng.
   - Mọi thực thể trong PRD BẮT BUỘC dùng đúng thuật ngữ đã chốt trong `CONTEXT.md`.

6. **Ký Khóa Gate 0 Đầu Vào:**
   - Xác nhận PRD không chứa mâu thuẫn nội tại, thuật ngữ đồng bộ hoàn toàn với từ điển domain, chuyển giao sang `plan-challenge`.

---

# Section 4: Mechanical Verification Checklist

- [ ] File PRD tồn tại tại đúng đường dẫn: `test -f docs/specs/<feature>.prd.md`.
- [ ] PRD chứa tối thiểu 1 kịch bản Gherkin hoàn chỉnh: `grep -q "Scenario:" docs/specs/<feature>.prd.md && grep -q "Given " docs/specs/<feature>.prd.md`.
- [ ] Tệp `CONTEXT.md` (hoặc `CONTEXT-MAP.md` + per-domain context) tồn tại và được cập nhật các thuật ngữ mới.
- [ ] 100% thuật ngữ mới có định nghĩa chặt chẽ kèm danh sách `_Avoid_`.
- [ ] Không có xung đột giữa định nghĩa trong `CONTEXT.md` và mã nguồn hiện tại mà chưa được giải quyết.
- [ ] Không có chi tiết kỹ thuật/implementation bị lẫn vào `CONTEXT.md`.
- [ ] Quyết định tech stack thuộc về Agent, không đẩy câu hỏi kỹ thuật sang người dùng.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** User Prompt, Codebase hiện tại, `CONTEXT.md` / `CONTEXT-MAP.md`.
- **Đầu ra (Downstream Seam):** `docs/specs/<feature>.prd.md` và `CONTEXT.md` (hoặc `CONTEXT-MAP.md` + domain contexts) sẵn sàng cho `plan-challenge` và `contract-first-design`.

