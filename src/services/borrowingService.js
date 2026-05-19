import axiosApi from '../api/axios';
import { addDays, todayIso } from '../utils/date';

export const borrowingService = {
  async getAll() {
    const response = await axiosApi.get('/borrowings');
    return response.data;
  },

  async createRequest({ user, book }) {
    if (user.status === 'locked') {
      throw new Error('Tài khoản đang bị khóa nên không thể tạo phiếu mượn mới.');
    }
    if (Number(book.availableCopies) <= 0 || book.status !== 'available') {
      throw new Error('Sách hiện không còn bản khả dụng.');
    }

    const existingResponse = await axiosApi.get('/borrowings', {
      params: {
        userId: user.id,
        bookId: book.id,
      },
    });
    const activeBorrowing = existingResponse.data.find((item) => ['pending', 'borrowing'].includes(item.status));
    if (activeBorrowing) {
      throw new Error('Bạn đã có phiếu chờ duyệt hoặc đang mượn sách này.');
    }

    const response = await axiosApi.post('/borrowings', {
      userId: user.id,
      bookId: book.id,
      borrowDate: null,
      dueDate: null,
      returnDate: null,
      status: 'pending',
      rejectReason: '',
      returnCondition: null,
      returnNote: '',
    });
    return response.data;
  },

  async reject(id, reason = 'Phiếu không đủ điều kiện duyệt.') {
    const response = await axiosApi.patch(`/borrowings/${id}`, {
      status: 'rejected',
      rejectReason: reason,
    });
    return response.data;
  },

  async approve(borrowing, book) {
    if (borrowing.status !== 'pending') {
      throw new Error('Chỉ có thể duyệt phiếu đang chờ duyệt.');
    }
    if (Number(book.availableCopies) <= 0 || book.status !== 'available') {
      await this.reject(borrowing.id, 'Sách đã hết tại thời điểm duyệt.');
      throw new Error('Sách đã hết, phiếu đã được chuyển sang từ chối.');
    }

    const nextAvailable = Number(book.availableCopies) - 1;
    await axiosApi.patch(`/books/${book.id}`, { availableCopies: nextAvailable });
    const response = await axiosApi.patch(`/borrowings/${borrowing.id}`, {
      status: 'borrowing',
      borrowDate: todayIso(),
      dueDate: addDays(todayIso(), 14),
    });
    return response.data;
  },

  async returnBook(borrowing, book, payload = {}) {
    if (borrowing.status !== 'borrowing') {
      throw new Error('Chỉ phiếu đang mượn mới có thể xác nhận trả.');
    }

    const returnCondition = payload.returnCondition || 'normal';
    if (returnCondition === 'normal') {
      await axiosApi.patch(`/books/${book.id}`, {
        availableCopies: Number(book.availableCopies) + 1,
      });
    }

    const response = await axiosApi.patch(`/borrowings/${borrowing.id}`, {
      status: 'returned',
      returnDate: todayIso(),
      returnCondition,
      returnNote: payload.returnNote || '',
    });
    return response.data;
  },
};
