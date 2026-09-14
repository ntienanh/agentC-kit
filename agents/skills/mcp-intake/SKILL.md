---
name: mcp-intake
description: >-
  Bộ lọc 5W1H và Bảng chấm điểm 100 điểm (Scorecard) bắt buộc trước khi tích hợp, cấu hình
  hoặc cho phép bất kỳ MCP Server nào hoạt động trong AgentC-Kit. Ngăn chặn Context Bloat,
  phát hiện xung đột định danh tools (Namespace Collision), thẩm định an ninh thực thi lệnh,
  và kiểm soát ngân sách tokens theo Invariant 6.
inputs:
  - path: ".mcp.json"
    required: true
    description: "Tệp cấu hình MCP Servers của dự án để rà soát xung đột tools và quyền thực thi"
  - path: "agents/index.yaml"
    required: true
    description: "JIT Registry để đối chiếu năng lực và liên kết với các skills sử dụng MCP"
outputs:
  - path: ".mcp.json"
    description: "Cấu hình MCP Server đã được phê duyệt kèm whitelist autoApprove chặt chẽ"
  - path: "docs/mcp/<server-name>.md"
    description: "Tài liệu hướng dẫn gọi tools và ngân sách ngữ cảnh cho subagents"
tools:
  - view_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `mcp-intake` đóng vai trò là **Người gác cổng An toàn & Năng lực MCP (MCP Quality & Security Gatekeeper)** của AgentC-Kit. Khi một MCP Server ngoại vi (từ Lobehub, Smithery, GitHub hoặc dịch vụ SaaS) được đề xuất tích hợp vào Kit, quy trình này bắt buộc phải kiểm tra và ngăn chặn 4 rủi ro lớn:
1. **Lãng phí Ngân sách Ngữ cảnh (Context Bloat):** Mỗi tool schema đưa vào context tiêu tốn token cố định trong mỗi turn gọi. Tổng schema các tools của một server không được vượt quá 1000 tokens (Invariant 6).
2. **Xung đột Định danh Tools (Namespace Collisions):** Ngăn chặn tình trạng các MCP server khác nhau đăng ký trùng tên hàm làm sai lệch điều hướng công cụ (Tool Routing).
3. **Rủi ro An ninh Thực thi (Arbitrary Execution & Secret Leak):** Ngăn chặn các server đòi hỏi quyền root/sudo, script nhị phân không rõ nguồn gốc hoặc hardcode secret credentials.
4. **Năng lực Trùng lặp (Capability Redundancy):** Cấm tích hợp MCP server nếu tính năng đó đã được giải quyết hiệu quả bằng CLI hoặc Skill sẵn có.

---

# Section 2: Decision Matrix

### 2.1 Bảng Chấm Điểm MCP Scorecard (100 Điểm)

| Tiêu Chí MCP 5W1H | Trọng Số | Cách Thức Đánh Giá Định Lượng |
| :--- | :---: | :--- |
| **M1 — Capability Delta (Độ cần thiết)** | 25 pts | **+25**: Cung cấp năng lực độc quyền (live documentation theo phiên bản, phân tích AST đồ thị, vector search) mà script nội bộ không làm được.<br>**-25**: Bọc lại lệnh CLI đơn giản có sẵn (như git, ls, curl). |
| **M2 — Security & Permissions (An ninh)** | 25 pts | **+25**: Chạy không cần root; hỗ trợ sandbox; API Keys truyền an toàn qua `env`; có danh sách whitelist `autoApprove` rõ ràng.<br>**-25**: Yêu cầu quyền ghi tệp tùy tiện hoặc thực thi shell tùy ý không kiểm soát. |
| **M3 — Context Overhead (Ngân sách Tokens)** | 20 pts | **+20**: Tổng tool schemas $\le 1000$ tokens; kết quả trả về có cơ chế phân trang hoặc cắt lát tinh gọn $\le 2000$ tokens.<br>**-20**: Đăng ký hàng chục tools rác làm phình to context window. |
| **M4 — Zero Collision (Không xung đột tên)** | 15 pts | **+15**: Tên tools độc nhất, có tiền tố rõ ràng hoặc không trùng với `agentc_*`, file tools, hay AST tools.<br>**-15**: Trùng tên hàm gây nhầm lẫn trong quá trình tool routing. |
| **M5 — Invariants & Lifecycle Seam (Gắn kết Kit)** | 15 pts | **+15**: Gán chính xác vào Gate (0..4), ánh xạ rõ vào Invariant kỹ thuật của Kit.<br>**+0**: Không rõ gắn vào Gate nào. |

