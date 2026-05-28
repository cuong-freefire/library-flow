export const statusLabels = {
  pending: 'Chờ duyệt',
  borrowing: 'Đang mượn',
  returned: 'Đã trả',
  rejected: 'Bị từ chối',
};

export const statusBadge = {
  pending: 'text-bg-warning',
  borrowing: 'text-bg-primary',
  returned: 'text-bg-success',
  rejected: 'text-bg-danger',
};

export const bookStatusLabels = {
  available: 'Đang hiển thị',
  unavailable: 'Đã ẩn',
};

export const bookStatusBadge = {
  available: 'text-bg-success',
  unavailable: 'text-bg-secondary',
};

export function getBorrowedCopies(borrowings = [], bookId) {
  return borrowings.filter((item) => String(item.bookId) === String(bookId) && item.status === 'borrowing').length;
}

export function getPendingCopies(borrowings = [], bookId) {
  return borrowings.filter((item) => String(item.bookId) === String(bookId) && item.status === 'pending').length;
}

export function calculateAvailableCopies(book, borrowings = []) {
  const borrowedCopies = Array.isArray(borrowings) ? getBorrowedCopies(borrowings, book?.id) : Number(borrowings || 0);
  return Math.max(
    0,
    Number(book?.totalCopies || 0) -
      borrowedCopies -
      Number(book?.damagedCopies || 0) -
      Number(book?.lostCopies || 0)
  );
}

export function categoryName(categories, categoryId) {
  return categories.find((category) => String(category.id) === String(categoryId))?.name || 'Chưa phân loại';
}

export function isBookBorrowable(book, borrowings = []) {
  return book?.status === 'available' && calculateAvailableCopies(book, borrowings) > 0;
}

export function getBookAvailability(book, borrowings = []) {
  if (book?.status !== 'available') {
    return {
      badgeClass: 'text-bg-secondary',
      label: 'Không khả dụng',
      borrowLabel: 'Không khả dụng',
    };
  }

  const remainingCopies = calculateAvailableCopies(book, borrowings);

  if (remainingCopies <= 0) {
    return {
      badgeClass: 'text-bg-secondary',
      label: 'Hết sách',
      borrowLabel: 'Hết sách',
    };
  }

  return {
    badgeClass: 'text-bg-success',
    label: `Còn ${remainingCopies}`,
    borrowLabel: 'Đăng ký mượn',
  };
}

export function bookName(books, bookId) {
  return books.find((book) => String(book.id) === String(bookId))?.title || 'Sách không tồn tại';
}

export function userName(users, userId) {
  return users.find((user) => String(user.id) === String(userId))?.name || 'Người dùng không tồn tại';
}
