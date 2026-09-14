---
name: code-review
description: >-
  Kỹ năng Thẩm định Mã nguồn Song song 2 Trục (Two-Axis Code Review: Standards & Spec).
  Kích hoạt tại Gate 2 hoặc Gate 3 khi thẩm định pull request, diff thay đổi so với mốc commit/nhánh gốc,
  hoặc trước khi đóng Gate. Điều phối 2 subagent chạy song song: Trục 1 (Standards) rà soát 12 Code Smells
  của Martin Fowler & Invariants kiến trúc của Kit; Trục 2 (Spec) đối chiếu độ trung thực với PRD/Issue.
  Tổng hợp báo cáo song song không làm lu mờ lẫn nhau.
inputs:
  - path: "git:diff"
    required: true
    description: "Lệnh diff giữa HEAD và mốc so sánh (commit, branch, tag, hoặc merge-base)"
  - path: "docs/specs/<feature>.prd.md"
    required: false
    description: "Tài liệu PRD đặc tả nghiệp vụ làm căn cứ cho Spec Axis"
outputs:
  - path: "docs/specs/code-review-report.md"
    description: "Báo cáo thẩm định song song 2 trục (Standards & Spec) kèm danh sách vi phạm định lượng"
tools:
  - view_file
  - write_to_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `code-review` loại bỏ thiên kiến đánh giá phiến diện bằng cách thẩm định diff mã nguồn theo **2 Trục Độc lập (Two-Axis Code Review)**:
1. **Trục Tiêu Chuẩn (Standards Axis):** Mã nguồn có tuân thủ các quy tắc kiến trúc của repository, các Invariants cơ học của AgentC-Kit và 12 Code Smells kinh điển của Martin Fowler không?
2. **Trục Đặc Tả (Spec Axis):** Mã nguồn có hiện thực hóa trung thực, đầy đủ các yêu cầu trong `docs/specs/<feature>.prd.md` mà không phát sinh scope creep không?

Một thay đổi có thể pass trục này nhưng fail trục kia:
- Code sạch bóng, không lỗi style nhưng làm sai nghiệp vụ $\rightarrow$ *Standards PASS, Spec FAIL*.
- Code chạy đúng tính năng nhưng phá vỡ Clean Architecture, nát code smells $\rightarrow$ *Spec PASS, Standards FAIL*.

Bằng cách điều phối 2 sub-agent chạy song song trong các context độc lập và tổng hợp báo cáo song song, kỹ năng bảo đảm không trục nào bị che mờ bởi trục kia.

---

# Section 2: Decision Matrix

| Trục Đánh Giá | Đối Tượng Thẩm Định | Tiêu Chuẩn Áp Dụng | Phân Loại Phát Hiện |
| :--- | :--- | :--- | :--- |
| **Trục 1: Standards (Invariants)** | Toàn bộ các file mới và sửa đổi trong git diff. | Invariants cơ học (INV-31: Zero Comments, INV-33: Anti-Barrel, INV-35: PascalCase, INV-40: Zero manual loading). | **Hard Violation**: Bắt buộc sửa 100% trước khi đóng Gate. |
| **Trục 1: Standards (Code Smells)** | Cấu trúc lớp, hàm, và luồng gọi logic trong diff. | 12 Fowler Smells: Mysterious Name, Duplicated Code, Feature Envy, Data Clumps, Primitive Obsession, Repeated Switches, Shotgun Surgery, Divergent Change, Speculative Generality, Message Chains, Middle Man, Refused Bequest. | **Judgement Call**: Cảnh báo kèm phương án refactor tương ứng. |
| **Trục 2: Spec (Missing Logic)** | Đối chiếu từng kịch bản Gherkin trong PRD với mã nguồn. | Mọi điều kiện `Given / When / Then` và Acceptance Criteria trong PRD. | **Spec Breach**: Thiếu sót yêu cầu nghiệp vụ bắt buộc. |
| **Trục 2: Spec (Scope Creep)** | Các file, endpoints, hoặc helper functions nằm ngoài PRD. | Phạm vi MVP được phê duyệt tại Gate 0. | **Scope Creep**: Đề xuất loại bỏ hoặc chuyển sang Phase 2. |
| **Trục 2: Spec (Sai Lệch Tri Thức)** | Tên biến, enum, DTO và hành vi thực thể. | Từ điển thuật ngữ chung trong `CONTEXT.md`. | **Domain Drift**: Vi phạm ngôn ngữ chung (Ubiquitous Language). |

---

# Section 3: Step-by-Step Execution Protocol

1. **Ghim Mốc So Sánh (Pin the Fixed Point):**
   - Xác định mốc so sánh với HEAD (branch gốc, tag, hoặc `git merge-base main HEAD`).
   - Kiểm tra diff không rỗng:
     ```bash
     git diff --stat <fixed-point>...HEAD
     ```

2. **Thu Thập Căn Cứ Thẩm Định (Gather Inputs):**
   - *Nguồn Spec:* Đọc file `docs/specs/<feature>.prd.md` và `CONTEXT.md`.
   - *Nguồn Standards:* Đọc `AGENTS.md` (các Invariants) và 12 Code Smells baseline.

3. **Điều Phối Thẩm Định Song Song (Spawn Parallel Reviews):**
   - **Subagent 1 (Standards Reviewer):**
     * Quét diff tìm kiếm vi phạm Invariants của Kit (Zero Comments, Anti-Barrel, Zero manual loading).
     * Rà soát 12 Code Smells. Với mỗi smell, chỉ rõ dòng code và giải pháp khắc phục.
     * Dung lượng báo cáo: $\le 400$ từ.
   - **Subagent 2 (Spec Reviewer):**
     * Đối chiếu từng tiêu chí nghiệm thu và kịch bản Gherkin xem đã có mã xử lý tương ứng chưa.
     * Phát hiện scope creep hoặc logic triển khai sai lệch với PRD.
     * Dung lượng báo cáo: $\le 400$ từ.

4. **Tổng Hợp Báo Cáo Song Song (Aggregate Side-by-Side):**
   - Xuất bản tệp `docs/specs/code-review-report.md` với 2 phân khu rõ ràng:
     * `## Standards Findings` (Ghi rõ Hard Violations và Heuristic Smells).
     * `## Spec Findings` (Ghi rõ Missing Requirements và Scope Creep).
   - Tóm tắt 1 dòng định lượng: Tổng số vi phạm mỗi trục và vấn đề nghiêm trọng nhất cần sửa.
   - **CẤM gộp hoặc xếp hạng đè lên nhau giữa 2 trục.**

---

# Section 4: Mechanical Verification Checklist

- [ ] Lệnh diff xác định rõ mốc so sánh và có dữ liệu thay đổi hợp lệ.
- [ ] Cả 2 trục Standards và Spec đều được thẩm định đầy đủ.
- [ ] Không có vi phạm Invariant cơ học nào bị bỏ qua trong phần Standards.
- [ ] Mọi kịch bản Gherkin trong PRD được đối soát 1-1 trong phần Spec.
- [ ] Báo cáo được xuất bản tại `docs/specs/code-review-report.md`.
- [ ] Tất cả Hard Violations được chuyển giao cho Worker Pod khắc phục trước khi đóng Gate.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Git diff của nhánh làm việc, `docs/specs/<feature>.prd.md`, và `CONTEXT.md`.
- **Đầu ra (Downstream Seam):** `docs/specs/code-review-report.md` làm căn cứ nghiệm thu Gate 2 chuyển sang Gate 3 (Security & Audit).
