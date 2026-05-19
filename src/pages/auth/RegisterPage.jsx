import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { registerSchema } from './authSchemas';

export function RegisterPage() {
  const { register } = useAuthContext();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await register(values);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-panel shadow-sm">
      <div className="row g-0">
        <div className="col-lg-5 auth-side p-4 p-lg-5">
          <div className="d-inline-flex align-items-center gap-2 mb-4 fw-bold">
            <UserPlus size={22} /> Tài khoản Reader
          </div>
          <h1 className="h2 fw-bold mb-3">Tạo tài khoản mượn sách</h1>
          <p className="mb-0 opacity-75">Tài khoản mới mặc định là Reader, trạng thái active và có thể tạo phiếu mượn khi sách còn bản khả dụng.</p>
        </div>
        <div className="col-lg-7 p-4 p-lg-5">
          <h2 className="h4 fw-bold mb-1">Đăng ký</h2>
          <p className="text-muted-2 mb-4">Điền thông tin cơ bản để bắt đầu sử dụng thư viện.</p>
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="name">Họ tên</label>
                <input id="name" className={`form-control ${form.formState.errors.name ? 'is-invalid' : ''}`} {...form.register('name')} />
                <div className="invalid-feedback">{form.formState.errors.name?.message}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="phone">Số điện thoại</label>
                <input id="phone" className="form-control" {...form.register('phone')} />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold" htmlFor="email">Email</label>
                <input id="email" className={`form-control ${form.formState.errors.email ? 'is-invalid' : ''}`} {...form.register('email')} />
                <div className="invalid-feedback">{form.formState.errors.email?.message}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="password">Mật khẩu</label>
                <input id="password" type="password" className={`form-control ${form.formState.errors.password ? 'is-invalid' : ''}`} {...form.register('password')} />
                <div className="invalid-feedback">{form.formState.errors.password?.message}</div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold" htmlFor="confirmPassword">Xác nhận</label>
                <input id="confirmPassword" type="password" className={`form-control ${form.formState.errors.confirmPassword ? 'is-invalid' : ''}`} {...form.register('confirmPassword')} />
                <div className="invalid-feedback">{form.formState.errors.confirmPassword?.message}</div>
              </div>
            </div>
            <button className="btn btn-primary w-100 mt-4" disabled={loading} type="submit">
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>
          <p className="text-center text-muted-2 mt-4 mb-0">
            Đã có tài khoản? <Link className="fw-semibold text-decoration-none" to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
