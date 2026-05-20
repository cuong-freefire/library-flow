import { useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { PaginationControls, usePagination } from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { borrowingService } from '../../services/borrowingService';
import { categoryService } from '../../services/categoryService';
import { bookStatusBadge, bookStatusLabels, categoryName } from '../../utils/library';

const emptyBook = {
  title: '',
  author: '',
  categoryId: '',
  description: '',
  totalCopies: 1,
  damagedCopies: 0,
  lostCopies: 0,
  shelfLocation: '',
  coverImage: '',
  status: 'available',
};

export function AdminBooksPage() {
  const { showToast } = useToast();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ categoryId: 'all', status: 'all', stock: 'all', shelf: 'all' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookData, categoryData, borrowingData] = await Promise.all([bookService.getAll(), categoryService.getAll(), borrowingService.getAll()]);
      setBooks(bookData);
      setCategories(categoryData);
      setBorrowings(borrowingData);
    } catch (err) {
      setError('Không thể tải dữ liệu sách.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const borrowedCountByBook = useMemo(() => {
    return borrowings.reduce((acc, item) => {
      if (item.status === 'borrowing') {
        acc[item.bookId] = (acc[item.bookId] || 0) + 1;
      }
      return acc;
    }, {});
  }, [borrowings]);

  const pendingCountByBook = useMemo(() => {
    return borrowings.reduce((acc, item) => {
      if (item.status === 'pending') {
        acc[item.bookId] = (acc[item.bookId] || 0) + 1;
      }
      return acc;
    }, {});
  }, [borrowings]);

  const getBorrowedCount = (bookId) => borrowedCountByBook[bookId] || 0;
  const getPendingCount = (bookId) => pendingCountByBook[bookId] || 0;

  const shelfOptions = useMemo(() => {
    return Array.from(new Set(books.map((book) => book.shelfLocation).filter(Boolean))).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return books
      .filter((book) => !keyword || `${book.title} ${book.author}`.toLowerCase().includes(keyword))
      .filter((book) => filters.categoryId === 'all' || String(book.categoryId) === filters.categoryId)
      .filter((book) => filters.status === 'all' || book.status === filters.status)
      .filter((book) => filters.shelf === 'all' || book.shelfLocation === filters.shelf)
      .filter((book) => {
        if (filters.stock === 'all') return true;
        if (filters.stock === 'borrowable') return book.status === 'available' && Number(book.availableCopies) > 0;
        if (filters.stock === 'outOfStock') return book.status === 'available' && Number(book.availableCopies) <= 0;
        if (filters.stock === 'hasPending') return (pendingCountByBook[book.id] || 0) > 0;
        if (filters.stock === 'hasBorrowing') return (borrowedCountByBook[book.id] || 0) > 0;
        if (filters.stock === 'hasDamagedOrLost') return Number(book.damagedCopies || 0) + Number(book.lostCopies || 0) > 0;
        return true;
      });
  }, [books, filters, query, borrowedCountByBook, pendingCountByBook]);

  const hasActiveBorrowing = (bookId) => borrowings.some(
    (item) => String(item.bookId) === String(bookId) && ['pending', 'borrowing'].includes(item.status)
  );

  const bookPagination = usePagination(filteredBooks, {
    pageSize: 8,
    resetKey: `${query}|${JSON.stringify(filters)}`,
  });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const borrowedCopies = editingId ? getBorrowedCount(editingId) : 0;
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      totalCopies: Number(form.totalCopies),
      damagedCopies: Number(form.damagedCopies || 0),
      lostCopies: Number(form.lostCopies || 0),
      coverImage: form.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    };
    payload.availableCopies = payload.totalCopies - borrowedCopies - payload.damagedCopies - payload.lostCopies;
    if (!payload.title || !payload.author || !payload.categoryId) {
      showToast('Vui lòng nhập tên sách, tác giả và thể loại.', 'danger');
      return;
    }
    if (payload.availableCopies < 0) {
      showToast('Tổng số bản không đủ cho số đang mượn, hỏng và mất.', 'danger');
      return;
    }
    if (editingId && payload.status === 'unavailable' && hasActiveBorrowing(editingId)) {
      showToast('Không thể ẩn sách đang có phiếu chờ duyệt hoặc đang mượn.', 'danger');
      return;
    }
    if (editingId) {
      await bookService.update(editingId, payload);
      showToast('Đã cập nhật sách.', 'success');
    } else {
      await bookService.create(payload);
      showToast('Đã thêm sách.', 'success');
    }
    setForm(emptyBook);
    setEditingId(null);
    await loadData();
  };

  const edit = (book) => {
    setEditingId(book.id);
    setForm({
      ...book,
      damagedCopies: book.damagedCopies || 0,
      lostCopies: book.lostCopies || 0,
      availableCopies: book.availableCopies || 0,
      categoryId: String(book.categoryId),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (book) => {
    const hasHistory = borrowings.some((item) => String(item.bookId) === String(book.id));
    if (hasActiveBorrowing(book.id)) {
      showToast('Không thể xóa/ẩn sách đang có phiếu chờ duyệt hoặc đang mượn.', 'danger');
      return;
    }
    if (hasHistory) {
      await bookService.update(book.id, { status: 'unavailable' });
      showToast('Đã ẩn đầu sách có lịch sử mượn trả.', 'success');
    } else {
      await bookService.remove(book.id);
      showToast('Đã xóa sách.', 'success');
    }
    await loadData();
  };

  const restore = async (book) => {
    await bookService.update(book.id, { status: 'available' });
    showToast('Đã hiện lại đầu sách.', 'success');
    await loadData();
  };

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Quản lý sách" description="Thêm, sửa, xóa hoặc ẩn sách đã có lịch sử mượn trả." />
      {error && <ErrorState message={error} />}
      <form className="surface p-3 mb-4" onSubmit={submit}>
        <div className="row g-3">
          <div className="col-md-4"><label className="form-label fw-semibold">Tên sách</label><input className="form-control" value={form.title} onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))} /></div>
          <div className="col-md-4"><label className="form-label fw-semibold">Tác giả</label><input className="form-control" value={form.author} onChange={(e) => setForm((c) => ({ ...c, author: e.target.value }))} /></div>
          <div className="col-md-4">
            <label className="form-label fw-semibold">Thể loại</label>
            <select className="form-select" value={form.categoryId} onChange={(e) => setForm((c) => ({ ...c, categoryId: e.target.value }))}>
              <option value="">Chọn thể loại</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="col-md-2"><label className="form-label fw-semibold">Tổng bản</label><input type="number" min="0" className="form-control" value={form.totalCopies} onChange={(e) => setForm((c) => ({ ...c, totalCopies: e.target.value }))} /></div>
          <div className="col-md-2"><label className="form-label fw-semibold">Đang mượn</label><input className="form-control" value={editingId ? getBorrowedCount(editingId) : 0} disabled readOnly /></div>
          <div className="col-md-2"><label className="form-label fw-semibold">Chờ duyệt</label><input className="form-control" value={editingId ? getPendingCount(editingId) : 0} disabled readOnly /></div>
          <div className="col-md-2"><label className="form-label fw-semibold">Hỏng</label><input type="number" min="0" className="form-control" value={form.damagedCopies} onChange={(e) => setForm((c) => ({ ...c, damagedCopies: e.target.value }))} /></div>
          <div className="col-md-2"><label className="form-label fw-semibold">Mất</label><input type="number" min="0" className="form-control" value={form.lostCopies} onChange={(e) => setForm((c) => ({ ...c, lostCopies: e.target.value }))} /></div>
          <div className="col-md-2"><label className="form-label fw-semibold">Vị trí kệ</label><input className="form-control" value={form.shelfLocation} onChange={(e) => setForm((c) => ({ ...c, shelfLocation: e.target.value }))} /></div>
          <div className="col-md-2">
            <label className="form-label fw-semibold">Trạng thái</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}>
              <option value="available">Đang hiển thị</option>
              <option value="unavailable">Đã ẩn</option>
            </select>
          </div>
          <div className="col-12"><label className="form-label fw-semibold">Ảnh bìa URL</label><input className="form-control" value={form.coverImage} onChange={(e) => setForm((c) => ({ ...c, coverImage: e.target.value }))} /></div>
          <div className="col-12"><label className="form-label fw-semibold">Mô tả</label><textarea className="form-control" rows="2" value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} /></div>
          <div className="col-12 d-flex gap-2">
            <button className="btn btn-primary" type="submit">{editingId ? 'Cập nhật sách' : 'Thêm sách'}</button>
            {editingId && <button className="btn btn-outline-secondary" type="button" onClick={() => { setEditingId(null); setForm(emptyBook); }}>Hủy sửa</button>}
          </div>
        </div>
      </form>
      <div className="surface p-3 mb-3">
        <div className="row g-3">
          <div className="col-lg-4">
            <input className="form-control" placeholder="Tìm sách theo tên hoặc tác giả" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="col-md-4 col-lg-2">
            <select className="form-select" value={filters.categoryId} onChange={(event) => setFilters((current) => ({ ...current, categoryId: event.target.value }))}>
              <option value="all">Tất cả thể loại</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="col-md-4 col-lg-2">
            <select className="form-select" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Đang hiển thị</option>
              <option value="unavailable">Đã ẩn</option>
            </select>
          </div>
          <div className="col-md-4 col-lg-2">
            <select className="form-select" value={filters.stock} onChange={(event) => setFilters((current) => ({ ...current, stock: event.target.value }))}>
              <option value="all">Tất cả số lượng</option>
              <option value="borrowable">Có thể mượn</option>
              <option value="outOfStock">Hết bản</option>
              <option value="hasPending">Có phiếu chờ</option>
              <option value="hasBorrowing">Đang được mượn</option>
              <option value="hasDamagedOrLost">Có hỏng/mất</option>
            </select>
          </div>
          <div className="col-md-4 col-lg-2">
            <select className="form-select" value={filters.shelf} onChange={(event) => setFilters((current) => ({ ...current, shelf: event.target.value }))}>
              <option value="all">Tất cả kệ</option>
              {shelfOptions.map((shelf) => <option key={shelf} value={shelf}>{shelf}</option>)}
            </select>
          </div>
        </div>
      </div>
      {filteredBooks.length === 0 ? <EmptyState title="Không có sách" description="Thêm sách mới hoặc đổi từ khóa tìm kiếm." /> : (
        <div className="surface">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Sách</th><th>Thể loại</th><th>Số lượng</th><th>Kệ</th><th>Trạng thái</th><th className="text-end">Thao tác</th></tr></thead>
              <tbody>
                {bookPagination.pageItems.map((book) => (
                  <tr key={book.id}>
                    <td><div className="fw-semibold">{book.title}</div><div className="text-muted-2 small">{book.author}</div></td>
                    <td>{categoryName(categories, book.categoryId)}</td>
                    <td>
                      <div>{book.availableCopies}/{book.totalCopies} có thể mượn</div>
                      <div className="text-muted-2 small">Chờ duyệt: {getPendingCount(book.id)} · Đang mượn: {getBorrowedCount(book.id)}</div>
                      <div className="text-muted-2 small">Hỏng: {book.damagedCopies || 0} · Mất: {book.lostCopies || 0}</div>
                    </td>
                    <td>{book.shelfLocation}</td>
                    <td><span className={`badge ${bookStatusBadge[book.status] || 'text-bg-secondary'}`}>{bookStatusLabels[book.status] || book.status}</span></td>
                    <td className="text-end">
                      <button className="btn btn-outline-secondary btn-sm me-2" type="button" onClick={() => edit(book)}>Sửa</button>
                      {book.status === 'unavailable' ? (
                        <button className="btn btn-outline-success btn-sm" type="button" onClick={() => restore(book)}>Hiện lại</button>
                      ) : (
                        <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => remove(book)}>Xóa/ẩn</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls {...bookPagination} />
        </div>
      )}
    </>
  );
}