### 2.2 Ngưỡng Quyết Định Hành Động

| Tổng Điểm Đạt Được | Quyết Định Hành Động | Hướng Xử Lý Tiếp Theo |
| :---: | :---: | :--- |
| **$\ge 85$ điểm** | ✅ **APPROVE & MOUNT** | Cho phép khai báo vào `.mcp.json` kèm whitelist `autoApprove` và liên kết với các JIT skills liên quan. |
| **$60 - 84$ điểm** | ⚠️ **CONDITIONAL MOUNT** | Chỉ nạp khi chạy tác vụ chuyên biệt (on-demand), tuyệt đối không cấp quyền `autoApprove`. |
| **$< 60$ điểm** | ❌ **REJECT** | Từ chối tích hợp, đưa ra giải pháp thay thế bằng native CLI hoặc Script nội bộ. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Kiểm Tra Trùng Lặp & Xung Đột Định Danh (Namespace Collision Audit):**
   - Đọc danh sách tool names hiện có trong `.mcp.json` và system tools.
   - So sánh danh sách tools của MCP Server mới:
     * Nếu trùng tên tool có sẵn: Yêu cầu đổi tên có prefix (ví dụ: `<server>_<tool>`) hoặc từ chối.
     * Xác nhận các tools mới không làm loãng semantic space của LLM.

2. **Đo Lường Ngân Sách Ngữ Cảnh (Schema Budget Sizing):**
   - Đếm số lượng tools do server xuất bản (khuyến nghị $\le 5$ tools cho 1 server).
   - Kiểm tra dung lượng JSON Schema: Đảm bảo tổng số tokens của toàn bộ schema $\le 1000$ tokens.
   - Xác nhận cơ chế trả về dữ liệu (output slicing): Kết quả trả về phải trích xuất đúng lát cắt cần thiết, không dội toàn bộ raw JSON dung lượng lớn vào context.

3. **Thẩm Định An Ninh & Cấu Hình Môi Trường (Security Hardening):**
   - Xác minh binary/npx package: Phải là gói chính thức được cộng đồng xác thực (Official Verified Publisher).
   - Tuyệt đối không lưu API Key trực tiếp trong `.mcp.json`; dùng cú pháp biến môi trường:
     ```json
     "env": {
       "SERVER_API_KEY": "${SERVER_API_KEY:-}"
     }
     ```
   - Xác định danh sách các tools an toàn (read-only) để đưa vào mảng `autoApprove`.

4. **Khai Báo Cấu Hình & Xuất Bản Hướng Dẫn:**
   - Cập nhật `.mcp.json` với cấu trúc chuẩn.
   - Tạo tài liệu hướng dẫn tra cứu tại `docs/mcp/<server-name>.md` ghi rõ: Mục đích, cú pháp gọi, và ngữ cảnh sử dụng tại các Gates.
   - Cập nhật từ khóa liên quan trong `agents/index.yaml` để các subagents biết thời điểm gọi tool.

---

# Section 4: Mechanical Verification Checklist

- [ ] Tổng điểm Scorecard đạt $\ge 85$ điểm (hoặc $\ge 60$ với Conditional Mount).
- [ ] 0 xung đột tên tool với các công cụ hiện có trong hệ thống.
- [ ] Tổng dung lượng schema các tools của server không vượt quá 1000 tokens.
- [ ] Mọi API key/credentials được quản lý qua biến môi trường, không hardcode.
- [ ] Chỉ những tools an toàn (read-only) mới được đưa vào danh sách `autoApprove`.
- [ ] Tệp `.mcp.json` là JSON hợp lệ: `node -e "JSON.parse(fs.readFileSync('.mcp.json'))"`.
- [ ] Lệnh kiểm tra kiến trúc cơ học `./cli/agentc verify` trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Đề xuất tích hợp MCP Server từ Developer, tài liệu từ Lobehub / Smithery / GitHub.
- **Đầu ra (Downstream Seam):** Cấu hình `.mcp.json` chuẩn hóa và tài liệu `docs/mcp/<server>.md` sẵn sàng cho Worker Subagents tại Gate tương ứng.
