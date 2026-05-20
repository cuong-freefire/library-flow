import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '../../../components/Pagination';
import { useToast } from '../../../context/ToastContext';
import { bookService } from '../../../services/bookService';
import { borrowingService } from '../../../services/borrowingService';
import { categoryService } from '../../../services/categoryService';

export const emptyBook = {
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

export function useAdminBooks() {
  const { showToast } = useToast();

  // Gom toàn bộ state của màn quản lý sách vào hook để page chỉ còn nhiệm vụ render.
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ categoryId: 'all', status: 'all', stock: 'all', shelf: 'all' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Tải đồng thời sách, thể loại và phiếu mượn vì màn này cần cả ba nguồn dữ liệu.
  const loadData = async () => {
    setLoading(true);
    try {
      const [bookData, categoryData, borrowingData] = await Promise.all([
        bookService.getAll(),
        categoryService.getAll(),
        borrowingService.getAll(),
      ]);
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

  // Tạo map đếm theo bookId để khi render table không phải lọc lại toàn bộ borrowings cho từng dòng.
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

  // Danh sách kệ được suy ra từ dữ liệu sách hiện có, tránh hard-code option lọc.
  const shelfOptions = useMemo(() => {
    return Array.from(new Set(books.map((book) => book.shelfLocation).filter(Boolean))).sort();
  }, [books]);

  // Toàn bộ điều kiện search/filter nằm cùng một chỗ để dễ sửa khi thêm bộ lọc mới.
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

  // resetKey giúp pagination quay về trang đầu khi người dùng đổi filter hoặc từ khóa.
  const pagination = usePagination(filteredBooks, {
    pageSize: 8,
    resetKey: `${query}|${JSON.stringify(filters)}`,
  });

  const resetForm = () => {
    setForm(emptyBook);
    setEditingId(null);
  };

  // Chuẩn hóa payload trước khi gửi API, đặc biệt là số lượng và categoryId từ form string.
  const submitBook = async (event) => {
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

    // Các rule dưới đây bảo vệ dữ liệu kho sách trước khi create/update.
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
    resetForm();
    await loadData();
  };

  // Khi sửa sách, convert categoryId về string để select control hiển thị đúng option.
  const editBook = (book) => {
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

  // Sách đã có lịch sử mượn trả sẽ được ẩn thay vì xóa để không mất dữ liệu tham chiếu.
  const removeBook = async (book) => {
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

  const restoreBook = async (book) => {
    await bookService.update(book.id, { status: 'available' });
    showToast('Đã hiện lại đầu sách.', 'success');
    await loadData();
  };

  return {
    books,
    categories,
    editingId,
    error,
    filteredBooks,
    filters,
    form,
    getBorrowedCount,
    getPendingCount,
    loading,
    pagination,
    query,
    resetForm,
    setFilters,
    setForm,
    setQuery,
    shelfOptions,
    submitBook,
    editBook,
    removeBook,
    restoreBook,
  };
}
