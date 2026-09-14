---
name: devops-lifecycle-and-reaper
description: >-
  Kỹ năng Quản trị Vòng đời Hạ tầng, Tiền kiểm & Tiêu diệt Tiến trình Zombie (DevOps Lifecycle & Port Reaper).
  Kích hoạt tại Gate -1 (Pre-flight Sanity Check) và Gate 4 (Pack & Ship) trước khi xuất xưởng.
  Cưỡng chế Invariant 1: tiền kiểm môi trường (RAM >= 2GB, Docker, DB daemons, cổng mạng)
  và Invariant 2: quét sạch tiến trình ngầm zombie, giải phóng cổng mạng treo (EADDRINUSE) bằng kill -9.
inputs:
  - path: "system:environment"
    required: true
    description: "Môi trường OS, cổng mạng, Docker daemons, và tài nguyên phần cứng"
outputs:
  - path: "scripts/port-reaper.sh"
    description: "Script tự động tiêu diệt tiến trình zombie và giải phóng cổng mạng"
  - path: "Dockerfile"
    description: "Cấu hình Dockerfile multi-stage tối ưu dung lượng và bảo mật container"
tools:
  - run_command
  - view_file
  - write_to_file
---

# Section 1: Overview & Objective

Kỹ năng `devops-lifecycle-and-reaper` đảm nhiệm việc bảo vệ sức khỏe môi trường thực thi và đóng gói xuất xưởng. Ở đầu vào (Gate -1), kỹ năng này phát hiện sớm các thiếu hụt môi trường (RAM < 2GB, Node.js version sai, cổng mạng bị chiếm dụng) để "thất bại sớm" (Fail Fast) nhằm tiết kiệm token. Ở đầu ra (Gate 4), kỹ năng kích hoạt cơ chế Port Reaper (Invariant 2) để dọn dẹp triệt để các tiến trình node zombie, giải phóng tài nguyên hệ thống và bảo đảm gói container xuất xưởng sẵn sàng 100%.

---

# Section 2: Decision Matrix

| Giai Đoạn / Tình Huống | Hành Động Kỹ Thuật Bắt Buộc | Điều Cấm (Anti-Pattern) | Kết Quả Đạt Được |
| :--- | :--- | :--- | :--- |
| **Bắt đầu phiên làm việc (Gate -1)** | Chạy tiền kiểm: Kiểm tra Node, RAM $>2$GB, Docker daemon, các port 3000/4000/5432. | Bắt đầu sinh code khi môi trường chưa sẵn sàng hoặc cổng mạng đang bị kẹt. | Môi trường sạch sẽ (Gate -1 PASS). |
| **Gặp lỗi `EADDRINUSE` (Cổng bận)** | Kích hoạt Port Reaper: Dùng `lsof -t -i :<port>` tìm PID và tiêu diệt dứt điểm bằng `kill -9`. | Tự ý đổi port server sang số lạ (e.g. 4001, 4002) làm gãy hợp đồng E2E test. | Cổng mạng được giải phóng nguyên trạng. |
| **Đóng Gate 4 (Pack & Ship)** | Quét sạch toàn bộ background server processes do test runner sinh ra, dọn dẹp containers rác. | Để lại các tiến trình server chạy ngầm ngốn RAM sau khi kết thúc pipeline. | Zero zombie processes. |
| **Đóng gói Docker Container** | Sử dụng Multi-stage build (Builder stage $\to$ Runner stage), chạy dưới quyền `non-root user`. | Đóng gói cả `node_modules` dev và mã nguồn TypeScript thô vào production image. | Image siêu nhẹ, bảo mật cao. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Thực Thi Tiền Kiểm Môi Trường (Gate -1 Pre-Flight Sanity Check):**
   - Kiểm tra phiên bản Node.js và Yarn/NPM.
   - Kiểm tra dung lượng RAM khả dụng ($\ge 1500$MB).
   - Quét danh sách cổng mạng dự kiến sử dụng (3000, 4000, 5432, 6379) để giải phóng nếu cần.

2. **Vận Hành Cơ Chế Port Reaper (Invariant 2):**
   - Khi có xung đột cổng mạng hoặc kết thúc kiểm thử:
     ```bash
     TARGET_PORTS=(3000 4000 5432)
     for PORT in "${TARGET_PORTS[@]}"; do
       PIDS=$(lsof -t -i :"$PORT" 2>/dev/null || true)
       if [ -n "$PIDS" ]; then
         echo "$PIDS" | xargs kill -9 2>/dev/null || true
       fi
     done
     ```

3. **Cấu Hình Multi-Stage Dockerfile Chuẩn:**
   - Tạo `Dockerfile` với 3 stages: `deps`, `builder`, và `runner`.
   - Sao chép chỉ các file build artifacts (`dist/` hoặc `.next/standalone`).
   - Khởi chạy bằng `USER node` hoặc user phi đặc quyền.

4. **Ký Khóa Gate 4 Xuất Xưởng:**
   - Chạy `bash scripts/verify-invariants.sh` đạt Exit Code `0`.
   - Dọn sạch tiến trình zombie, giải phóng toàn bộ ports, và phát tín hiệu hoàn tất.

---

# Section 4: Mechanical Verification Checklist

- [ ] Script tiền kiểm hoặc lệnh kiểm tra ports trả về Exit Code `0`.
- [ ] Không có tiến trình node zombie nào chiếm cổng sau khi tắt: `lsof -i :4000` không trả về kết quả.
- [ ] Dockerfile tồn tại và tuân thủ multi-stage build: `grep -q "FROM " Dockerfile && grep -q "USER " Dockerfile` (nếu có container).
- [ ] 100% mechanical invariant checks vượt qua trước khi emit GOAL_COMPLETE.
- [ ] Exit Code kiểm tra: Trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** Kết quả pass Gate 3 Security Audit.
- **Đầu ra (Downstream Seam):** Môi trường sạch sẽ, không còn zombie processes, sẵn sàng cho `<!-- GOAL_COMPLETE -->`.
