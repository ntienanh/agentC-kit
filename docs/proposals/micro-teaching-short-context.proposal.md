# Đề Xuất Kỹ Thuật: Micro-Teaching Cho Prompt Đơn Lẻ & Ngữ Cảnh Nhỏ (Short Context)

> **Mã đề xuất:** RFC-2026-09-MICRO-TEACH  
> **Trạng thái:** 🟡 **DRAFT / PROPOSAL (Lưu trữ tham chiếu)**  
> **Chủ đề:** Ứng dụng triết lý sư phạm của `teach` vào tương tác prompt đơn lẻ, loại bỏ overhead workspace  
> **Tham chiếu gốc:** [skills.sh/mattpocock/skills/teach](https://www.skills.sh/mattpocock/skills/teach)

---

## 1. Bản Chất Kỹ Năng Gốc (`teach` của Matt Pocock)

Kỹ năng `teach` được thiết kế cho việc **đào tạo dài hạn có trạng thái (Stateful Multi-Session Learning)**:
- **Cơ chế:** Biến thư mục làm việc hiện tại thành một "Teaching Workspace" tự động sinh ra hàng loạt file:
  - `MISSION.md`: Định hình mục tiêu tối thượng và ranh giới học tập.
  - `RESOURCES.md`: Thư mục tài liệu chọn lọc từ nguồn uy tín.
  - `NOTES.md`: Scratchpad lưu ghi chú và sở thích cá nhân.
  - `reference/*.html`: Bảng tra cứu, cheat sheet đẹp mắt (phong cách Tufte).
  - `learning-records/*.md`: Bản ghi các ngộ nhận và hiểu biết phi hiển nhiên (tương đương ADR trong phần mềm).
  - `lessons/*.html`: Các bài học độc lập dạng web HTML.
- **Triết lý:**
  - Phân biệt giữa **Fluency strength** (hiểu tức thời) và **Storage strength** (ghi nhớ dài hạn).
  - Sử dụng **Desirable difficulty**: Gợi mở người học tự nhớ lại (Retrieval practice), giãn cách thời gian (Spacing), và đan xen chủ đề (Interleaving).

---

## 2. Phân Tích Độ Tương Thích Với "Prompt Đơn Lẻ & Ngữ Cảnh Nhỏ"

### ❌ Mâu Thuẫn Cốt Tử Nếu Dùng Nguyên Bản (Anti-Patterns)
1. **Workspace Pollution (Làm bẩn thư mục dự án):** Người dùng chỉ hỏi một câu ngắn (ví dụ: *"Tại sao chỗ này dùng Compound Component?"* hoặc *"Khác biệt giữa React.cache và useMemo?"*). Nếu Agent tự sinh ra 5-6 tệp `.md` và `.html`, dự án sẽ bị rác hóa, vi phạm nghiêm trọng tính toàn vẹn của repo.
2. **Context Token Exhaustion:** Bộ nhớ làm việc trong ngữ cảnh ngắn (short context / prompt đơn lẻ) rất hạn hẹp. Việc khởi tạo toàn bộ scaffolding sẽ "đốt cháy" ngân sách token mà không mang lại giá trị tương xứng (vi phạm Axiom 5: Context Budgeting).
3. **Lệch Pha Ý Định Người Dùng (Mismatched Intent):** Dev cần câu trả lời tức thời, thực chiến để mở khóa công việc ngay, không phải một khóa học lý thuyết nhiều bài.

---

### 💡 Chắt Lọc Tinh Hoa Cho Ngữ Cảnh Nhỏ: Mô Hình "Inline Micro-Teaching"

Thay vì sinh ra file vật lý, Agent chuyển hóa triết lý sư phạm thành **Cấu trúc phản hồi 4 bước siêu tinh gọn (<= 25 dòng / 250 từ)**:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Core Insight: 1 câu giải thích đúng bản chất kỹ thuật    │
├─────────────────────────────────────────────────────────────┤
│ 2. The Mental Trap: Sai lầm trực giác phổ biến (Fluency)    │
├─────────────────────────────────────────────────────────────┤
│ 3. Canonical Pattern: Code chuẩn tối giản (Zero comments)   │
├─────────────────────────────────────────────────────────────┤
│ 4. 1-Liner Reflection: Câu hỏi gợi mở tư duy (Storage)      │
└─────────────────────────────────────────────────────────────┘
```

#### Ví dụ minh họa (Phản hồi prompt đơn lẻ):
* **User hỏi:** *"Tại sao không nên dùng boolean flag `isEdit` trong modal?"*
* **Agent phản hồi theo phong cách Micro-Teaching:**
  > **1. Core Insight:** Mỗi cờ boolean nhân đôi không gian trạng thái ($2^n$). Thêm 3 cờ tạo ra 8 trạng thái, khiến logic render phân mảnh và khó kiểm thử.
  >
  > **2. Mental Trap:** Nghĩ rằng tái sử dụng 1 component đa năng (`<PlayerModal isEdit isDetail />`) sẽ giảm code, nhưng thực tế làm component phình to với các điều kiện `if/else` chéo.
  >
  > **3. Canonical Pattern (Explicit Variants):**
  > ```tsx
  > export const CreatePlayerModal = () => <BaseModal title="Tạo mới"><PlayerForm /></BaseModal>;
  > export const EditPlayerModal = ({ id }: { id: string }) => <BaseModal title="Chỉnh sửa"><PlayerEditForm id={id} /></BaseModal>;
  > ```
  >
  > **4. Active Reflection:** *Nếu nghiệp vụ yêu cầu thêm bước xác thực 2FA chỉ khi Sửa mà không cần khi Tạo, cấu trúc boolean cũ sẽ phải sửa bao nhiêu nhánh `if`?*

---

## 3. Đánh Giá Theo Bộ Lọc `skill-intake` (Scorecard)

| Tiêu Chí 5W1H | Đánh Giá Kỹ Thuật | Điểm Số |
| :--- | :--- | :---: |
| **W1 — WHO** | Phục vụ trải nghiệm giải thích (DX/Communication), không thuộc Gate 0-4 kỹ thuật. | 5 / 10 |
| **W2 — WHAT** | Hướng dẫn phương pháp sư phạm cho Agent khi trả lời tin nhắn đơn lẻ. | 15 / 20 |
| **W3 — WHEN** | Kích hoạt khi người dùng hỏi giải thích khái niệm hoặc lý do kiến trúc. | 10 / 15 |
| **W4 — WHERE** | Không nên là file `SKILL.md` độc lập trong kernel vì không có trigger cơ học. | 5 / 15 |
| **W5 — WHY** | Cải thiện độ sâu tiếp thu của dev từ hiểu hời hợt sang nắm vững cốt lõi. | 15 / 25 |
| **H1 — HOW** | Không gắn với Invariant cơ học (INV-29..41) nào của build/release pipeline. | 0 / 15 |
| **TỔNG ĐIỂM** | **50 / 100 Điểm** | **< 60: REJECT as Kernel Skill** |

---

## 4. Kết Luận & Khuyến Nghị Kiến Trúc

1. **Không tạo standalone skill trong `agents/skills/`:** Tránh Skill Bloat và giữ vững trọng tâm kiến trúc công nghiệp của AgentC-Kit.
2. **Khai thác Slash Command `/learn`:** Khi người dùng muốn đúc kết một bài học từ ngữ cảnh ngắn để lưu trữ lâu dài vào quy tắc của Agent, hướng dẫn họ sử dụng slash command `/learn`.
3. **Ứng dụng ngầm vào Interaction Policy của Agent:** Khi nhận các prompt hỏi đáp ngắn mang tính tìm hiểu, Agent chủ động áp dụng cấu trúc **Inline Micro-Teaching (Core Insight $\rightarrow$ Trap $\rightarrow$ Pattern $\rightarrow$ Reflection)** thay vì xả văn bản dài dòng.
