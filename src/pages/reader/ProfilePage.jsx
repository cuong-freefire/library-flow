import { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function ProfilePage() {
  const { user, updateProfile } = useAuthContext();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      showToast('Đã cập nhật hồ sơ.', 'success');
    } catch (err) {
      showToast('Không thể cập nhật hồ sơ.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Tài khoản" title="Thông tin cá nhân" description="Cập nhật họ tên, số điện thoại và ảnh đại diện." />
      <div className="surface p-4">
        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold" htmlFor="name">Họ tên</label>
              <input id="name" className="form-control" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" htmlFor="phone">Số điện thoại</label>
              <input id="phone" className="form-control" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" htmlFor="avatar">Ảnh đại diện URL</label>
              <input id="avatar" className="form-control" value={form.avatar} onChange={(event) => setForm((current) => ({ ...current, avatar: event.target.value }))} />
            </div>
          </div>
          <div className="d-flex align-items-center gap-3 mt-4">
            <button className="btn btn-primary" disabled={loading} type="submit">{loading ? 'Đang lưu...' : 'Lưu hồ sơ'}</button>
            <span className="badge badge-soft">Role: {user.role}</span>
            <span className={`badge ${user.status === 'active' ? 'text-bg-success' : 'text-bg-danger'}`}>{user.status}</span>
          </div>
        </form>
      </div>
    </>
  );
}
