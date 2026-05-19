import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginSchema } from './authSchemas';

export function LoginPage() {
  const { login } = useAuthContext();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await login(values);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-panel shadow-sm">
      <div className="row g-0">
        <div className="col-lg-5 auth-side p-4 p-lg-5 d-flex flex-column justify-content-between">
          <div>
            <div className="d-inline-flex align-items-center gap-2 mb-4 fw-bold">
              <KeyRound size={22} /> Library Flow
            </div>
            <h1 className="h2 fw-bold mb-3">Đăng nhập hệ thống</h1>
            <p className="mb-0 opacity-75">Reader tra cứu và mượn sách. Admin quản lý sách, phiếu mượn và người đọc.</p>
          </div>
          <div className="small opacity-75 mt-4">
            Admin seed: admin@library.com / Admin123
            <br />
            Reader seed: reader@library.com / Reader123
          </div>
        </div>
        <div className="col-lg-7 p-4 p-lg-5">
          <h2 className="h4 fw-bold mb-1">Chào mừng trở lại</h2>
          <p className="text-muted-2 mb-4">Nhập email và mật khẩu để tiếp tục.</p>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="mb-3">
              <label className="form-label fw-semibold" htmlFor="email">Email</label>
              <input id="email" className={`form-control ${form.formState.errors.email ? 'is-invalid' : ''}`} {...form.register('email')} />
              <div className="invalid-feedback">{form.formState.errors.email?.message}</div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold" htmlFor="password">Mật khẩu</label>
              <input id="password" type="password" className={`form-control ${form.formState.errors.password ? 'is-invalid' : ''}`} {...form.register('password')} />
              <div className="invalid-feedback">{form.formState.errors.password?.message}</div>
            </div>
            <button className="btn btn-primary w-100" disabled={loading} type="submit">
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
          <p className="text-center text-muted-2 mt-4 mb-0">
            Chưa có tài khoản? <Link className="fw-semibold text-decoration-none" to="/register">Đăng ký Reader</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
