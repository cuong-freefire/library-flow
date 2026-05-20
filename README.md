# Library Flow

Library Flow là ứng dụng React quản lý mượn trả sách với hai vai trò chính:

- Reader: tra cứu sách, tạo phiếu mượn, xem lịch sử mượn trả.
- Admin: quản lý sách, thể loại, reader và xử lý phiếu mượn trả.

Backend trong môi trường học tập được mô phỏng bằng `json-server-auth` và dữ liệu nằm trong `db.json`.

## Yêu Cầu

- Node.js
- npm

## Cài Đặt

```bash
npm install
```

## Chạy Dự Án

Chạy đồng thời API mock và React app:

```bash
npm run dev
```

Các service mặc định:

- Frontend: `http://localhost:3000`
- API mock: `http://localhost:5000`

Biến môi trường API nằm trong `.env`:

```env
REACT_APP_API_BASE_URL=http://localhost:5000
```

## Tài Khoản Seed

- Admin: `admin@library.com` / `Admin123`
- Reader: `reader@library.com` / `Reader123`

## Scripts

```bash
npm start
```

Chạy frontend React.

```bash
npm run api
```

Chạy API mock bằng `json-server-auth`.

```bash
npm run dev
```

Chạy frontend và API mock cùng lúc.

```bash
npm run build
```

Build production vào thư mục `build`.

## Cấu Trúc Chính

```text
src/
  api/                 Cấu hình axios và interceptor token
  components/          Component dùng lại nhiều nơi
  context/             AuthContext, ToastContext
  hooks/               Hook dùng chung
  layouts/             Layout cho app chính và auth
  pages/               Page theo domain/role
    admin/
      books/           Component và hook riêng cho quản lý sách
      borrowings/      Component và hook riêng cho quản lý phiếu mượn
    auth/
    books/
    reader/
  routes/              Route guard
  services/            Hàm gọi API theo resource
  utils/               Helper định dạng, label, rule nhỏ
```

## Luồng Chính

1. `src/App.js` định nghĩa route và layout.
2. `AuthProvider` giữ thông tin đăng nhập, token nằm trong `localStorage`.
3. `services/*` gọi API qua `src/api/axios.js`.
4. Page lấy dữ liệu qua service hoặc hook feature.
5. Component con chỉ render form, filter, table hoặc trạng thái UI.

## Ghi Chú Bảo Trì

- Giữ page ở vai trò điều phối, không nhồi toàn bộ form/filter/table vào cùng một file.
- Với màn hình phức tạp, tạo thư mục feature con trong `pages/<domain>/`.
- Logic gọi API đặt trong `services`, logic điều phối state của màn hình đặt trong custom hook.
- Label/status dùng nhiều nơi nên gom vào `utils` hoặc constants thay vì viết lặp trong JSX.
