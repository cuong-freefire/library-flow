import { useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { PaginationControls, usePagination } from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import { borrowingService } from '../../services/borrowingService';
import { userService } from '../../services/userService';

export function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [processingUserId, setProcessingUserId] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [userData, borrowingData] = await Promise.all([
        userService.getAll(),
        borrowingService.getAll(),
      ]);
      setUsers(userData);
      setBorrowings(borrowingData);
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

  const issueCountByReader = useMemo(() => {
    return borrowings.reduce((acc, item) => {
      if (item.status !== 'returned') return acc;
      if (!['damaged', 'lost'].includes(item.returnCondition)) return acc;

      const userId = String(item.userId);
      acc[userId] = acc[userId] || { damaged: 0, lost: 0 };
      acc[userId][item.returnCondition] += 1;
      return acc;
    }, {});
  }, [borrowings]);

  const toggleStatus = async (user) => {
    if (processingUserId) return;
    setProcessingUserId(user.id);
    try {
      const nextStatus = user.status === 'active' ? 'locked' : 'active';
      await userService.update(user.id, { status: nextStatus });
      showToast(nextStatus === 'locked' ? 'Đã khóa Reader.' : 'Đã mở khóa Reader.', 'success');
      await loadData();
    } catch (err) {
      showToast('Không thể cập nhật trạng thái Reader.', 'danger');
    } finally {
      setProcessingUserId(null);
    }
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
              <thead><tr><th>Họ tên</th><th>Email</th><th>SĐT</th><th>Hỏng</th><th>Mất</th><th>Trạng thái</th><th className="text-end">Thao tác</th></tr></thead>
              <tbody>
                {readerPagination.pageItems.map((reader) => {
                  const issueCount = issueCountByReader[String(reader.id)] || { damaged: 0, lost: 0 };
                  return (
                    <tr key={reader.id}>
                      <td className="fw-semibold">{reader.name}</td>
                      <td>{reader.email}</td>
                      <td>{reader.phone || '-'}</td>
                      <td>{issueCount.damaged}</td>
                      <td>{issueCount.lost}</td>
                      <td><span className={`badge ${reader.status === 'active' ? 'text-bg-success' : 'text-bg-danger'}`}>{reader.status}</span></td>
                      <td className="text-end">
                        <button className="btn btn-outline-secondary btn-sm" disabled={processingUserId === reader.id} type="button" onClick={() => toggleStatus(reader)}>
                          {processingUserId === reader.id ? 'Đang xử lý...' : reader.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationControls {...readerPagination} />
        </div>
      )}
    </>
  );
}
