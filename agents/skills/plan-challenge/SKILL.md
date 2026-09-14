---
name: plan-challenge
description: >-
  Kỹ năng Khảo sát Đối kháng, Thẩm định Đơn giản hóa Kế hoạch & Ban hành ADR (Chief Simplicity Officer,
  5W2H Challenge & Architecture Decision Records). Kích hoạt tại Gate 0 (Plan Challenge) khi tiếp nhận bản
  thảo PRD từ PM. Cung cấp công thức tính Complexity Score (T+I+S+A), 7 đòn bẩy tinh giản kiến trúc (YAGNI),
  bắt buộc tổng hợp Phương án B (Lean Alternative) và kết tinh quyết định vào docs/adr/.
inputs:
  - path: "docs/specs/<feature>.prd.md"
    required: true
    description: "Bản thảo PRD cần được sát hạch đối kháng"
outputs:
  - path: "docs/debates/<feature>.debate.md"
    description: "Biên bản tranh luận 5W2H, bảng tính Complexity Score, và Phương án B đã chốt"
  - path: "docs/adr/<index>-<decision>.md"
    description: "Bản ghi Quyết định Kiến trúc (Architecture Decision Record) lưu vết các lựa chọn kỹ thuật quan trọng"
tools:
  - view_file
  - write_to_file
---

# Section 1: Overview & Objective

Kỹ năng `plan-challenge` đóng vai trò gác cổng chống over-engineering và lãng phí tài nguyên phát triển. Mục tiêu cốt lõi là bảo vệ hệ thống khỏi các bẫy trừu tượng hóa sớm (premature abstraction), hạ tầng phân tán thừa thãi (distributed traps), và kiến trúc phình to. Kết quả đầu ra là biên bản tranh luận (`docs/debates/<feature>.debate.md`) với Complexity Score $\le 4$ cùng các Bản ghi Quyết định Kiến trúc (`docs/adr/000X-<title>.md`) lưu vết lâu dài các thỏa hiệp kỹ thuật.

---

# Section 2: Decision Matrix

| Complexity Score ($T+I+S+A$) | Phân Vùng Rủi Ro | Hành Động Bắt Buộc | Lối Thoát / Chuyển Giao |
| :---: | :--- | :--- | :--- |
| **0 – 3 Điểm** | 🟢 **Vùng Xanh (Lean)** | Phê duyệt nhanh (Fast-Pass). Không gây cản trở tiến độ. | Ký duyệt Gate 0, xuất bản ADR (nếu có tech trade-off), chuyển `contract-first-design`. |
| **4 – 6 Điểm** | 🟡 **Vùng Vàng (Cần Cắt Tỉa)** | Áp dụng 7 Đòn Bẩy Tinh Giản. Yêu cầu loại bỏ ít nhất 1 yếu tố điểm cao (ví dụ: dùng JSONB thay vì tạo 2 bảng mới). | Cắt tỉa scope, tính lại score $\le 4$, chốt ADR cho phương án tinh giản. |
| **$\ge 7$ Điểm** | 🔴 **Vùng Đỏ (Nguy Hiểm)** | **VETO Tức Thì (Hard Veto).** Từ chối thi công. Bắt buộc kích hoạt Phương Án B (Lean MVP Slice). | Viết lại PRD theo Phương Án B tối giản. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Tính Toán Định Lượng Complexity Score ($T + I + S + A$):**
   - **$T$ (Database Schema):** 0 = không đổi; 1 = thêm 1-2 cột nullable; 2 = thêm trường jsonb; 3 = tạo 1 bảng mới; 4 = tạo $>2$ bảng hoặc backfill data cũ.
   - **$I$ (Tích Hợp Bên Ngoài):** 0 = nội bộ module; 1 = gọi facade nội bộ; 2 = SDK bên thứ 3 chuẩn (S3, Sendgrid); 4 = webhook 2 chiều, thanh toán bên thứ 3 thiếu sandbox.
   - **$S$ (State & Concurrency):** 0 = stateless; 1 = trạng thái đơn giản; 2 = Idempotency Key / Optimistic Lock; 4 = state machine $>4$ trạng thái hoặc distributed lock (Redis).
   - **$A$ (Hạ Tầng Mới):** 0 = stack hiện có; 1 = cronjob; 3 = Redis queue / BullMQ; 5 = công nghệ mới ngoài Tech Radar (Kafka, Elastic, Microservice con).

