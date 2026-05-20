import { useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { PaginationControls, usePagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuthContext } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';
import { borrowingService } from '../../services/borrowingService';
import { formatDate, isOverdue } from '../../utils/date';
import { bookName } from '../../utils/library';

const statusFilters = ['all', 'pending', 'borrowing', 'overdue', 'returned', 'rejected'];
const dateFieldLabels = {
  borrowDate: 'Ngày mượn',
  dueDate: 'Hạn trả',
  returnDate: 'Ngày trả',
};

export function MyBorrowingsPage() {
  const { user } = useAuthContext();
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [dateField, setDateField] = useState('borrowDate');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [borrowingData, bookData] = await Promise.all([borrowingService.getAll(), bookService.getAll()]);
      setBorrowings(borrowingData);
      setBooks(bookData);
    } catch (err) {
      setError('Không thể tải lịch sử mượn trả.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const myBorrowings = useMemo(
    () => borrowings.filter((item) => String(item.userId) === String(user.id)).sort((a, b) => Number(b.id) - Number(a.id)),
    [borrowings, user.id]
  );

  const filteredBorrowings = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return myBorrowings
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
        const title = bookName(books, item.bookId).toLowerCase();
        return !keyword || title.includes(keyword);
      });
  }, [myBorrowings, books, query, status, dateField, dateFrom, dateTo]);

  const borrowingPagination = usePagination(filteredBorrowings, {
    pageSize: 8,
    resetKey: `${query}|${status}|${dateField}|${dateFrom}|${dateTo}`,
  });

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader eyebrow="Reader" title="Phiếu mượn của tôi" description="Theo dõi phiếu chờ duyệt, sách đang mượn và lịch sử đã trả." />
      {error && <ErrorState message={error} />}
      {myBorrowings.length > 0 && (
        <div className="surface p-3 mb-4">
          <div className="row g-3">
            <div className="col-lg-4">
              <label className="form-label fw-semibold">Tìm kiếm</label>
              <input className="form-control" placeholder="Tìm theo tên sách" value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Trạng thái phiếu</label>
              <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusFilters.map((value) => (
                  <option key={value} value={value}>
                    {value === 'all' && 'Tất cả trạng thái'}
                    {value === 'pending' && 'Chờ duyệt'}
                    {value === 'borrowing' && 'Đang mượn'}
                    {value === 'overdue' && 'Quá hạn'}
                    {value === 'returned' && 'Đã trả'}
                    {value === 'rejected' && 'Bị từ chối'}
                  </option>
                ))}
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
            {(query || status !== 'all' || dateFrom || dateTo) && (
              <div className="col-12">
                <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => { setQuery(''); setStatus('all'); setDateFrom(''); setDateTo(''); }}>
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {myBorrowings.length === 0 ? (
        <EmptyState title="Chưa có phiếu mượn" description="Tạo phiếu từ trang danh mục sách khi tìm được sách cần mượn." />
      ) : filteredBorrowings.length === 0 ? (
        <EmptyState title="Không có phiếu phù hợp" description="Đổi bộ lọc để xem các phiếu mượn khác." />
      ) : (
        <div className="surface">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Sách</th>
                  <th>Trạng thái</th>
                  <th>Ngày mượn</th>
                  <th>Hạn trả</th>
                  <th>Ngày trả</th>
                </tr>
              </thead>
              <tbody>
                {borrowingPagination.pageItems.map((item) => (
                  <tr key={item.id}>
                    <td className="fw-semibold">{bookName(books, item.bookId)}</td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <StatusBadge status={item.status} />
                        {isOverdue(item) && <span className="badge text-bg-danger">Quá hạn</span>}
                      </div>
                    </td>
                    <td>{formatDate(item.borrowDate)}</td>
                    <td>{formatDate(item.dueDate)}</td>
                    <td>{formatDate(item.returnDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls {...borrowingPagination} />
        </div>
      )}
    </>
  );
}
