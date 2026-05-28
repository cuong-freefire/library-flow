# Library Flow

Library Flow là ứng dụng React quản lý mượn trả sách với hai vai trò chính:

- Reader: tra cứu sách, tạo phiếu mượn, xem lịch sử mượn trả.
- Admin: quản lý sách, thể loại, reader và xử lý phiếu mượn trả.

Backend trong môi trường học tập được mô phỏng bằng `json-server`; dữ liệu nằm trong `db.json`.

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

Mật khẩu trong `db.json` được lưu dạng plain text để phù hợp scope demo dùng `json-server`.

## Scripts

```bash
npm start
```

Chạy frontend React.

```bash
npm run api
```

Chạy API mock bằng `json-server`.

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
  api/                 Cấu hình axios
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

## Ghi Chú Scope

- Auth là fake auth ở frontend: login đọc `/users`, register ghi `/users`.
- Role guard chỉ bảo vệ route giao diện, không phải phân quyền backend production.
- Số sách có thể mượn không lưu trong `db.json`; frontend tính từ `totalCopies`, phiếu `borrowing`, `damagedCopies` và `lostCopies`.
- Sách bị ẩn sẽ không hiển thị trong danh mục Reader.
