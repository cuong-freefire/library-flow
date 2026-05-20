import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { PaginationControls, usePagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { UserStatusBadge } from '../../components/UserStatusBadge';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { borrowingService } from '../../services/borrowingService';
import { userService } from '../../services/userService';
import { formatDate, isOverdue } from '../../utils/date';
import { bookName, userName } from '../../utils/library';

const statusFilters = ['all', 'pending', 'borrowing', 'overdue', 'returned', 'rejected'];
const dateFieldLabels = {
  borrowDate: 'Ngày mượn',
  dueDate: 'Hạn trả',
  returnDate: 'Ngày trả',
};

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
  const [dateField, setDateField] = useState('borrowDate');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
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
        const selectedDate = item[dateField];
        if (!dateFrom && !dateTo) return true;
        if (!selectedDate) return false;
        if (dateFrom && selectedDate < dateFrom) return false;
        if (dateTo && selectedDate > dateTo) return false;
        return true;
      })
      .filter((item) => {
        const haystack = `${bookName(books, item.bookId)} ${userName(users, item.userId)}`.toLowerCase();
        return !keyword || haystack.includes(keyword);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [borrowings, books, users, query, status, dateField, dateFrom, dateTo]);

  const getBook = (bookId) => books.find((book) => String(book.id) === String(bookId));
  const getUser = (userId) => users.find((user) => String(user.id) === String(userId));

  const borrowingPagination = usePagination(filteredBorrowings, {
    pageSize: 8,
    resetKey: `${query}|${status}|${dateField}|${dateFrom}|${dateTo}`,
  });

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
          <div className="col-lg-4">
            <label className="form-label fw-semibold">Tìm kiếm</label>
            <input className="form-control" placeholder="Tìm theo reader hoặc sách" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="col-md-6 col-lg-2">
            <label className="form-label fw-semibold">Trạng thái phiếu</label>
            <select className="form-select" value={status} onChange={(event) => changeStatus(event.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="borrowing">Đang mượn</option>
              <option value="overdue">Quá hạn</option>
              <option value="returned">Đã trả</option>
              <option value="rejected">Bị từ chối</option>
            </select>
          </div>
          <div className="col-md-6 col-lg-2">
            <label className="form-label fw-semibold">Lọc theo ngày</label>
            <select className="form-select" value={dateField} onChange={(event) => setDateField(event.target.value)}>
              {Object.entries(dateFieldLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="col-md-6 col-lg-2">
            <label className="form-label fw-semibold">Từ ngày</label>
            <input className="form-control" type="date" aria-label="Từ ngày" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </div>
          <div className="col-md-6 col-lg-2">
            <label className="form-label fw-semibold">Đến ngày</label>
            <input className="form-control" type="date" aria-label="Đến ngày" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>
          {(dateFrom || dateTo) && (
            <div className="col-12">
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                Xóa lọc thời gian
              </button>
            </div>
          )}
        </div>
      </div>
      {filteredBorrowings.length === 0 ? <EmptyState title="Không có phiếu mượn" description="Phiếu phù hợp bộ lọc sẽ xuất hiện tại đây." /> : (
        <div className="surface">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Reader</th><th>Trạng thái Reader</th><th>Sách</th><th>Trạng thái</th><th>Ngày mượn</th><th>Hạn trả</th><th>Ngày trả</th><th className="text-end">Thao tác</th></tr></thead>
              <tbody>
                {borrowingPagination.pageItems.map((item) => {
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
                        <div className="btn-group btn-group-sm borrowing-action-group">
                          <button className="btn btn-success" disabled={item.status !== 'pending'} onClick={() => runAction(() => borrowingService.approve(item, book), 'Đã duyệt phiếu và trừ số lượng sách.')} type="button">Duyệt</button>
                          <button className="btn btn-danger" disabled={item.status !== 'pending'} onClick={() => runAction(() => borrowingService.reject(item.id), 'Đã từ chối phiếu.')} type="button">Từ chối</button>
                          <button className="btn btn-primary" disabled={item.status !== 'borrowing'} onClick={() => runAction(() => borrowingService.returnBook(item, book), 'Đã xác nhận trả sách.')} type="button">Đã trả</button>
                          <button className="btn btn-warning" disabled={item.status !== 'borrowing'} onClick={() => runAction(() => borrowingService.returnBook(item, book, { returnCondition: 'damaged' }), 'Đã ghi nhận sách trả bị hỏng.')} type="button">Hỏng</button>
                          <button className="btn btn-dark" disabled={item.status !== 'borrowing'} onClick={() => runAction(() => borrowingService.returnBook(item, book, { returnCondition: 'lost' }), 'Đã ghi nhận sách bị mất.')} type="button">Mất</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <PaginationControls {...borrowingPagination} />
        </div>
      )}
    </>
  );
}
