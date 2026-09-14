---
name: frontend-unified-architecture
description: >-
  Kỹ năng Kiến trúc Frontend Next.js Hợp nhất, Quản lý Vòng đời Dữ liệu & Chuẩn Tối ưu Hiệu năng Vercel
  (Unified FE 7-Zone, TanStack Query & Vercel React Best Practices). Kích hoạt tại Gate 2 (Wire-Up) khi phát triển
  ứng dụng Next.js App Router (CMS, FO). Bắt buộc tuân thủ 7 phân khu, triệt tiêu waterfalls (Promise.all),
  tối ưu bundle (next/dynamic, anti-barrel Invariant 33), triệt tiêu loading thủ công (Invariant 40) và chống trang ma (Invariant 32).
inputs:
  - path: "src/contracts/<feature>.contract.ts"
    required: true
    description: "Hợp đồng DTOs và Enums từ Gate 1"
outputs:
  - path: "src/logic/<feature>/use<Feature>Logic.ts"
    description: "Hook nhạc trưởng điều phối TanStack Query, URL state, và pagination"
  - path: "src/features/<feature>/components/<Feature>Table.tsx"
    description: "Component giao diện thuần túy nhận props declarative"
  - path: "src/app/[locale]/(protected)/<feature>/page.tsx"
    description: "Trang Next.js App Router kết nối hook với presentation view"
tools:
  - view_file
  - write_to_file
  - replace_file_content
  - run_command
---

# Section 1: Overview & Objective

Kỹ năng `frontend-unified-architecture` thiết lập trật tự cấu trúc chuẩn mực và cưỡng chế các quy chuẩn hiệu năng cao cấp (Vercel React Best Practices) cùng nghệ thuật kiến trúc component (Vercel Composition Patterns) cho toàn bộ hệ thống giao diện Next.js App Router. Mục tiêu là loại bỏ tình trạng mã nguồn tự do, chặn đứng các chuỗi chờ bất đồng bộ (Waterfalls), ngăn ngừa lạm phát cờ boolean (Boolean Prop Proliferation), tối ưu hóa bundle size, và xóa bỏ thói quen quản lý loading thủ công bằng `useState(false)`. Kỹ năng này cưỡng chế mô hình 7 Phân khu Thống nhất (Unified 7-Zone Layout), kết hợp với các rào chắn hiệu năng và mẫu thiết kế Compound Components từ Vercel Engineering.

---

# Section 2: Decision Matrix

| Tình Huống Triển Khai | Quy Chuẩn Bắt Buộc | Điều Cấm (Anti-Pattern) | Cấu Trúc Khuyến Nghị |
| :--- | :--- | :--- | :--- |
| **Quản lý trạng thái gọi API** | Dùng TanStack Query (`useQuery`, `useMutation`) với cờ tự động `isPending`, `error`. | Tự khai báo `const [loading, setLoading] = useState(false)` và `finally { setLoading(false) }` (Invariant 40). | Hook tại `src/logic/<feature>/`. |
| **Data Fetching Bất Đồng Bộ** | Gom các promise độc lập vào `Promise.all()`; hoãn `await` xuống nhánh rẽ thực sự cần dùng (`async-defer-await`). | `await` tuần tự nối tiếp nhau gây ra hiệu ứng thác nước (Async Waterfalls - 2x-10x latency). | `const [a, b] = await Promise.all([fetchA(), fetchB()])`. |
| **Thiết Kế Component Phức Tạp (API Design)** | Áp dụng Compound Components có Shared Context; ưu tiên `children` hơn là `renderX` props. | Nhồi nhét `renderHeader`, `renderActions` hoặc prop-drilling hàng chục props đóng kín component. | `<Card.Root><Card.Header /><Card.Body /></Card.Root>`. |
| **Phân Rẽ Biến Thể Giao Diện** | Tạo các Explicit Variants (`ThreadComposer`, `EditComposer`) hoặc ghép nối qua composition. | Thêm hàng loạt cờ boolean (`isThread`, `isEditing`, `isCompact`, `showHeader`) làm nhân đôi $2^n$ nhánh logic. | Tách component tường minh theo use-case. |
| **Import Module & Thư viện Icon/UI** | Import trực tiếp từ source file hoặc cấu hình `optimizePackageImports` (Invariant 33). | Import qua barrel file chứa hàng ngàn re-exports (như `import { X } from 'lucide-react'`) gây chậm build & cold start. | Import path chính xác hoặc dùng subpath export. |
| **Tải Component Nặng (Editor, Chart, Modal)** | Sử dụng `next/dynamic` kết hợp Suspense fallback/skeleton để code-splitting. | Import tĩnh trực tiếp các module nặng (>30KB như Lexical, Recharts) làm phình to Initial Bundle. | `const LexicalEditor = dynamic(() => import('...'), { loading: () => <Skeleton /> })`. |
| **Data Fetching trong Component** | Component chỉ nhận props declarative (`isPending`, `onFinish`, `data`) từ hook. | Gọi trực tiếp `fetch()` hoặc `clientFetcher` inline bên trong UI component (Invariant 32). | View phân tách tại `src/features/<feature>/`. |
| **Tối ưu Server-Side Fetching** | Dùng `React.cache()` để deduplicate các hàm fetch dùng chung trong cùng một render pass. | Gọi lại cùng một endpoint nhiều lần ở các Server Component con mà không cache. | Helper hàm bọc `React.cache()` tại service layer. |
| **Đặt tên tệp Component** | Sử dụng tên tệp `PascalCase.tsx` cho mọi UI component (Invariant 35). | Đặt tên file dạng `kebab-case.tsx` hoặc `camelCase.tsx` cho các file render JSX. | `AppButton.tsx`, `PlayerTable.tsx`. |
| **Định nghĩa Query Keys** | Khai báo query key tập trung thông qua Query Key Factory tại `src/shared/query-keys/`. | Hardcode mảng chuỗi tùy tiện `queryKey: ['players', id]` rải rác trong mã nguồn. | Factory hàm trả về mảng tuple an toàn kiểu. |

