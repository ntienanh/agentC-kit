---
name: post-mortem-analyzer
description: >-
  Kỹ năng Phân tích Hậu kỳ & Vòng Phản hồi Tự Cải thiện (Post-Mortem Analyzer & Feedback Loop).
  Kích hoạt tự động sau mỗi lần Circuit Breaker tripped (deadlock-arbitration được gọi) hoặc
  sau khi cùng một Invariant bị vi phạm trên 2 lần trong cùng một run. Phân loại nguyên nhân
  gốc rễ, đề xuất cải tiến cụ thể cho SKILL.md hoặc scripts, và tạo file retrospective chuẩn.
inputs:
  - path: ".agentc/runs/*.json"
    required: true
    description: "Audit run logs từ run-audit-logger.sh để phân tích pattern lỗi"
  - path: "docs/debates/arbitration-ruling.md"
    required: false
    description: "Biên bản phán quyết từ deadlock-arbitration (nếu có)"
outputs:
  - path: "docs/retrospectives/<YYYY-MM-DD>-postmortem.md"
    description: "Báo cáo hậu kỳ với Root Cause Classification và đề xuất cải tiến cụ thể"
tools:
  - view_file
  - find_by_name
  - write_to_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `post-mortem-analyzer` đóng vai trò là vòng học hỏi cấp hệ thống — phân biệt với việc tự sửa lỗi trong một tác vụ đơn lẻ. Mục tiêu là nhận biết các pattern lỗi lặp lại xuyên nhiều phiên làm việc, phân loại nguyên nhân gốc rễ theo taxonomy chuẩn, và chuyển hóa bài học thành đề xuất cải tiến hữu hình: thêm checklist vào SKILL.md, bổ sung regex pattern vào scripts, hoặc điều chỉnh kiến trúc skill.

---

# Section 2: Decision Matrix

| Trigger Signal | Root Cause Category | Hành Động Đề Xuất | Artifact Đầu Ra |
| :--- | :--- | :--- | :--- |
| **Circuit Breaker tripped (retry >= 3)** | Architecture Violation / Contract Mismatch | Thêm checklist item vào skill liên quan; bổ sung regex check vào scripts | `docs/retrospectives/<date>-postmortem.md` |
| **Cùng Invariant bị vi phạm >= 2 lần** | Missing Mechanical Rule | Đề xuất thêm pattern phát hiện mới vào script checker tương ứng | Diff proposal cho script |
| **Context Overload dẫn đến LLM skip rule** | Context Saturation | Đề xuất tách kỹ năng thành sub-skill nhỏ hơn hoặc giảm scope Decision Matrix | Refactor proposal cho SKILL.md |
| **External Dependency failure** | Environment / Toolchain Issue | Cập nhật pre-flight checklist trong `devops-lifecycle-and-reaper` | Checklist item mới |
| **Spec Drift detected > 2 lần** | Ambiguous PRD / Weak Acceptance Criteria | Đề xuất bổ sung Gherkin scenarios cụ thể hơn vào template PRD | Template update proposal |

---

# Section 3: Step-by-Step Execution Protocol

1. **Thu Thập Bằng Chứng (Evidence Gathering):**
   - Đọc tất cả file JSON trong `.agentc/runs/` cho phiên làm việc hiện tại.
   - Xác định các run có `exit_code: 1` và `violations > 0`.
   - Kiểm tra `docs/debates/arbitration-ruling.md` nếu tồn tại.

2. **Phân Loại Nguyên Nhân Gốc Rễ (Root Cause Classification):**
   - Áp dụng taxonomy 5 loại: Architecture Violation, Missing Mechanical Rule, Context Saturation, Environment Issue, Ambiguous PRD.
   - Không dừng ở triệu chứng (symptom) — phải xác định đến tầng nguyên nhân thực sự.

3. **Soạn Báo Cáo Hậu Kỳ (Retrospective Document):**
   - Tạo file `docs/retrospectives/<YYYY-MM-DD>-postmortem.md` với cấu trúc chuẩn:
     - **What happened:** Mô tả sự kiện khách quan (circuit breaker, violation pattern).
     - **Root cause:** Phân loại chính xác theo taxonomy.
     - **Impact:** Số retries lãng phí, token tiêu tốn thêm.
     - **Proposed improvements:** Danh sách cụ thể với file path và nội dung đề xuất sửa đổi.
     - **Action items:** Ai (skill nào) làm gì, deadline (next run hay next sprint).

4. **Tạo Diff Đề Xuất (Non-Destructive Proposal):**
   - Viết nội dung đề xuất sửa đổi `SKILL.md` hoặc script dưới dạng diff markdown.
   - **TUYỆT ĐỐI KHÔNG tự apply thay đổi vào SKILL.md hoặc scripts** — chỉ đề xuất, con người phải review và approve.

5. **Ghi Nhận Vào Metrics (Feedback Metrics Update):**
   - Append vào `.agentc/metrics/metrics.jsonl` một record loại `postmortem` với root cause classification.

---

# Section 4: Mechanical Verification Checklist

- [ ] File retrospective tồn tại: `test -f docs/retrospectives/*.md`
- [ ] Báo cáo chứa đủ 5 mục: What happened, Root cause, Impact, Proposed improvements, Action items.
- [ ] Không có thay đổi tự động nào được apply vào SKILL.md hoặc scripts (chỉ đề xuất).
- [ ] Root cause được phân loại theo đúng taxonomy 5 loại, không phải mô tả chung chung.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `.agentc/runs/*.json` audit logs, `docs/debates/arbitration-ruling.md`.
- **Đầu ra (Downstream Seam):** `docs/retrospectives/<date>-postmortem.md` — nguồn đầu vào cho con người review và quyết định cải tiến quy chuẩn kit.
