# Context7 MCP Server Guide (Upstash)

Tài liệu hướng dẫn vận hành và tra cứu tài liệu thư viện theo thời gian thực qua **Context7 MCP Server** trong AgentC-Kit.

---

## 1. Tổng Quan & Mục Tiêu

Context7 MCP Server ([https://lobehub.com/mcp/upstash-context7](https://lobehub.com/mcp/upstash-context7)) cung cấp khả năng tra cứu tài liệu kỹ thuật, cú pháp API và ví dụ mã nguồn theo phiên bản cụ thể cho hơn 1000+ thư viện, SDK và frameworks (Next.js 16, Ant Design 6, Tailwind 4, TanStack Query 5, Zustand 5, v.v.).

### Mục tiêu cốt lõi:
- **Triệt tiêu Ảo giác API (Zero API Hallucination):** Luôn lấy tài liệu mới nhất thay vì phỏng đoán dựa trên dữ liệu pre-training cũ.
- **Tiết kiệm Ngân sách Ngữ cảnh (Context Budgeting):** Trả về lát cắt code snippets và API signatures ngắn gọn ($\le 1000$ tokens), tránh cào toàn bộ trang web gây tràn context.

---

## 2. Danh Mục Công Cụ (Tool Definitions)

Context7 cung cấp 2 công cụ chính:

### 1. `resolve-library-id`
- **Mục đích:** Tìm kiếm định danh thư viện (`library-id`) chính xác từ tên package hoặc framework.
- **Tham số:**
  * `query`: Tên thư viện cần tìm (ví dụ: `"nextjs"`, `"antd"`, `"zustand"`).
- **Đầu ra:** Danh sách các library ID khả dụng (ví dụ: `nextjs`, `ant-design`, `zustand`).

### 2. `query-docs`
- **Mục đích:** Truy vấn tài liệu, hàm, hooks hoặc cú pháp cụ thể của một thư viện đã biết ID.
- **Tham số:**
  * `library_id`: ID định danh của thư viện (lấy từ `resolve-library-id`).
  * `query`: Vấn đề kỹ thuật hoặc API cần tra cứu (ví dụ: `"App router parallel routes"`, `"Antd Form Form.useWatch"`, `"Zustand 5 createStore"`).
- **Đầu ra:** Tài liệu Markdown cô đọng, code examples chính xác theo phiên bản.

---

## 3. Vị Trí Áp Dụng Trong 5-Gate Lifecycle

| Gate | Giai Đoạn | Kịch Bản Gọi Context7 | Subagent Phụ Trách |
| :---: | :--- | :--- | :--- |
| **Gate 1** | Contract & Schema | Tra cứu type definitions, decorator của ORM mới (Prisma/TypeORM), class-validator rules. | Contract Architect |
| **Gate 2** | Wire-Up & Impl | Tra cứu breaking changes của Next.js 16, hook APIs của TanStack Query v5, token config của Antd 6. | Worker Pods (FE/BE) |
| **Gate 3** | Code Review & Audit | Đối chiếu xem mã nguồn có sử dụng các APIs deprecated hoặc sai quy chuẩn của thư viện không. | Standards Reviewer |

---

## 4. Cấu Hình Trong `.mcp.json`

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY:-}"
      },
      "autoApprove": [
        "resolve-library-id",
        "query-docs"
      ]
    }
  }
}
```

---

## 5. Quy Tắc Gọi Dành Cho Agents

1. **Ưu tiên Context7 hơn Web Search** khi tra cứu cú pháp thư viện bên thứ 3.
2. **Không dùng Context7** cho các logic nghiệp vụ nội bộ của dự án (hãy đọc `CONTEXT.md` và `docs/specs/*.prd.md`).
3. Chỉ lấy đúng đoạn API cần dùng, không đưa toàn bộ tài liệu vào lời nhắc để bảo vệ ngân sách ngữ cảnh (Invariant 6).
