import { dateFieldLabels } from './useAdminBorrowings';

export function BorrowingFilters({
  dateField,
  dateFrom,
  dateTo,
  onClearDates,
  onDateFieldChange,
  onDateFromChange,
  onDateToChange,
  onQueryChange,
  onStatusChange,
  query,
  status,
}) {
  return (
    <div className="surface p-3 mb-4">
      <div className="row g-3">
        <div className="col-lg-4">
          <label className="form-label fw-semibold">Tìm kiếm</label>
          <input className="form-control" placeholder="Tìm theo reader hoặc sách" value={query} onChange={(event) => onQueryChange(event.target.value)} />
        </div>
        <div className="col-md-6 col-lg-2">
          <label className="form-label fw-semibold">Trạng thái phiếu</label>
          <select className="form-select" value={status} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="borrowing">Đang mượn</option>
            <option value="overdue">Quá hạn</option>
            <option value="returned">Đã trả</option>
            <option value="rejected">Bị từ chối</option>
          </select>
        </div>
        <div className="col-md-6 col-lg-2">
          <label className="form-label fw-semibold">Lọc theo ngày</label>
          <select className="form-select" value={dateField} onChange={(event) => onDateFieldChange(event.target.value)}>
            {Object.entries(dateFieldLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="col-md-6 col-lg-2">
          <label className="form-label fw-semibold">Từ ngày</label>
          <input className="form-control" type="date" aria-label="Từ ngày" value={dateFrom} onChange={(event) => onDateFromChange(event.target.value)} />
        </div>
        <div className="col-md-6 col-lg-2">
          <label className="form-label fw-semibold">Đến ngày</label>
          <input className="form-control" type="date" aria-label="Đến ngày" value={dateTo} onChange={(event) => onDateToChange(event.target.value)} />
        </div>
        {(dateFrom || dateTo) && (
          <div className="col-12">
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={onClearDates}>
              Xóa lọc thời gian
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
