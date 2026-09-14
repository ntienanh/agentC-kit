---
name: skill-intake
description: >-
  Bộ lọc 5W1H và Bảng chấm điểm 100 điểm (Scorecard) bắt buộc trước khi thêm mới hoặc nâng cấp
  bất kỳ kỹ năng nào trong AgentC-Kit. Ngăn chặn Skill Bloat, phát hiện trùng lặp tự động bằng BM25,
  đảm bảo mọi skill mới đều tuân thủ chuẩn 5 phần và gắn liền với Invariants cơ học.
inputs:
  - path: "agents/index.yaml"
    required: true
    description: "JIT Registry hiện tại để quét đối chiếu trùng lặp năng lực"
outputs:
  - path: "agents/skills/<name>/SKILL.md"
    description: "Tệp kỹ năng mới đạt chuẩn 5 phần (nếu quyết định ADD NEW)"
  - path: "agents/index.yaml"
    description: "Cập nhật registry thêm entry mới (nếu quyết định ADD NEW)"
tools:
  - view_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `skill-intake` đóng vai trò là **Người gác cổng chất lượng (Quality Gatekeeper)** của thư viện kỹ năng trong AgentC-Kit. Bất kỳ khi nào lập trình viên hoặc AI có ý định tạo mới hoặc nâng cấp một `SKILL.md`, quy trình này **BẮT BUỘC** phải tuân thủ nguyên tắc **Mặc định Ưu tiên Tích hợp (Enhance-First Default Bias)**:
1. **Ưu tiên Tích hợp Tuyệt đối (Enhance-First):** Mọi năng lực mới được đề xuất mặc định phải tìm cách tích hợp, mở rộng vào skill có sẵn ở cùng Gate (hoặc lân cận). CẤM tạo skill mới nếu skill hiện có có thể dung nạp mà không vi phạm ngân sách ngữ cảnh.
2. **Ngăn chặn Skill Bloat & Trùng lặp:** Quét đối chiếu cơ học bằng BM25 và đối chiếu trách nhiệm (Single Responsibility Principle) để chặn đứng tình trạng phân mảnh kỹ năng.
3. **Chuẩn hóa & Gắn kết Invariants:** Buộc mọi bổ sung (dù ENHANCE hay ADD NEW) phải đạt chuẩn 5 phần, dung lượng $\le 2000$ tokens và gắn kết với Invariants cơ học.

---

# Section 2: Decision Matrix & Bảng Chấm Điểm 100 Điểm

### 2.1 Bảng Chấm Điểm Tiêu Chí (Scorecard - 100 Điểm)

| Tiêu Chí 5W1H | Trọng Số | Cách Đánh Giá |
| :--- | :---: | :--- |
| **W1 — WHO (Vai trò & Gate)** | 10 pts | **+10**: Gán chính xác Gate (0..4) & vai trò subagent cụ thể.<br>**-10**: Khai báo chung chung "dùng cho tất cả". |
| **W2 — WHAT (Năng lực không trùng lặp)** | 20 pts | **+20**: BM25 `agentc match` cho score < 5.0 (năng lực hoàn toàn mới).<br>**-20**: BM25 score $\ge 7.5$ (trùng lặp năng lực có sẵn $\rightarrow$ ép ENHANCE). |
| **W3 — WHEN (Điều kiện kích hoạt cụ thể)** | 15 pts | **+15**: Có trigger event định lượng (ví dụ: "khi schema thay đổi", "khi có retry >= 2").<br>**+0**: Điều kiện mơ hồ. |
| **W4 — WHERE (Đúng cấu trúc chuẩn 5 phần)** | 15 pts | **+15**: Cam kết tuân thủ đúng 5 phần và dung lượng $\le 2000$ tokens.<br>**-15**: Thiếu Decision Matrix hoặc Checklist. |
| **W5 — WHY (Đo lường Before vs After)** | 25 pts | **+25**: Chỉ rõ số liệu/hành vi cải thiện (ví dụ: giảm X dòng code, chặn lỗi Y).<br>**+10**: Chỉ mô tả định tính. |
| **H1 — HOW (Gắn với Invariant cơ học)** | 15 pts | **+15**: Gắn kết với ít nhất 1 Invariant (INV-29..41) hoặc Guardrail.<br>**+0**: Không có Invariant liên quan. |

### 2.2 Quy Tắc Ưu Tiên Tích Hợp (Enhance-First Gate) & Ngưỡng Quyết Định

> [!IMPORTANT]
> **ĐIỀU KIỆN PHỦ QUYẾT ENHANCE-FIRST (Hard Integration Bias):**
> Trước khi áp dụng thang điểm để xét `ADD NEW`, phải thực hiện kiểm tra khả năng tích hợp:
> - **Nếu có skill đã tồn tại ở cùng Gate** có thể mở rộng để bao hàm năng lực mới (ví dụ: mở rộng protocol, input/output hoặc decision matrix) và dung lượng dự kiến sau khi gộp vẫn $\le 250$ dòng ($\le 2000$ tokens): **BẮT BUỘC CHỌN 🔄 ENHANCE**, cấm tạo skill mới.
> - Quyết định **✅ ADD NEW** chỉ được chấp thuận khi thỏa mãn đồng thời:
>   1. Tổng điểm Scorecard $\ge 85$ điểm.
>   2. Có minh chứng bất khả tích hợp (Non-integrability Proof): Năng lực hoàn toàn tách biệt về mặt kiến trúc, hoặc việc gộp vào skill hiện có sẽ phá vỡ SRP hay đẩy dung lượng vượt quá 250 dòng.

