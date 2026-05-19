import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <div className="surface p-5 text-center">
      <h1 className="h3 fw-bold mb-2">Không có quyền truy cập</h1>
      <p className="text-muted-2 mb-4">Tài khoản hiện tại không được phép mở khu vực này.</p>
      <Link className="btn btn-primary" to="/books">Quay về danh mục sách</Link>
    </div>
  );
}
