---
name: playwright-e2e-testing
description: >-
  Kỹ năng Kiểm thử Trình duyệt Đầu cuối (End-to-End Browser Testing SOP) sử dụng Playwright.
  Giả lập hành vi người dùng thực tế (nhấp chuột, gõ phím, điều hướng, nộp form), kiểm tra khả năng
  tiếp cận bàn phím (Keyboard Navigation, focus-visible ring, tab order theo chuẩn WCAG AA),
  kiểm tra hồi quy thị giác (Visual Regressions), và xác nhận độ tin cậy 100% của các luồng cốt lõi.
inputs:
  - path: "templates/cms/playwright.config.ts"
    required: true
    description: "Cấu hình Playwright của CMS Admin"
  - path: "templates/fo/playwright.config.ts"
    required: true
    description: "Cấu hình Playwright của Front Office Portal"
outputs:
  - path: "templates/**/e2e/*.spec.ts"
    description: "Các kịch bản kiểm thử E2E tự động hóa bằng Playwright"
tools:
  - view_file
  - replace_file_content
  - write_to_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `playwright-e2e-testing` hoàn thiện Lớp phòng thủ Thứ 4 (Bảo chứng Chất lượng Cuối) trong chu trình phát triển Frontend của AgentC-Kit. Thay vì chỉ tin tưởng vào các bài unit tests giả lập (như jsdom), kỹ năng này khởi chạy trình duyệt thật (Chromium / WebKit) để trực tiếp kiểm chứng trải nghiệm của người dùng thực tế.

Mục tiêu kỹ thuật cốt lõi:
1. **Mô Phỏng Người Dùng Đích Thực:** Kiểm thử toàn diện hành động gõ phím, click chuột, cuộn trang, kéo thả, và submit form với độ trễ mạng thực tế.
2. **Kiểm Thử Khả Năng Tiếp Cận Bàn Phím (Keyboard a11y):** Cưỡng chế kiểm tra người dùng chỉ dùng bàn phím (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`) có thể di chuyển tuần tự qua mọi phần tử tương tác và viền `focus-visible:ring-2` luôn hiển thị rõ nét.
3. **Phát Hiện Rò Rỉ Lỗi Console (Zero Console Errors):** Bắt và ghi nhận mọi lỗi JavaScript runtime (`console.error`, unhandled promise rejections) xảy ra trong quá trình người dùng thao tác.
4. **Kiểm Tra Trạng Thái Tải & Skeleton:** Xác thực khung xương (Skeleton/Shimmer) xuất hiện đúng vị trí và chuyển mượt sang dữ liệu thực tế mà không gây giật bố cục (CLS = 0).

---

# Section 2: Decision Matrix

| Kịch Bản Kiểm Thử | Dấu Hiệu Thiếu Sót (Flaky Test) | Chuẩn Mực Playwright SOP | Hành Động Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Định Vị Phần Tử (Locators)** | Dùng CSS selector cứng dễ gãy (`div > div.button-style:nth-child(2)`). | **User-Facing Locators:** Bắt buộc dùng `page.getByRole()`, `page.getByLabel()`, `page.getByText()`. | Viết locator bám sát ngữ nghĩa người dùng và accessibility tree. |
| **Chờ Đợi Bất Đồng Bộ** | Dùng lệnh chờ cứng `page.waitForTimeout(3000)` gây chạy chậm và không ổn định. | **Auto-Waiting Assertions:** Sử dụng `await expect(locator).toBeVisible()` hoặc `page.waitForResponse()`. | Loại bỏ toàn bộ `sleep` tĩnh; dùng auto-waiting assertion của Playwright. |
| **Kiểm Thử Bàn Phím** | Chỉ kiểm tra click chuột `button.click()`, bỏ qua hoàn toàn người dùng khuyết tật dùng bàn phím. | Giả lập phím `Tab` tuần tự và assert lớp `focus-visible` hoặc trạng thái `toBeFocused()`. | Viết test case di chuyển bàn phím xuyên suốt form nhập liệu. |
| **Dọn Dẹp Phiên (Isolation)** | Các bài test phụ thuộc vào cookie/session của bài test trước đó, gây lỗi lan truyền. | Mỗi kịch bản chạy trong một `browserContext` độc lập với deterministic storage state. | Tạo tài khoản seed hoặc dọn dẹp cookies/storage trước mỗi kịch bản. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Bước 1: Viết Kịch Bản Đăng Nhập & Luồng Chính Với User-Facing Locators**
   ```typescript
   import { test, expect } from '@playwright/test';

   test.describe('Auth Flow', () => {
     test('user can log in using valid credentials', async ({ page }) => {
       await page.goto('/login');

       await page.getByLabel('Email').fill('user@example.com');
       await page.getByLabel('Password').fill('SecurePassword123!');
       await page.getByRole('button', { name: 'Đăng nhập' }).click();

       await expect(page).toHaveURL('/dashboard');
       await expect(page.getByRole('heading', { name: 'Tổng quan' })).toBeVisible();
     });
   });
   ```

2. **Bước 2: Kiểm Thử Khả Năng Điều Hướng Bằng Bàn Phím (Keyboard Navigation)**
   ```typescript
   test('supports full keyboard navigation and visible focus ring', async ({ page }) => {
     await page.goto('/login');

     // Nhấn Tab để di chuyển vào ô Email
     await page.keyboard.press('Tab');
     await expect(page.getByLabel('Email')).toBeFocused();

     // Nhấn Tab tiếp sang ô Password
     await page.keyboard.press('Tab');
     await expect(page.getByLabel('Password')).toBeFocused();

     // Nhấn Tab tiếp sang nút Submit
     await page.keyboard.press('Tab');
     const submitBtn = page.getByRole('button', { name: 'Đăng nhập' });
     await expect(submitBtn).toBeFocused();

     // Kích hoạt bằng phím Enter
     await page.keyboard.press('Enter');
   });
   ```

3. **Bước 3: Thực Thi Kiểm Thử Trên Môi Trường CI**
   ```bash
   # Chạy test E2E không mở giao diện (headless)
   npx playwright test
   ```

---

# Section 4: Mechanical Verification Checklist

- [ ] Toàn bộ locators đều dựa trên role, label, hoặc placeholder (`getByRole`, `getByLabel`).
- [ ] Không có tệp test nào chứa `page.waitForTimeout(...)`.
- [ ] Có ít nhất 1 test case xác nhận khả năng điều hướng bàn phím hoàn toàn (`page.keyboard.press('Tab')`).
- [ ] Lệnh kiểm thử E2E chạy thành công với Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Upstream:** Tiếp nhận Wire-Up từ Gate 2 sau khi các unit tests đã xanh.
- **Downstream:** Xác nhận chất lượng Gate 4 trước khi phát hành (Ship).
