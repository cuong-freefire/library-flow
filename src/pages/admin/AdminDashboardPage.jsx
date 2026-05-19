import { BookOpen, Clock, ClipboardList, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { bookService } from '../../services/bookService';
import { borrowingService } from '../../services/borrowingService';
import { userService } from '../../services/userService';
import { isOverdue } from '../../utils/date';

export function AdminDashboardPage() {
  const [data, setData] = useState({ books: [], users: [], borrowings: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [books, users, borrowings] = await Promise.all([bookService.getAll(), userService.getAll(), borrowingService.getAll()]);
        setData({ books, users, borrowings });
      } catch (err) {
        setError('Không thể tải dashboard.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const stats = useMemo(() => {
    const readers = data.users.filter((user) => user.role === 'reader');
    return {
      books: data.books.length,
      readers: readers.length,
      pending: data.borrowings.filter((item) => item.status === 'pending').length,
      borrowing: data.borrowings.filter((item) => item.status === 'borrowing').length,
      overdue: data.borrowings.filter(isOverdue).length,
    };
  }, [data]);

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Dashboard tổng quan" description="Theo dõi nhanh sách, reader và trạng thái phiếu mượn." />
      {error && <ErrorState message={error} />}
      <div className="dashboard-metrics">
        <Metric icon={<BookOpen />} label="Sách" to="/admin/books" value={stats.books} />
        <Metric icon={<UsersRound />} label="Reader" to="/admin/users" value={stats.readers} />
        <Metric icon={<ClipboardList />} label="Chờ duyệt" to="/admin/borrowings?status=pending" value={stats.pending} />
        <Metric icon={<BookOpen />} label="Đang mượn" to="/admin/borrowings?status=borrowing" value={stats.borrowing} />
        <Metric icon={<Clock />} label="Quá hạn" to="/admin/borrowings?status=overdue" value={stats.overdue} />
      </div>
    </>
  );
}

function Metric({ icon, label, to, value }) {
  return (
    <Link className="metric dashboard-metric text-decoration-none text-reset" to={to}>
      <div className="d-flex justify-content-between align-items-start gap-3 text-muted-2">
        <span>{label}</span>
        {icon}
      </div>
      <div className="dashboard-metric-value">{value}</div>
    </Link>
  );
}