---

# Section 3: Step-by-Step Execution Protocol

1. **Khởi Tạo Cấu Trúc 7 Phân Khu Chuẩn:**
   - Bảo đảm cây thư mục `src/` có đủ: `app/[locale]/`, `core/`, `logic/`, `features/`, `layouts/`, `manifests/`, `shared/`.

2. **Xây Dựng Khóa Truy Vấn (Query Key Factory):**
   - Khai báo tại `src/shared/query-keys/<feature>.keys.ts` trả về mảng tuple an toàn kiểu (`as const`).

3. **Xây Dựng Hook Nhạc Trưởng (Logic Orchestrator Hook):**
   - Tạo `src/logic/<feature>/use<Feature>Logic.ts`.
   - Quản lý phân trang server-side, bộ lọc tìm kiếm có debounce (`useDebounce`), và các mutation.
   - Trả về đối tượng trạng thái declarative: `{ data, total, isPending, handleFilterChange, handleCreate }`.

4. **Triệt Tiêu Async Waterfalls (Vercel Anti-Waterfall Guardrail):**
   - Trong các hàm xử lý dữ liệu hoặc Server Components:
     ```typescript
     // Đúng: Chạy đồng thời các tác vụ độc lập
     const [userProfile, permissions, masterData] = await Promise.all([
       getUserProfile(userId),
       getPermissions(userId),
       getMasterData(),
     ]);
     ```

5. **Thiết Kế Component Theo Mẫu Compound Components (Vercel Composition Patterns):**
   - Với các component phức tạp (Card, Modal, FilterBar, FormSection), tạo Shared Context và các subcomponents:
     ```typescript
     // Định nghĩa compound component dùng chung
     export const AppModal = {
       Root: AppModalRoot,
       Header: AppModalHeader,
       Body: AppModalBody,
       Footer: AppModalFooter,
     };
     // Người dùng tự do compose: <AppModal.Root><AppModal.Header /><AppModal.Body /></AppModal.Root>
     ```
   - Tránh boolean prop proliferation: Không thêm các cờ như `isEditMode`, `showActions`. Thay vào đó, cho phép truyền `children` linh hoạt hoặc tách biến thể riêng biệt (`CreatePlayerModal`, `EditPlayerModal`).

6. **Tối Ưu Bundle Với `next/dynamic` & Anti-Barrel (INV-33):**
   - Với các component giao diện nặng (Rich Text Lexical Editor, Modal phức tạp, Chart):
     ```typescript
     import dynamic from 'next/dynamic';
     const RichTextEditor = dynamic(() => import('@/components/ui/editor/RichTextEditor'), {
       loading: () => <Skeleton active className="h-64" />,
       ssr: false,
     });
     ```
   - Tuyệt đối không tạo barrel file `index.ts` re-export nội bộ trong features (Invariant 33).

7. **Hiện Thực Hóa Component Hiển Thị (Atomic Presentation View):**
   - Tạo component thuần túy tại `src/features/<feature>/components/<Feature>Table.tsx` (tên PascalCase).
   - Truyền trực tiếp `loading={isPending}` vào Table hoặc Button, không có logic gọi API nội tại.

8. **Nối Dây Next.js App Router Page & Navigation:**
   - Tạo route page: `src/app/[locale]/(protected)/<feature>/page.tsx`.
   - Đăng ký URL vào `src/manifests/navigation.manifest.ts` hoặc cấu hình SidebarMenu.

---

# Section 4: Mechanical Verification Checklist

- [ ] Cây thư mục tuân thủ 7 phân khu: `node scripts/check-clean-arch.sh` trả về Exit Code `0`.
- [ ] 100% components có tên `PascalCase.tsx`: Không có file `*-table.tsx` trong `src/features/` hoặc `src/shared/ui/`.
- [ ] Không có async waterfalls: Các tác vụ fetch độc lập được kết hợp qua `Promise.all()`.
- [ ] Tuân thủ Composition Patterns: Không có component nào chứa >3 cờ boolean để rẽ nhánh layout; ưu tiên Compound Components & `children`.
- [ ] Component nặng (>30KB như Rich Editor, Chart) được bọc qua `next/dynamic`.
- [ ] Tuân thủ Invariant 33: Không vi phạm barrel exports/imports (`bash scripts/check-no-barrels.sh`).
- [ ] Zero cờ loading thủ công: Quét `useState(false)` kèm `setLoading` trong component view không phát hiện vi phạm (Invariant 40).
- [ ] Không có component hoặc route mồ côi: `bash scripts/check-wireup-integrity.sh` trả về Exit Code `0`.
- [ ] Next.js build thành công: `npm run build` hoặc `next build` trả về Exit Code `0`.

---

# Section 5: Artifacts & Seams

- **Đầu vào (Upstream Seam):** `src/contracts/<feature>.contract.ts` và `tokens.css`.
- **Đầu ra (Downstream Seam):** Giao diện người dùng Next.js App Router hiệu năng cao, không waterfall, cấu trúc ghép nối linh hoạt chuẩn Vercel, sẵn sàng cho `wireup-e2e-verification`.
