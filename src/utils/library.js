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

export function categoryName(categories, categoryId) {
  return categories.find((category) => String(category.id) === String(categoryId))?.name || 'Chưa phân loại';
}

export function isBookBorrowable(book) {
  return book?.status === 'available' && Number(book?.availableCopies) > 0;
}

export function getBookAvailability(book) {
  if (book?.status !== 'available') {
    return {
      badgeClass: 'text-bg-secondary',
      label: 'Không khả dụng',
      borrowLabel: 'Không khả dụng',
    };
  }

  if (Number(book?.availableCopies) <= 0) {
    return {
      badgeClass: 'text-bg-secondary',
      label: 'Hết sách',
      borrowLabel: 'Hết sách',
    };
  }

  return {
    badgeClass: 'text-bg-success',
    label: `Còn ${book.availableCopies}`,
    borrowLabel: 'Đăng ký mượn',
  };
}

export function bookName(books, bookId) {
  return books.find((book) => String(book.id) === String(bookId))?.title || 'Sách không tồn tại';
}

export function userName(users, userId) {
  return users.find((user) => String(user.id) === String(userId))?.name || 'Người dùng không tồn tại';
}
