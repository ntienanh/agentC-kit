---
name: vercel-react-best-practices
description: >-
  Kỹ năng Tối ưu Hiệu năng & Thực hành Tốt nhất cho React 19 và Next.js 16 theo Chuẩn mực Vercel Core.
  Cung cấp các quy tắc triệt tiêu Waterfall requests, sử dụng Suspense Streaming, thay thế useEffect
  bằng Derived State, tối ưu bundle size thông qua Tree-Shaking & Dynamic Imports (next/dynamic),
  cưỡng chế Stable Keys (cấm dùng array index làm key), và tối ưu hóa Core Web Vitals (LCP, INP, CLS).
inputs:
  - path: "templates/cms/src/**"
    required: true
    description: "Mã nguồn giao diện CMS Admin"
  - path: "templates/fo/src/**"
    required: true
    description: "Mã nguồn giao diện Front Office Client Portal"
outputs:
  - path: "templates/**"
    description: "Mã nguồn FE tối ưu hiệu năng tải, không waterfall, không rò rỉ bộ nhớ"
tools:
  - view_file
  - replace_file_content
  - write_to_file
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `vercel-react-best-practices` thiết lập các chuẩn mực hiệu năng và thực hành lập trình hiện đại nhất theo hướng dẫn của Vercel Engineering và React Core Team. Mục tiêu là loại bỏ triệt để các bẫy hiệu năng phổ biến (Performance Pitfalls) khiến ứng dụng bị chậm, giật khung hình (dropped frames), hoặc layout bị dịch chuyển đột ngột (layout shifts).

Mục tiêu kỹ thuật cốt lõi:
1. **Triệt Tiêu Request Waterfalls:** Thay thế việc gọi các truy vấn tuần tự nối tiếp nhau bằng việc nạp dữ liệu song song (`Promise.all`), nạp trước (prefetching), hoặc phân rã thành các `Suspense` streaming boundaries độc lập.
2. **Loại Bỏ Lạm Dụng `useEffect` (Derived State):** Cấm tuyệt đối việc sử dụng `useEffect` để đồng bộ hóa hoặc sao chép state giữa các biến phụ thuộc. Mọi giá trị có thể tính toán được từ props/state hiện có bắt buộc phải được tính toán trực tiếp trong quá trình render (Derived State).
3. **Tối Ưu Bundle Size & Tree-Shaking:** Cấm import nguyên cả thư viện nặng (`import _ from 'lodash'`); bắt buộc sử dụng path-based import hoặc nạp lười (`next/dynamic`) cho các thành phần nặng (RichText, Charts).
4. **Cưỡng Chế Stable Keys:** Cấm triệt để dùng array index làm `key` khi render danh sách (`key={index}`), bắt buộc sử dụng định danh duy nhất ổn định (`key={item.id}`).
5. **Bảo Đảm Chỉ Số Core Web Vitals (CWV):**
   - **LCP (Largest Contentful Paint) < 2.5s:** Preload font và hero image quan trọng.
   - **INP (Interaction to Next Paint) < 200ms:** Giảm tải main thread, debounce input tìm kiếm (300ms).
   - **CLS (Cumulative Layout Shift) < 0.1:** Luôn định nghĩa kích thước cố định cho hình ảnh và hiển thị skeleton có tỷ lệ chính xác.

---

# Section 2: Decision Matrix

