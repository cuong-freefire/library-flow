import { useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { PaginationControls, usePagination } from '../../components/Pagination';
import { userService } from '../../services/userService';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      setUsers(await userService.getAll());
    } catch (err) {
      setError('Không thể tải danh sách reader.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const readers = useMemo(() => {
    const keyword = query.toLowerCase().trim();
    return users
      .filter((user) => user.role === 'reader')
      .filter((user) => status === 'all' || user.status === status)
      .filter((user) => !keyword || `${user.name} ${user.email}`.toLowerCase().includes(keyword));
  }, [users, query, status]);

  const toggleStatus = async (user) => {
    await userService.update(user.id, { status: user.status === 'active' ? 'locked' : 'active' });
    await loadData();
  };

  const readerPagination = usePagination(readers, {
    pageSize: 8,
    resetKey: `${query}|${status}`,
  });

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Quản lý Reader" description="Tìm kiếm, lọc và khóa/mở tài khoản người đọc." />
      {error && <ErrorState message={error} />}
      <div className="surface p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-8"><input className="form-control" placeholder="Tìm theo tên hoặc email" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
          <div className="col-md-4">
            <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Active</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </div>
      </div>
      {readers.length === 0 ? <EmptyState title="Không có reader" description="Không tìm thấy tài khoản phù hợp." /> : (
        <div className="surface">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Trạng thái</th><th className="text-end">Thao tác</th></tr></thead>
              <tbody>
                {readerPagination.pageItems.map((reader) => (
                  <tr key={reader.id}>
                    <td className="fw-semibold">{reader.name}</td>
                    <td>{reader.email}</td>
                    <td>{reader.phone || '-'}</td>
                    <td><span className={`badge ${reader.status === 'active' ? 'text-bg-success' : 'text-bg-danger'}`}>{reader.status}</span></td>
                    <td className="text-end">
                      <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => toggleStatus(reader)}>
                        {reader.status === 'active' ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls {...readerPagination} />
        </div>
      )}
    </>
  );
}