2. **Áp Dụng 7 Đòn Bẩy Tinh Giản (Architectural Simplification Levers):**
   - *Đòn bẩy 1:* Cột `jsonb` thay vì đẻ thêm 3 bảng quan hệ phụ.
   - *Đòn bẩy 2:* Xử lý đồng bộ / Event nội bộ trước khi dựng Message Broker rời.
   - *Đòn bẩy 3:* PostgreSQL Full-Text Search / `ILIKE` thay vì dựng cụm Elasticsearch.
   - *Đòn bẩy 4:* Polling 3-5 giây thay vì mở kết nối WebSocket (trừ domain bắt buộc realtime $<500$ms).
   - *Đòn bẩy 5:* In-process service calls thay vì tách microservices.
   - *Đòn bẩy 6:* Extension `pgvector` tích hợp thay vì mua cụm Vector DB độc lập.
   - *Đòn bẩy 7:* Monorepo Modular Monolith thay vì Micro-Frontends phức tạp hóa build.

3. **Sát Hạch Bằng Bộ Khung 5W2H:**
   - *Why:* Giá trị cốt lõi nào bị mất nếu không làm tính năng này?
   - *What:* Phần nào trong PRD là "tưởng tượng cho tương lai" (YAGNI)?
   - *How much:* Chi phí bảo trì 3h sáng của phương án đề xuất là bao nhiêu?

4. **Biên Tập và Ban Hành Biên Bản Tranh Luận:**
   - Xuất bản `docs/debates/<feature>.debate.md` ghi nhận điểm số, các luận điểm bị bác bỏ và phương án chốt.

5. **Kết Tinh Quyết Định Kiến Trúc Vào ADR (`docs/adr/`):**
   - Khi tính năng đưa ra quyết định kỹ thuật mới (chọn database pattern, cơ chế cache/queue, đòn bẩy tinh giản):
   - Tạo file `docs/adr/<index>-<slug>.md` (ví dụ: `docs/adr/0001-use-jsonb-for-player-metadata.md`).
   - Cấu trúc chuẩn:
     * *Status:* Accepted.
     * *Context:* Thách thức kiến trúc và bối cảnh nghiệp vụ từ PRD.
     * *Decision:* Giải pháp được chọn nhằm giữ Complexity Score $\le 4$.
     * *Consequences:* Hệ quả kỹ thuật, lợi ích và đánh đổi (trade-offs).
     * *Alternatives Considered:* Phương án B và các giải pháp over-engineering đã bị loại bỏ.

---

# Section 4: Mechanical Verification Checklist

- [ ] File debate tồn tại: `test -f docs/debates/<feature>.debate.md`.
- [ ] Complexity Score được ghi nhận rõ ràng và đạt $\le 4$: `grep -q "Complexity Score:" docs/debates/<feature>.debate.md`.
- [ ] Có phương án B (Lean Alternative) rõ ràng: `grep -q "Phương Án B" docs/debates/<feature>.debate.md || grep -q "Plan B" docs/debates/<feature>.debate.md`.
- [ ] Thư mục hoặc tệp ADR được cập nhật khi có quyết định kiến trúc: `test -d docs/adr`.
- [ ] Exit Code kiểm tra: Lệnh kiểm tra trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `docs/specs/<feature>.prd.md` và `CONTEXT.md` từ `pm-discovery`.
- **Đầu ra (Downstream Seam):** `docs/debates/<feature>.debate.md` và `docs/adr/<index>-<decision>.md` chuyển sang `contract-first-design` để khóa hợp đồng.
