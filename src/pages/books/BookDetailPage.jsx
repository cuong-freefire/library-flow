import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { borrowingService } from '../../services/borrowingService';
import { categoryService } from '../../services/categoryService';
import { categoryName, getBookAvailability, isBookBorrowable } from '../../utils/library';

export function BookDetailPage() {
  const { bookId } = useParams();
  const { user, isAuthenticated } = useAuthContext();
  const { showToast } = useToast();
  const [book, setBook] = useState(null);
  const [categories, setCategories] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [bookData, categoryData, borrowingData] = await Promise.all([
          bookService.getById(bookId),
          categoryService.getAll(),
          isAuthenticated ? borrowingService.getAll() : Promise.resolve([]),
        ]);
        setBook(bookData);
        setCategories(categoryData);
        setBorrowings(borrowingData);
      } catch (err) {
        setError('Không tìm thấy sách hoặc API chưa sẵn sàng.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookId, isAuthenticated]);

  const requestBorrow = async () => {
    if (!isAuthenticated) {
      showToast('Bạn cần đăng nhập Reader để tạo phiếu mượn.', 'danger');
      return;
    }
    if (user.role !== 'reader') {
      showToast('Admin không tạo phiếu mượn cá nhân tại trang Reader.', 'danger');
      return;
    }
    try {
      await borrowingService.createRequest({ user, book });
      showToast('Đã tạo phiếu chờ duyệt. Admin sẽ xử lý tại quầy.', 'success');
      const borrowingData = await borrowingService.getAll();
      setBorrowings(borrowingData);
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  if (loading) return <LoadingState />;
  if (!book) return <EmptyState title="Không tìm thấy sách" description="Sách này không tồn tại trong dữ liệu hiện tại." />;

  const activeBorrowing = user
    ? borrowings.find((item) => String(item.userId) === String(user.id) && String(item.bookId) === String(book.id) && ['pending', 'borrowing'].includes(item.status))
    : null;
  const availability = getBookAvailability(book);
  const isBorrowDisabled = !isBookBorrowable(book) || Boolean(activeBorrowing) || (isAuthenticated && user?.role !== 'reader');
  const borrowLabel = activeBorrowing?.status === 'pending'
    ? 'Đã đăng ký mượn'
    : activeBorrowing?.status === 'borrowing'
      ? 'Đang mượn sách này'
      : !isAuthenticated
        ? 'Đăng nhập để mượn'
        : user?.role !== 'reader'
          ? 'Chỉ Reader được mượn'
          : availability.borrowLabel;

  return (
    <section className="surface overflow-hidden">
      <div className="row g-0">
        <div className="col-lg-5">
          <img className="w-100 h-100 object-fit-cover" style={{ minHeight: 360 }} src={book.coverImage} alt={book.title} />
        </div>
        <div className="col-lg-7 p-4 p-lg-5">
          <Link className="text-decoration-none text-muted-2" to="/books">← Quay lại danh sách</Link>
          <div className="mt-3 mb-2 d-flex gap-2 flex-wrap">
            <span className="badge badge-soft">{categoryName(categories, book.categoryId)}</span>
            <span className={`badge ${availability.badgeClass}`}>{availability.label}</span>
          </div>
          <h1 className="h2 fw-bold">{book.title}</h1>
          <p className="text-muted-2 fs-5">{book.author}</p>
          {error && <ErrorState message={error} />}
          <p className="my-4">{book.description}</p>
          <div className="row g-3 mb-4">
            <div className="col-sm-3"><div className="metric"><div className="text-muted-2 small">Tổng bản</div><div className="h4 mb-0">{book.totalCopies}</div></div></div>
            <div className="col-sm-3"><div className="metric"><div className="text-muted-2 small">Có thể mượn</div><div className="h4 mb-0">{book.availableCopies}</div></div></div>
            <div className="col-sm-3"><div className="metric"><div className="text-muted-2 small">Hỏng/mất</div><div className="h4 mb-0">{(book.damagedCopies || 0) + (book.lostCopies || 0)}</div></div></div>
            <div className="col-sm-3"><div className="metric"><div className="text-muted-2 small">Kệ</div><div className="h4 mb-0">{book.shelfLocation}</div></div></div>
          </div>
          <button className="btn btn-primary" type="button" disabled={isBorrowDisabled} onClick={requestBorrow}>
            {borrowLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
