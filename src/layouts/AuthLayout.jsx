import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="auth-bg d-flex align-items-center justify-content-center px-3 py-4">
      <Outlet />
    </main>
  );
}
