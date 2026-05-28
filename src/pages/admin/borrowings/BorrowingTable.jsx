import { PaginationControls } from '../../../components/Pagination';
import { StatusBadge } from '../../../components/StatusBadge';
import { UserStatusBadge } from '../../../components/UserStatusBadge';
import { formatDate, isOverdue } from '../../../utils/date';
import { bookName, userName } from '../../../utils/library';

export function BorrowingTable({
  getUser,
  onApprove,
  onReject,
  onReturn,
  pagination,
  processingAction,
  books,
  users,
}) {
  const isProcessing = (item, action) => processingAction === `${action}:${item.id}`;
  const isRowProcessing = (item) => Boolean(processingAction?.endsWith(`:${item.id}`));

  return (
    <div className="surface">
      <div className="table-responsive">
        <table className="table mb-0">
          <thead>
            <tr>
              <th>Reader</th>
              <th>Trạng thái Reader</th>
              <th>Sách</th>
              <th>Trạng thái</th>
              <th>Ngày mượn</th>
              <th>Hạn trả</th>
              <th>Ngày trả</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pagination.pageItems.map((item) => {
              const reader = getUser(item.userId);
              const rowProcessing = isRowProcessing(item);
              return (
                <tr key={item.id}>
                  <td>{userName(users, item.userId)}</td>
                  <td><UserStatusBadge status={reader?.status} /></td>
                  <td>{bookName(books, item.bookId)}</td>
                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      <StatusBadge status={item.status} />
                      {isOverdue(item) && <span className="badge text-bg-danger">Quá hạn</span>}
                    </div>
                  </td>
                  <td>{formatDate(item.borrowDate)}</td>
                  <td>{formatDate(item.dueDate)}</td>
                  <td>{formatDate(item.returnDate)}</td>
                  <td className="text-end">
                    <div className="btn-group btn-group-sm borrowing-action-group">
                      <button className="btn btn-success" disabled={rowProcessing || item.status !== 'pending'} onClick={() => onApprove(item)} type="button">
                        {isProcessing(item, 'approve') ? 'Đang xử lý...' : 'Duyệt'}
                      </button>
                      <button className="btn btn-danger" disabled={rowProcessing || item.status !== 'pending'} onClick={() => onReject(item)} type="button">
                        {isProcessing(item, 'reject') ? 'Đang xử lý...' : 'Từ chối'}
                      </button>
                      <button className="btn btn-primary" disabled={rowProcessing || item.status !== 'borrowing'} onClick={() => onReturn(item)} type="button">
                        {isProcessing(item, 'return') ? 'Đang xử lý...' : 'Đã trả'}
                      </button>
                      <button className="btn btn-warning" disabled={rowProcessing || item.status !== 'borrowing'} onClick={() => onReturn(item, { returnCondition: 'damaged' })} type="button">
                        {isProcessing(item, 'damaged') ? 'Đang xử lý...' : 'Hỏng'}
                      </button>
                      <button className="btn btn-dark" disabled={rowProcessing || item.status !== 'borrowing'} onClick={() => onReturn(item, { returnCondition: 'lost' })} type="button">
                        {isProcessing(item, 'lost') ? 'Đang xử lý...' : 'Mất'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationControls {...pagination} />
    </div>
  );
}
