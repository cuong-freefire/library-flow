export function BookFilters({ categories, filters, onFiltersChange, onQueryChange, query, shelfOptions }) {
  // Các filter dùng chung shape state nên có thể cập nhật qua cùng một helper.
  const updateFilter = (field) => (event) => {
    onFiltersChange((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <div className="surface p-3 mb-3">
      <div className="row g-3">
        <div className="col-lg-4">
          <input className="form-control" placeholder="Tìm sách theo tên hoặc tác giả" value={query} onChange={(event) => onQueryChange(event.target.value)} />
        </div>
        <div className="col-md-4 col-lg-2">
          <select className="form-select" value={filters.categoryId} onChange={updateFilter('categoryId')}>
            <option value="all">Tất cả thể loại</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div className="col-md-4 col-lg-2">
          <select className="form-select" value={filters.status} onChange={updateFilter('status')}>
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Đang hiển thị</option>
            <option value="unavailable">Đã ẩn</option>
          </select>
        </div>
        <div className="col-md-4 col-lg-2">
          <select className="form-select" value={filters.stock} onChange={updateFilter('stock')}>
            <option value="all">Tất cả số lượng</option>
            <option value="borrowable">Có thể mượn</option>
            <option value="outOfStock">Hết bản</option>
            <option value="hasPending">Có phiếu chờ</option>
            <option value="hasBorrowing">Đang được mượn</option>
            <option value="hasDamagedOrLost">Có hỏng/mất</option>
          </select>
        </div>
        <div className="col-md-4 col-lg-2">
          <select className="form-select" value={filters.shelf} onChange={updateFilter('shelf')}>
            <option value="all">Tất cả kệ</option>
            {shelfOptions.map((shelf) => <option key={shelf} value={shelf}>{shelf}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