| Hạng Mục Tối Ưu | Dấu Hiệu Vi Phạm (Anti-Pattern) | Chuẩn Mực Vercel React | Hành Động Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| **Data Fetching Waterfalls** | Gọi `await getUser()` rồi mới gọi `await getOrders(user.id)` trong cùng 1 component server, khiến thời gian tải bị cộng dồn. | Chạy song song qua `Promise.all([getUser(), getOrders()])` hoặc bọc từng khối trong `<Suspense fallback={<Skeleton />}>`. | Song song hóa các truy vấn độc lập hoặc bọc component con trong Suspense để stream dần. |
| **useEffect State Sync** | Dùng `useEffect(() => { setFullName(first + ' ' + last); }, [first, last])`. | **Derived State:** Tính toán trực tiếp `const fullName = `${first} ${last}`;` ngay trong thân hàm render. | Xóa `useEffect` và state thừa; tính toán trực tiếp hoặc bọc bằng `useMemo` nếu thuật toán nặng. |
| **Heavy Bundle Imports** | `import { debounce } from 'lodash';` hoặc import toàn bộ trình soạn thảo RichText vào trang chủ. | Import theo đường dẫn sâu `import debounce from 'lodash/debounce';` hoặc nạp lười `dynamic(() => import(...), { ssr: false })`. | Áp dụng tree-shaking và `next/dynamic` cho các module không cần thiết ở lần tải đầu tiên. |
| **List Rendering Keys** | `items.map((item, index) => <div key={index}>...</div>)` gây re-mount sai lệch khi xóa/sắp xếp lại phần tử. | **Stable Unique Keys:** Bắt buộc dùng `key={item.id}` hoặc định danh bất biến của bản ghi. | Thay `key={index}` bằng khóa duy nhất ổn định của thực thể domain. |
| **Event Handler Closures** | Tạo lại các hàm xử lý sự kiện phức tạp bên trong vòng lặp render mà không ghi nhớ khi truyền xuống component lá được tối ưu `memo`. | Sử dụng `useCallback` với dependencies array chính xác hoặc truyền action ID. | Bọc handler bằng `useCallback` khi truyền xuống các thành phần danh sách lớn. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Bước 1: Loại Bỏ Waterfall Bằng Suspense Streaming**
   - Phân rã trang thành các khối dữ liệu độc lập và nạp song song:
     ```tsx
     export default async function DashboardPage() {
       return (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <Suspense fallback={<StatsCardSkeleton />}>
             <RevenueStatsServerComponent />
           </Suspense>
           <Suspense fallback={<RecentActivitySkeleton />}>
             <RecentActivityServerComponent />
           </Suspense>
         </div>
       );
     }
     ```

2. **Bước 2: Nạp Lười Thư Viện Nặng Bằng `next/dynamic`**
   - Chỉ tải mã nguồn của các công cụ phức tạp khi người dùng thực sự kích hoạt:
     ```tsx
     import dynamic from 'next/dynamic';

     const DynamicRichTextEditor = dynamic(
       () => import('@/shared/ui/editor/AppRichTextEditor').then(mod => mod.AppRichTextEditor),
       {
         loading: () => <div className="h-64 animate-pulse bg-muted rounded-md" />,
         ssr: false,
       }
     );
     ```

3. **Bước 3: Chuyển Đổi State Đồng Bộ Sang Derived State**
   - Không lưu trữ dữ liệu có thể suy diễn được:
     ```tsx
     const [items, setItems] = useState<Item[]>([]);
     const [filter, setFilter] = useState<string>('');

     const filteredItems = useMemo(() => {
       return items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase()));
     }, [items, filter]);
     ```

---

# Section 4: Mechanical Verification Checklist

- [ ] Không có `key={index}` trong toàn bộ mã nguồn component `.tsx`.
- [ ] Không có `useEffect` nào chỉ để sao chép dữ liệu từ props sang state cục bộ.
- [ ] Các thư viện lớn (> 50KB gzip như RichText, Charting) được nạp qua `next/dynamic`.
- [ ] Các truy vấn dữ liệu độc lập ở Server Components được thực thi qua `Promise.all` hoặc tách biệt qua `<Suspense>`.
- [ ] Không có `useState(loading)` thủ công (tuân thủ Invariant 40).
- [ ] `./cli/agentc verify` trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Upstream:** Tiếp nhận Wire-Up từ Gate 2 và chuẩn bị cho Gate 3 (Security & Audit).
- **Downstream:** Tương thích với `code-review` để quét tĩnh các anti-patterns trước khi ship.
