import { useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuthContext } from '../../context/AuthContext';
import { bookService } from '../../services/bookService';
import { borrowingService } from '../../services/borrowingService';
import { formatDate } from '../../utils/date';
import { bookName } from '../../utils/library';

export function MyBorrowingsPage() {
  const { user } = useAuthContext();
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
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

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader eyebrow="Reader" title="Phiếu mượn của tôi" description="Theo dõi phiếu chờ duyệt, sách đang mượn và lịch sử đã trả." />
      {error && <ErrorState message={error} />}
      {myBorrowings.length === 0 ? (
        <EmptyState title="Chưa có phiếu mượn" description="Tạo phiếu từ trang danh mục sách khi tìm được sách cần mượn." />
      ) : (
        <div className="surface table-responsive">
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
              {myBorrowings.map((item) => (
                <tr key={item.id}>
                  <td className="fw-semibold">{bookName(books, item.bookId)}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>{formatDate(item.borrowDate)}</td>
                  <td>{formatDate(item.dueDate)}</td>
                  <td>{formatDate(item.returnDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
