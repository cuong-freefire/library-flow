import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { PaginationControls, usePagination } from '../../components/Pagination';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { borrowingService } from '../../services/borrowingService';
import { categoryService } from '../../services/categoryService';
import { categoryName, getBookAvailability, isBookBorrowable } from '../../utils/library';

export function BookListPage() {
  const { user, isAuthenticated } = useAuthContext();
  const { showToast } = useToast();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ q: '', categoryId: 'all', availability: 'all' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookData, categoryData, borrowingData] = await Promise.all([
        bookService.getAll(),
        categoryService.getAll(),
        isAuthenticated ? borrowingService.getAll() : Promise.resolve([]),
      ]);
      setBooks(bookData);
      setCategories(categoryData);
      setBorrowings(borrowingData);
    } catch (err) {
      showToast('Không thể tải danh sách sách. Kiểm tra API mock đã bật chưa.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredBooks = useMemo(() => {
    const keyword = filters.q.trim().toLowerCase();
    return books.filter((book) => {
      const matchesKeyword = !keyword || `${book.title} ${book.author}`.toLowerCase().includes(keyword);
      const matchesCategory = filters.categoryId === 'all' || String(book.categoryId) === filters.categoryId;
      const matchesAvailability =
        filters.availability === 'all' ||
        (filters.availability === 'available'
          ? isBookBorrowable(book)
          : filters.availability === 'outOfStock'
            ? book?.status === 'available' && Number(book?.availableCopies) <= 0
            : book?.status !== 'available');
      return matchesKeyword && matchesCategory && matchesAvailability;
    });
  }, [books, filters]);

  const requestBorrow = async (book) => {
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
      showToast(`Đã tạo phiếu chờ duyệt cho sách "${book.title}".`, 'success');
      const borrowingData = await borrowingService.getAll();
      setBorrowings(borrowingData);
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };

  const activeBorrowingByBook = useMemo(() => {
    if (!user) return {};
    return borrowings
      .filter((item) => String(item.userId) === String(user.id) && ['pending', 'borrowing'].includes(item.status))
      .reduce((acc, item) => {
        acc[item.bookId] = item.status;
        return acc;
      }, {});
  }, [borrowings, user]);

  const bookPagination = usePagination(filteredBooks, {
    pageSize: 6,
    resetKey: JSON.stringify(filters),
  });

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader
        eyebrow="Danh mục"
        title="Tra cứu sách"
        description="Tìm kiếm theo tên, tác giả, thể loại và trạng thái có thể mượn."
      />
      <div className="surface p-3 mb-4">
        <div className="row g-3">
          <div className="col-lg-6">
            <label className="form-label fw-semibold" htmlFor="search">Từ khóa</label>
            <div className="input-group">
              <span className="input-group-text"><Search size={17} /></span>
              <input
                id="search"
                className="form-control"
                placeholder="Tên sách hoặc tác giả"
                value={filters.q}
                onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" htmlFor="category">Thể loại</label>
            <select id="category" className="form-select" value={filters.categoryId} onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}>
              <option value="all">Tất cả</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label fw-semibold" htmlFor="availability">Trạng thái</label>
            <select id="availability" className="form-select" value={filters.availability} onChange={(event) => setFilters((current) => ({ ...current, availability: event.target.value }))}>
              <option value="all">Tất cả</option>
              <option value="available">Có thể mượn</option>
              <option value="outOfStock">Hết bản</option>
              <option value="unavailable">Không mượn được</option>
            </select>
          </div>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <EmptyState title="Không có sách phù hợp" description="Thử đổi từ khóa hoặc bộ lọc." />
      ) : (
        <>
          <div className="row g-4">
            {bookPagination.pageItems.map((book) => {
              const activeStatus = activeBorrowingByBook[book.id];
              const availability = getBookAvailability(book);
              const isBorrowDisabled = !isBookBorrowable(book) || Boolean(activeStatus) || (isAuthenticated && user?.role !== 'reader');
              const borrowLabel = activeStatus === 'pending'
                ? 'Đã đăng ký'
                : activeStatus === 'borrowing'
                  ? 'Đang mượn'
                  : !isAuthenticated
                    ? 'Đăng nhập để mượn'
                    : user?.role !== 'reader'
                      ? 'Chỉ Reader mượn'
                      : availability.borrowLabel;
              return (
                <div className="col-md-6 col-xl-4" key={book.id}>
                  <article className="surface h-100 overflow-hidden">
                    <img className="book-cover" src={book.coverImage} alt={book.title} />
                    <div className="p-3">
                      <div className="d-flex justify-content-between gap-2 mb-2">
                        <span className="badge badge-soft">{categoryName(categories, book.categoryId)}</span>
                        <span className={`badge ${availability.badgeClass}`}>
                          {availability.label}
                        </span>
                      </div>
                      <h2 className="h5 fw-bold mb-1">{book.title}</h2>
                      <p className="text-muted-2 mb-3">{book.author}</p>
                      <div className="d-flex gap-2">
                        <Link className="btn btn-outline-secondary btn-sm" to={`/books/${book.id}`}>Chi tiết</Link>
                        <button className="btn btn-primary btn-sm" type="button" disabled={isBorrowDisabled} onClick={() => requestBorrow(book)}>
                          {borrowLabel}
                        </button>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
          <div className="surface mt-3">
            <PaginationControls {...bookPagination} />
          </div>
        </>
      )}
    </>
  );
}
