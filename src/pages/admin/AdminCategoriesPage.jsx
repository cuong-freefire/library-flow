import { useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { PaginationControls, usePagination } from '../../components/Pagination';
import { useToast } from '../../context/ToastContext';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';

export function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoryData, bookData] = await Promise.all([categoryService.getAll(), bookService.getAll()]);
      setCategories(categoryData);
      setBooks(bookData);
    } catch (err) {
      setError('Không thể tải thể loại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const bookCountByCategory = useMemo(() => {
    return books.reduce((acc, book) => {
      acc[book.categoryId] = (acc[book.categoryId] || 0) + 1;
      return acc;
    }, {});
  }, [books]);

  const submit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      await categoryService.update(editingId, { name: name.trim() });
      showToast('Đã cập nhật thể loại.', 'success');
    } else {
      await categoryService.create({ name: name.trim() });
      showToast('Đã thêm thể loại.', 'success');
    }
    setName('');
    setEditingId(null);
    await loadData();
  };

  const remove = async (category) => {
    if (bookCountByCategory[category.id]) {
      showToast('Không thể xóa thể loại đang được sách sử dụng.', 'danger');
      return;
    }
    await categoryService.remove(category.id);
    showToast('Đã xóa thể loại.', 'success');
    await loadData();
  };

  const categoryPagination = usePagination(categories, {
    pageSize: 8,
    resetKey: String(categories.length),
  });

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Quản lý thể loại" description="Thêm, sửa, xóa thể loại để phục vụ lọc sách." />
      {error && <ErrorState message={error} />}
      <form className="surface p-3 mb-4" onSubmit={submit}>
        <div className="row g-3 align-items-end">
          <div className="col-md-9">
            <label className="form-label fw-semibold" htmlFor="categoryName">Tên thể loại</label>
            <input id="categoryName" className="form-control" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="col-md-3 d-grid">
            <button className="btn btn-primary" type="submit">{editingId ? 'Cập nhật' : 'Thêm thể loại'}</button>
          </div>
        </div>
      </form>
      {categories.length === 0 ? <EmptyState title="Chưa có thể loại" description="Thêm thể loại đầu tiên để phân loại sách." /> : (
        <div className="surface">
          <div className="table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Tên</th><th>Số sách</th><th className="text-end">Thao tác</th></tr></thead>
              <tbody>
                {categoryPagination.pageItems.map((category) => (
                  <tr key={category.id}>
                    <td className="fw-semibold">{category.name}</td>
                    <td>{bookCountByCategory[category.id] || 0}</td>
                    <td className="text-end">
                      <button className="btn btn-outline-secondary btn-sm me-2" type="button" onClick={() => { setEditingId(category.id); setName(category.name); }}>Sửa</button>
                      <button className="btn btn-outline-danger btn-sm" type="button" onClick={() => remove(category)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls {...categoryPagination} />
        </div>
      )}
    </>
  );
}
