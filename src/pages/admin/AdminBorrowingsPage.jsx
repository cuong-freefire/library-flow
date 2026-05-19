import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { UserStatusBadge } from '../../components/UserStatusBadge';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { borrowingService } from '../../services/borrowingService';
import { userService } from '../../services/userService';
import { formatDate, isOverdue } from '../../utils/date';
import { bookName, userName } from '../../utils/library';

const statusFilters = ['all', 'pending', 'borrowing', 'overdue', 'returned', 'rejected'];

export function AdminBorrowingsPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState(() => {
    const paramStatus = searchParams.get('status');
    return statusFilters.includes(paramStatus) ? paramStatus : 'all';
  });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [borrowingData, bookData, userData] = await Promise.all([borrowingService.getAll(), bookService.getAll(), userService.getAll()]);
      setBorrowings(borrowingData);
      setBooks(bookData);
      setUsers(userData);
    } catch (err) {
      setError('Không thể tải phiếu mượn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const paramStatus = searchParams.get('status');
    setStatus(statusFilters.includes(paramStatus) ? paramStatus : 'all');
  }, [searchParams]);

  const changeStatus = (nextStatus) => {
    setStatus(nextStatus);
    if (nextStatus === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ status: nextStatus });
    }
  };

  const filteredBorrowings = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return borrowings
      .filter((item) => status === 'all' || (status === 'overdue' ? isOverdue(item) : item.status === status))
      .filter((item) => {
        const haystack = `${bookName(books, item.bookId)} ${userName(users, item.userId)}`.toLowerCase();
        return !keyword || haystack.includes(keyword);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [borrowings, books, users, query, status]);

  const getBook = (bookId) => books.find((book) => String(book.id) === String(bookId));
  const getUser = (userId) => users.find((user) => String(user.id) === String(userId));

  const runAction = async (action, successMessage) => {
    setError('');
    try {
      await action();
      showToast(successMessage, 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Thao tác thất bại.', 'danger');
    }
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Quản lý phiếu mượn" description="Duyệt, từ chối phiếu chờ duyệt và xác nhận trả sách." />
      {error && <ErrorState message={error} />}
      <div className="surface p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-8"><input className="form-control" placeholder="Tìm theo reader hoặc sách" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
          <div className="col-md-4">
            <select className="form-select" value={status} onChange={(event) => changeStatus(event.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="borrowing">Đang mượn</option>
              <option value="overdue">Quá hạn</option>
              <option value="returned">Đã trả</option>
              <option value="rejected">Bị từ chối</option>
            </select>
          </div>
        </div>
      </div>
      {filteredBorrowings.length === 0 ? <EmptyState title="Không có phiếu mượn" description="Phiếu phù hợp bộ lọc sẽ xuất hiện tại đây." /> : (
        <div className="surface table-responsive">
          <table className="table mb-0">
            <thead><tr><th>Reader</th><th>Trạng thái Reader</th><th>Sách</th><th>Trạng thái</th><th>Ngày mượn</th><th>Hạn trả</th><th>Ngày trả</th><th className="text-end">Thao tác</th></tr></thead>
            <tbody>
              {filteredBorrowings.map((item) => {
                const book = getBook(item.bookId);
                const reader = getUser(item.userId);
                return (
                  <tr key={item.id}>
                    <td>{userName(users, item.userId)}</td>
                    <td><UserStatusBadge status={reader?.status} /></td>
                    <td>{bookName(books, item.bookId)}</td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <StatusBadge status={item.status} />
                        {isOverdue(item) && <span className="badge text-bg-danger">Quá hạn</span>}
                      </div>
                    </td>
                    <td>{formatDate(item.borrowDate)}</td>
                    <td>{formatDate(item.dueDate)}</td>
                    <td>{formatDate(item.returnDate)}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-success" disabled={item.status !== 'pending'} onClick={() => runAction(() => borrowingService.approve(item, book), 'Đã duyệt phiếu và trừ số lượng sách.')} type="button">Duyệt</button>
                        <button className="btn btn-outline-danger" disabled={item.status !== 'pending'} onClick={() => runAction(() => borrowingService.reject(item.id), 'Đã từ chối phiếu.')} type="button">Từ chối</button>
                        <button className="btn btn-outline-primary" disabled={item.status !== 'borrowing'} onClick={() => runAction(() => borrowingService.returnBook(item, book), 'Đã xác nhận trả sách.')} type="button">Trả</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
