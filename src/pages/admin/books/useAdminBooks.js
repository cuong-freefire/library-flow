import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '../../../components/Pagination';
import { useToast } from '../../../context/ToastContext';
import { bookService } from '../../../services/bookService';
import { borrowingService } from '../../../services/borrowingService';
import { categoryService } from '../../../services/categoryService';
import { calculateAvailableCopies, getBorrowedCopies, getPendingCopies } from '../../../utils/library';

export const emptyBook = {
  title: '',
  author: '',
  categoryId: '',
  description: '',
  totalCopies: 1,
  damagedCopies: 0,
  lostCopies: 0,
  coverImage: '',
  status: 'available',
};

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

export function useAdminBooks() {
  const { showToast } = useToast();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [form, setForm] = useState(emptyBook);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({ categoryId: 'all', status: 'all', stock: 'all' });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [processingBookId, setProcessingBookId] = useState(null);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
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

  const getBorrowedCount = (bookId) => getBorrowedCopies(borrowings, bookId);
  const getPendingCount = (bookId) => getPendingCopies(borrowings, bookId);
  const getAvailableCount = (book) => calculateAvailableCopies(book, borrowings);

  const filteredBooks = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return books
      .filter((book) => !keyword || `${book.title} ${book.author}`.toLowerCase().includes(keyword))
      .filter((book) => filters.categoryId === 'all' || String(book.categoryId) === filters.categoryId)
      .filter((book) => filters.status === 'all' || book.status === filters.status)
      .filter((book) => {
        const remainingCopies = calculateAvailableCopies(book, borrowings);
        if (filters.stock === 'all') return true;
        if (filters.stock === 'borrowable') return book.status === 'available' && remainingCopies > 0;
        if (filters.stock === 'outOfStock') return book.status === 'available' && remainingCopies <= 0;
        if (filters.stock === 'hasPending') return getPendingCopies(borrowings, book.id) > 0;
        if (filters.stock === 'hasBorrowing') return getBorrowedCopies(borrowings, book.id) > 0;
        if (filters.stock === 'hasDamagedOrLost') return Number(book.damagedCopies || 0) + Number(book.lostCopies || 0) > 0;
        return true;
      })
      .sort((left, right) => left.title.localeCompare(right.title));
  }, [books, borrowings, filters, query]);

  const hasActiveBorrowing = (bookId) => borrowings.some(
    (item) => String(item.bookId) === String(bookId) && ['pending', 'borrowing'].includes(item.status)
  );

  const hasDuplicateBook = (payload) => books.some((book) => (
    String(book.id) !== String(editingId) &&
    normalizeText(book.title) === normalizeText(payload.title) &&
    normalizeText(book.author) === normalizeText(payload.author)
  ));

  const pagination = usePagination(filteredBooks, {
    pageSize: 8,
    resetKey: `${query}|${JSON.stringify(filters)}`,
  });

  const resetForm = () => {
    setForm(emptyBook);
    setEditingId(null);
  };

  const submitBook = async (values) => {
    if (isSaving) return;
    setError('');

    const borrowedCopies = editingId ? getBorrowedCount(editingId) : 0;
    const payload = {
      title: values.title.trim(),
      author: values.author.trim(),
      categoryId: Number(values.categoryId),
      description: values.description?.trim() || '',
      totalCopies: Number(values.totalCopies),
      damagedCopies: Number(values.damagedCopies || 0),
      lostCopies: Number(values.lostCopies || 0),
      coverImage: values.coverImage?.trim() || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80',
      status: editingId ? (books.find((book) => String(book.id) === String(editingId))?.status || 'available') : 'available',
    };

    if (hasDuplicateBook(payload)) {
      showToast('Sách cùng tên và tác giả đã tồn tại.', 'danger');
      return;
    }

    const remainingCopies = payload.totalCopies - borrowedCopies - payload.damagedCopies - payload.lostCopies;
    if (remainingCopies < 0) {
      showToast('Tổng số bản không đủ cho số đang mượn, hỏng và mất.', 'danger');
      return;
    }

    try {
      setIsSaving(true);
      if (editingId) {
        await bookService.update(editingId, payload);
        showToast('Đã cập nhật sách.', 'success');
      } else {
        await bookService.create(payload);
        showToast('Đã thêm sách.', 'success');
      }
      resetForm();
      await loadData();
    } catch (err) {
      showToast('Không thể lưu sách. Kiểm tra API mock.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const editBook = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title || '',
      author: book.author || '',
      categoryId: String(book.categoryId || ''),
      description: book.description || '',
      totalCopies: book.totalCopies || 1,
      damagedCopies: book.damagedCopies || 0,
      lostCopies: book.lostCopies || 0,
      coverImage: book.coverImage || '',
      status: book.status || 'available',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeBook = async (book) => {
    if (processingBookId) return;
    if (hasActiveBorrowing(book.id)) {
      showToast('Không thể ẩn sách đang có phiếu chờ duyệt hoặc đang mượn.', 'danger');
      return;
    }

    try {
      setProcessingBookId(book.id);
      await bookService.update(book.id, { status: 'unavailable' });
      showToast('Đã ẩn đầu sách.', 'success');
      await loadData();
    } catch (err) {
      showToast('Không thể ẩn sách.', 'danger');
    } finally {
      setProcessingBookId(null);
    }
  };

  const restoreBook = async (book) => {
    if (processingBookId) return;
    try {
      setProcessingBookId(book.id);
      await bookService.update(book.id, { status: 'available' });
      showToast('Đã hiện lại đầu sách.', 'success');
      await loadData();
    } catch (err) {
      showToast('Không thể hiện lại sách.', 'danger');
    } finally {
      setProcessingBookId(null);
    }
  };

  return {
    books,
    categories,
    editingId,
    error,
    filteredBooks,
    filters,
    form,
    getAvailableCount,
    getBorrowedCount,
    getPendingCount,
    isSaving,
    loading,
    pagination,
    processingBookId,
    query,
    resetForm,
    setFilters,
    setQuery,
    submitBook,
    editBook,
    removeBook,
    restoreBook,
  };
}
