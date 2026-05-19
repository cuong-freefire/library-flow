import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminBorrowingsPage } from './pages/admin/AdminBorrowingsPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { BookDetailPage } from './pages/books/BookDetailPage';
import { BookListPage } from './pages/books/BookListPage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { MyBorrowingsPage } from './pages/reader/MyBorrowingsPage';
import { ProfilePage } from './pages/reader/ProfilePage';
import { RegisterPage } from './pages/auth/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="/books" element={<BookListPage />} />
              <Route path="/books/:bookId" element={<BookDetailPage />} />
              <Route path="/forbidden" element={<ForbiddenPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/me" element={<ProfilePage />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['reader']} />}>
                <Route path="/my-borrowings" element={<MyBorrowingsPage />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/books" element={<AdminBooksPage />} />
                <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/borrowings" element={<AdminBorrowingsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
