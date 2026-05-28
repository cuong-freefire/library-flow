import { ArrowRight, BookOpen, ClipboardList, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export function HomePage() {
  const { user, isAuthenticated } = useAuthContext();

  return (
    <>
      <section className="row align-items-center g-4 mb-5">
        <div className="col-lg-7">
          <div className="badge badge-soft mb-3">React + json-server</div>
          <h1 className="display-5 fw-bold mb-3">Hệ thống quản lý thư viện cho Reader và Admin</h1>
          <p className="lead text-muted-2 mb-4">
            Tra cứu sách, tạo phiếu mượn online, duyệt mượn trả và theo dõi tình trạng quá hạn trong một giao diện rõ ràng.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <Link className="btn btn-primary d-inline-flex align-items-center gap-2" to="/books">
              Xem danh mục sách <ArrowRight size={18} />
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link className="btn btn-outline-secondary" to="/admin">Vào dashboard</Link>
            )}
          </div>
        </div>
        <div className="col-lg-5">
          <img
            className="img-fluid rounded-3 shadow-sm"
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
            alt="Không gian thư viện"
          />
        </div>
      </section>

      <section className="row g-3">
        <div className="col-md-4">
          <div className="surface p-4 h-100">
            <BookOpen className="text-success mb-3" />
            <h2 className="h5">Tra cứu sách</h2>
            <p className="text-muted-2 mb-0">Tìm theo tên, tác giả, thể loại và lọc trạng thái còn/hết sách.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="surface p-4 h-100">
            <ClipboardList className="text-warning mb-3" />
            <h2 className="h5">Luồng mượn trả</h2>
            <p className="text-muted-2 mb-0">Reader tạo pending, Admin duyệt phiếu và trả sách sẽ lưu lịch sử mượn trả.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="surface p-4 h-100">
            <ShieldCheck className="text-primary mb-3" />
            <h2 className="h5">Phân quyền</h2>
            <p className="text-muted-2 mb-0">Route guard tách Reader và Admin theo user.role từ dữ liệu json-server.</p>
          </div>
        </div>
      </section>
    </>
  );
}
