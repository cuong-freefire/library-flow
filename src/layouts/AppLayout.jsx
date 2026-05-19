import { BookOpen, LayoutDashboard, LibraryBig, LogIn, LogOut, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export function AppLayout() {
  const { user, isAuthenticated, logout } = useAuthContext();

  return (
    <div className="app-shell">
      <header className="app-header sticky-top">
        <nav className="navbar navbar-expand-lg">
          <div className="container">
            <NavLink className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/">
              <span className="brand-mark"><LibraryBig size={20} /></span>
              Library Flow
            </NavLink>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="mainNav">
              <div className="navbar-nav ms-lg-4 gap-lg-2">
                <NavLink className="nav-link d-flex align-items-center gap-1" to="/books">
                  <BookOpen size={17} /> Sách
                </NavLink>
                {isAuthenticated && user?.role === 'reader' && (
                  <NavLink className="nav-link" to="/my-borrowings">Phiếu của tôi</NavLink>
                )}
                {isAuthenticated && user?.role === 'admin' && (
                  <>
                    <NavLink className="nav-link d-flex align-items-center gap-1" to="/admin">
                      <LayoutDashboard size={17} /> Tổng quan
                    </NavLink>
                    <NavLink className="nav-link" to="/admin/borrowings">Phiếu mượn</NavLink>
                    <NavLink className="nav-link" to="/admin/books">Quản lý sách</NavLink>
                    <NavLink className="nav-link" to="/admin/categories">Thể loại</NavLink>
                    <NavLink className="nav-link" to="/admin/users">Reader</NavLink>
                  </>
                )}
              </div>
              <div className="navbar-nav ms-auto align-items-lg-center gap-2">
                {isAuthenticated ? (
                  <>
                    <NavLink className="nav-link d-flex align-items-center gap-1" to="/me">
                      <UserRound size={17} /> {user.name}
                    </NavLink>
                    <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" type="button" onClick={logout}>
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <NavLink className="btn btn-primary btn-sm d-flex align-items-center gap-1" to="/login">
                    <LogIn size={16} /> Đăng nhập
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
      <main className="page-band">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
