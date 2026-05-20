import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePagination } from '../../../components/Pagination';
import { useToast } from '../../../context/ToastContext';
import { bookService } from '../../../services/bookService';
import { borrowingService } from '../../../services/borrowingService';
import { userService } from '../../../services/userService';
import { isOverdue } from '../../../utils/date';
import { bookName, userName } from '../../../utils/library';

export const statusFilters = ['all', 'pending', 'borrowing', 'overdue', 'returned', 'rejected'];

export const dateFieldLabels = {
  borrowDate: 'Ngày mượn',
  dueDate: 'Hạn trả',
  returnDate: 'Ngày trả',
};

export function useAdminBorrowings() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Hook này giữ state và action của màn phiếu mượn, giúp page không bị trộn logic API vào JSX.
  const [borrowings, setBorrowings] = useState([]);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState(() => {
    const paramStatus = searchParams.get('status');
    return statusFilters.includes(paramStatus) ? paramStatus : 'all';
  });
  const [query, setQuery] = useState('');
  const [dateField, setDateField] = useState('borrowDate');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cần tải cả phiếu, sách và user để table có đủ dữ liệu hiển thị tên và trạng thái liên quan.
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [borrowingData, bookData, userData] = await Promise.all([
        borrowingService.getAll(),
        bookService.getAll(),
        userService.getAll(),
      ]);
      setBorrowings(borrowingData);
      setBooks(bookData);
      setUsers(userData);
    } catch (err) {
      setError('Không thể tải phiếu mượn.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Đồng bộ query string ?status=... với filter trong UI, phục vụ link nhanh từ dashboard.
  useEffect(() => {
    const paramStatus = searchParams.get('status');
    setStatus(statusFilters.includes(paramStatus) ? paramStatus : 'all');
  }, [searchParams]);

  const changeStatus = (nextStatus) => {
    setStatus(nextStatus);
    setSearchParams(nextStatus === 'all' ? {} : { status: nextStatus });
  };

  const clearDateFilter = () => {
    setDateFrom('');
    setDateTo('');
  };

  // Search, status filter, date filter và sort được gom lại để dễ kiểm soát thứ tự lọc.
  const filteredBorrowings = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return borrowings
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
        const haystack = `${bookName(books, item.bookId)} ${userName(users, item.userId)}`.toLowerCase();
        return !keyword || haystack.includes(keyword);
      })
      .sort((a, b) => Number(b.id) - Number(a.id));
  }, [borrowings, books, users, query, status, dateField, dateFrom, dateTo]);

  const getBook = (bookId) => books.find((book) => String(book.id) === String(bookId));
  const getUser = (userId) => users.find((user) => String(user.id) === String(userId));

  // Khi filter đổi, pagination quay lại trang đầu để tránh rơi vào trang không còn dữ liệu.
  const pagination = usePagination(filteredBorrowings, {
    pageSize: 8,
    resetKey: `${query}|${status}|${dateField}|${dateFrom}|${dateTo}`,
  });

  // Bọc các thao tác duyệt/trả/từ chối để xử lý toast, lỗi và reload dữ liệu thống nhất.
  const runAction = async (action, successMessage) => {
    setError('');
    try {
      await action();
      showToast(successMessage, 'success');
      await loadData();
    } catch (err) {
      showToast(err.message || 'Thao tác thất bại.', 'danger');
    }
  };

  // Các action bên dưới chỉ nhận borrowing từ table, hook tự tìm book liên quan trước khi gọi service.
  const approve = (borrowing) => {
    runAction(
      () => borrowingService.approve(borrowing, getBook(borrowing.bookId)),
      'Đã duyệt phiếu và trừ số lượng sách.'
    );
  };

  const reject = (borrowing) => {
    runAction(() => borrowingService.reject(borrowing.id), 'Đã từ chối phiếu.');
  };

  const returnBook = (borrowing, payload) => {
    const message = payload?.returnCondition === 'damaged'
      ? 'Đã ghi nhận sách trả bị hỏng.'
      : payload?.returnCondition === 'lost'
        ? 'Đã ghi nhận sách bị mất.'
        : 'Đã xác nhận trả sách.';

    runAction(
      () => borrowingService.returnBook(borrowing, getBook(borrowing.bookId), payload),
      message
    );
  };

  return {
    books,
    changeStatus,
    clearDateFilter,
    dateField,
    dateFrom,
    dateTo,
    error,
    filteredBorrowings,
    getUser,
    loading,
    pagination,
    query,
    setDateField,
    setDateFrom,
    setDateTo,
    setQuery,
    status,
    users,
    approve,
    reject,
    returnBook,
  };
}
