import { useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
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
  availableCopies: 1,
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

  const filteredBooks = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return books.filter((book) => !keyword || `${book.title} ${book.author}`.toLowerCase().includes(keyword));
  }, [books, query]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = {
      ...form,
      categoryId: Number(form.categoryId),
      totalCopies: Number(form.totalCopies),
      availableCopies: Number(form.availableCopies),
      coverImage: form.coverImage || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
    };
    if (!payload.title || !payload.author || !payload.categoryId) {
      showToast('Vui lòng nhập tên sách, tác giả và thể loại.', 'danger');
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
    setForm({ ...book, categoryId: String(book.categoryId) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (book) => {
    const hasHistory = borrowings.some((item) => String(item.bookId) === String(book.id));
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
          <div className="col-md-3"><label className="form-label fw-semibold">Tổng bản</label><input type="number" min="0" className="form-control" value={form.totalCopies} onChange={(e) => setForm((c) => ({ ...c, totalCopies: e.target.value }))} /></div>
          <div className="col-md-3"><label className="form-label fw-semibold">Còn lại</label><input type="number" min="0" className="form-control" value={form.availableCopies} onChange={(e) => setForm((c) => ({ ...c, availableCopies: e.target.value }))} /></div>
          <div className="col-md-3"><label className="form-label fw-semibold">Vị trí kệ</label><input className="form-control" value={form.shelfLocation} onChange={(e) => setForm((c) => ({ ...c, shelfLocation: e.target.value }))} /></div>
          <div className="col-md-3">
            <label className="form-label fw-semibold">Trạng thái</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))}>
              <option value="available">Đang hiển thị</option>
              <option value="unavailable">Đã ẩn</option>
              <option value="damaged">Hư hỏng</option>
              <option value="lost">Thất lạc</option>
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
      <div className="surface p-3 mb-3"><input className="form-control" placeholder="Tìm sách theo tên hoặc tác giả" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      {filteredBooks.length === 0 ? <EmptyState title="Không có sách" description="Thêm sách mới hoặc đổi từ khóa tìm kiếm." /> : (
        <div className="surface table-responsive">
          <table className="table mb-0">
            <thead><tr><th>Sách</th><th>Thể loại</th><th>Số lượng</th><th>Kệ</th><th>Trạng thái</th><th className="text-end">Thao tác</th></tr></thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td><div className="fw-semibold">{book.title}</div><div className="text-muted-2 small">{book.author}</div></td>
                  <td>{categoryName(categories, book.categoryId)}</td>
                  <td>{book.availableCopies}/{book.totalCopies}</td>
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
      )}
    </>
  );
}
