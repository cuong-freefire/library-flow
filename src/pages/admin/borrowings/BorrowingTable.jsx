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
  books,
  users,
}) {
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
                      <button className="btn btn-success" disabled={item.status !== 'pending'} onClick={() => onApprove(item)} type="button">Duyệt</button>
                      <button className="btn btn-danger" disabled={item.status !== 'pending'} onClick={() => onReject(item)} type="button">Từ chối</button>
                      <button className="btn btn-primary" disabled={item.status !== 'borrowing'} onClick={() => onReturn(item)} type="button">Đã trả</button>
                      <button className="btn btn-warning" disabled={item.status !== 'borrowing'} onClick={() => onReturn(item, { returnCondition: 'damaged' })} type="button">Hỏng</button>
                      <button className="btn btn-dark" disabled={item.status !== 'borrowing'} onClick={() => onReturn(item, { returnCondition: 'lost' })} type="button">Mất</button>
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
