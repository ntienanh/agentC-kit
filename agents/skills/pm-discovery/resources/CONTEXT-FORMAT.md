# Canonical CONTEXT.md Format

Tệp `CONTEXT.md` định nghĩa Ngôn ngữ chung (Ubiquitous Language) và Lõi nghiệp vụ (Domain Core) của một Bounded Context. Tệp này **tuyệt đối không chứa chi tiết kỹ thuật/cài đặt** (không chứa tên database, endpoint HTTP, framework).

---

## 1. Cấu Trúc Chuẩn

```markdown
# {Domain / Context Name}

{Mô tả 1-2 câu về mục tiêu tối thượng của domain này và lý do nó tồn tại trong hệ thống.}

## Language (Ubiquitous Language)

**{TermName}**:
{Định nghĩa chặt chẽ 1-2 câu giải thích thực thể này LÀ GÌ (bản chất), không giải thích nó LÀM GÌ.}
_Avoid_: {Danh sách các từ đồng nghĩa bị cấm, từ đa nghĩa gây nhầm lẫn}
_Domain Rules_:
- {Quy tắc bất biến nghiệp vụ 1 (ví dụ: Không thể hoàn tiền nếu đơn hàng đã giao quá 30 ngày)}
- {Quy tắc chuyển đổi trạng thái (State Transition Invariants)}

**{AnotherTerm}**:
{Định nghĩa bản chất}
_Avoid_: {Từ cấm}
```

---

## 2. Nguyên Tắc Cốt Lõi (Core Principles)

1. **Be Opinionated (Dứt khoát về thuật ngữ):** Khi có nhiều từ dùng cho cùng một khái niệm, chọn 1 thuật ngữ chuẩn duy nhất làm Canonical Term. Toàn bộ các từ còn lại đưa vào mục `_Avoid_`.
2. **Keep Definitions Tight (Định nghĩa súc tích):** Tối đa 1-2 câu. Định nghĩa bản chất sự vật (What it IS), không sa đà vào luồng code (What it DOES).
3. **Domain-Specific Only (Chỉ ghi tri thức nghiệp vụ):** Tuyệt đối không đưa các khái niệm lập trình chung (như `timeout`, `middleware`, `try-catch`, `dto`) vào glossary. Chỉ giữ các khái niệm thuộc về thế giới thực của nghiệp vụ.
4. **Active Inline Updates (Cập nhật chủ động tức thì):** Ngay khi một khái niệm mới được giải quyết hoặc có sự thay đổi quy tắc, cập nhật trực tiếp vào `CONTEXT.md`.