| Tổng Điểm Đạt Được | Quyết Định Hành Động | Hướng Xử Lý Tiếp Theo |
| :---: | :---: | :--- |
| **$\ge 85$ điểm** *(kèm Non-integrability Proof)* | ✅ **ADD NEW** | Cho phép tạo `agents/skills/<name>/SKILL.md` và đăng ký vào `agents/index.yaml`. |
| **$\ge 60$ điểm** *(hoặc còn dung lượng tích hợp)* | 🔄 **ENHANCE** | **ƯU TIÊN MẶC ĐỊNH**. Mở rộng và bổ sung trực tiếp vào skill hiện có gần nhất ở cùng Gate. |
| **$< 60$ điểm** | ❌ **REJECT** | **TỪ CHỐI**. Ghi lý do từ chối vào `docs/retrospectives/` để tránh lặp lại đề xuất. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Bước 1: Quét Đối Chiếu Trùng Lặp & Khảo Sát Khả Năng Tích Hợp (Automated BM25 & Integration Audit)**
   - Chạy lệnh tìm kiếm đối chiếu:
     ```bash
     ./cli/agentc match "<mô tả năng lực skill mới>" --json
     ```
   - Nếu skill top 1 có score $\ge 7.5$: Bắt buộc chuyển sang nhánh **🔄 ENHANCE** skill đó.
   - **Rà soát Enhance-First:** Ngay cả khi score $< 7.5$, kiểm tra danh sách skill hiện có ở Gate tương ứng. Nếu năng lực mới thuộc về cùng giai đoạn vòng đời (lifecycle phase) và skill hiện tại chưa đầy budget ($\le 250$ dòng), bắt buộc ưu tiên tích hợp (ENHANCE).

2. **Bước 2: Trả Lời Bộ Câu Hỏi 5W1H**
   - **WHO:** Kỹ năng phục vụ Gate nào trong 5-Gate Lifecycle (0, 1, 2, 3, 4)?
   - **WHAT:** Cung cấp capability cụ thể gì mà hệ thống hiện tại chưa thể làm được?
   - **WHEN:** Kích hoạt bởi trigger event nào? Tần suất dự kiến ra sao?
   - **WHERE:** Lưu tại `agents/skills/<kebab-case-name>/SKILL.md` với dung lượng $\le 2000$ tokens.
   - **WHY:** Hiện tại (Before) hệ thống xử lý thế nào? Sau khi có skill (After) hành vi cải thiện ra sao?
   - **HOW:** Gắn liền với Invariant nào trong bộ kiểm định?

3. **Bước 3: Tính Điểm & Thực Thi Theo Quyết Định**
   - **Nếu 🔄 ENHANCE (Ưu tiên mặc định khi có thể tích hợp):**
     1. Mở file `SKILL.md` của skill cùng Gate gần nhất.
     2. Bổ sung nhánh xử lý mới vào Section 2 (Decision Matrix) và Section 3 (Protocol), cập nhật outputs/inputs nếu có.
     3. Đảm bảo tổng số dòng sau chỉnh sửa không vượt quá 250 dòng.
     4. Thêm từ khóa mới vào entry của skill đó trong `agents/index.yaml`.
   - **Nếu ✅ ADD NEW ($\ge 85$ pts + Thỏa mãn Non-integrability Proof):**
     1. Tạo thư mục `agents/skills/<name>/`.
     2. Soạn thảo `SKILL.md` tuân thủ đủ 5 phần (YAML frontmatter, Overview, Decision Matrix, Protocol, Mechanical Checklist, Seams).
     3. Thêm entry vào `agents/index.yaml` kèm danh sách 10-15 keywords chọn lọc.
   - **Nếu ❌ REJECT (< 60 pts):**
     1. Dừng ngay lập tức, thông báo cho người dùng lý do điểm không đạt ngưỡng.

4. **Bước 4: Kiểm Chứng Cơ Học Bằng Lệnh Match**
   - Sau khi tạo hoặc cập nhật, chạy lệnh xác nhận:
     ```bash
     ./cli/agentc match "<keywords của skill vừa thêm/cập nhật>"
     ```
   - Xác nhận file tồn tại và nằm ở top kết quả.

---

# Section 4: Mechanical Verification Checklist

- [ ] Đã chạy kiểm tra trùng lặp bằng `./cli/agentc match` trước khi quyết định.
- [ ] Đã rà soát khả năng tích hợp theo nguyên tắc Enhance-First trước khi xét tạo mới.
- [ ] Tổng điểm Scorecard đạt yêu cầu và có minh chứng bất khả tích hợp nếu chọn ADD NEW.
- [ ] Tệp `SKILL.md` có đầy đủ 5 phần chuẩn hóa, không tự ý lược bớt.
- [ ] Dung lượng `SKILL.md` không vượt quá 250 dòng (~2000 tokens).
- [ ] Đã khai báo chính xác `name`, `gates`, `keywords`, `path` trong `agents/index.yaml`.
- [ ] Lệnh `./cli/agentc match` tìm ra đúng skill vừa tạo hoặc vừa nâng cấp.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Đề xuất ý tưởng từ Developer hoặc từ `post-mortem-analyzer` sau vòng phản hồi.
- **Đầu ra (Downstream Seam):** Tệp `agents/skills/<name>/SKILL.md` hoàn chỉnh sẵn sàng phục vụ cho các Subagent tại Gate tương ứng.
