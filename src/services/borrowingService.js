import axiosApi from '../api/axios';
import { addDays, todayIso } from '../utils/date';
import { calculateAvailableCopies } from '../utils/library';

async function getBorrowedCount(bookId) {
  const response = await axiosApi.get('/borrowings', {
    params: {
      bookId,
      status: 'borrowing',
    },
  });
  return response.data.length;
}

async function getCurrentUser(userId) {
  const response = await axiosApi.get(`/users/${userId}`);
  return response.data;
}

async function getAvailableCopies(book) {
  const borrowedCopies = await getBorrowedCount(book.id);
  return calculateAvailableCopies(book, borrowedCopies);
}

export const borrowingService = {
  async getAll() {
    const response = await axiosApi.get('/borrowings');
    return response.data;
  },

  async createRequest({ user, book }) {
    const currentUser = await getCurrentUser(user.id);
    if (currentUser.status === 'locked') {
      throw new Error('Tài khoản đang bị khóa nên không thể tạo phiếu mượn mới.');
    }
    if ((await getAvailableCopies(book)) <= 0 || book.status !== 'available') {
      throw new Error('Sách hiện không còn bản khả dụng.');
    }

    const existingResponse = await axiosApi.get('/borrowings', {
      params: {
        userId: currentUser.id,
        bookId: book.id,
      },
    });
    const activeBorrowing = existingResponse.data.find((item) => ['pending', 'borrowing'].includes(item.status));
    if (activeBorrowing) {
      throw new Error('Bạn đã có phiếu chờ duyệt hoặc đang mượn sách này.');
    }

    const response = await axiosApi.post('/borrowings', {
      userId: currentUser.id,
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
    if (!book) {
      throw new Error('Sách không tồn tại.');
    }
    if (borrowing.status !== 'pending') {
      throw new Error('Chỉ có thể duyệt phiếu đang chờ duyệt.');
    }
    if ((await getAvailableCopies(book)) <= 0 || book.status !== 'available') {
      await this.reject(borrowing.id, 'Sách đã hết tại thời điểm duyệt.');
      throw new Error('Sách đã hết, phiếu đã được chuyển sang từ chối.');
    }

    const response = await axiosApi.patch(`/borrowings/${borrowing.id}`, {
      status: 'borrowing',
      borrowDate: todayIso(),
      dueDate: addDays(todayIso(), 14),
    });
    return response.data;
  },

  async returnBook(borrowing, book, payload = {}) {
    if (!book) {
      throw new Error('Sách không tồn tại.');
    }
    const latestResponse = await axiosApi.get(`/borrowings/${borrowing.id}`);
    if (latestResponse.data.status !== 'borrowing') {
      throw new Error('Phiếu này đã được xử lý trước đó.');
    }
    if (borrowing.status !== 'borrowing') {
      throw new Error('Chỉ phiếu đang mượn mới có thể xác nhận trả.');
    }

    const returnCondition = payload.returnCondition || 'normal';
    if (returnCondition === 'damaged') {
      await axiosApi.patch(`/books/${book.id}`, {
        damagedCopies: Number(book.damagedCopies || 0) + 1,
      });
    } else if (returnCondition === 'lost') {
      await axiosApi.patch(`/books/${book.id}`, {
        lostCopies: Number(book.lostCopies || 0) + 1,
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
