import { PaginationControls } from '../../../components/Pagination';
import { bookStatusBadge, bookStatusLabels, categoryName } from '../../../utils/library';

export function BookTable({
  categories,
  getAvailableCount,
  getBorrowedCount,
  getPendingCount,
  onEdit,
  onRemove,
  onRestore,
  pagination,
  processingBookId,
}) {
  return (
    <div className="surface">
      <div className="table-responsive">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Sách</th>
              <th>Thể loại</th>
              <th>Số lượng</th>
              <th>Trạng thái</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageItems.map((book) => (
              <tr key={book.id}>
                <td>
                  <div className="fw-semibold">{book.title}</div>
                  <div className="text-muted-2 small">{book.author}</div>
                </td>
                <td>{categoryName(categories, book.categoryId)}</td>
                <td>
                  <div>{getAvailableCount(book)}/{book.totalCopies} có thể mượn</div>
                  <div className="text-muted-2 small">Chờ duyệt: {getPendingCount(book.id)} · Đang mượn: {getBorrowedCount(book.id)}</div>
                  <div className="text-muted-2 small">Hỏng: {book.damagedCopies || 0} · Mất: {book.lostCopies || 0}</div>
                </td>
                <td>
                  <span className={`badge ${bookStatusBadge[book.status] || 'text-bg-secondary'}`}>
                    {bookStatusLabels[book.status] || book.status}
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-outline-secondary btn-sm me-2" disabled={processingBookId === book.id} type="button" onClick={() => onEdit(book)}>Sửa</button>
                  {book.status === 'unavailable' ? (
                    <button className="btn btn-outline-success btn-sm" disabled={processingBookId === book.id} type="button" onClick={() => onRestore(book)}>
                      {processingBookId === book.id ? 'Đang xử lý...' : 'Hiện lại'}
                    </button>
                  ) : (
                    <button className="btn btn-outline-danger btn-sm" disabled={processingBookId === book.id} type="button" onClick={() => onRemove(book)}>
                      {processingBookId === book.id ? 'Đang xử lý...' : 'Ẩn'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls {...pagination} />
    </div>
  );
}
