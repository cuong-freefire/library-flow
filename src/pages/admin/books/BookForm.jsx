export function BookForm({
  categories,
  editingId,
  form,
  getBorrowedCount,
  getPendingCount,
  onCancel,
  onChange,
  onSubmit,
}) {
  // Dùng một helper chung để tránh lặp lại setState cho từng field trong form.
  const updateField = (field) => (event) => {
    onChange((current) => ({ ...current, [field]: event.target.value }));
  };

  return (
    <form className="surface p-3 mb-4" onSubmit={onSubmit}>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label fw-semibold">Tên sách</label>
          <input className="form-control" value={form.title} onChange={updateField('title')} />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Tác giả</label>
          <input className="form-control" value={form.author} onChange={updateField('author')} />
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold">Thể loại</label>
          <select className="form-select" value={form.categoryId} onChange={updateField('categoryId')}>
            <option value="">Chọn thể loại</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">Tổng bản</label>
          <input type="number" min="0" className="form-control" value={form.totalCopies} onChange={updateField('totalCopies')} />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">Đang mượn</label>
          <input className="form-control" value={editingId ? getBorrowedCount(editingId) : 0} disabled readOnly />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">Chờ duyệt</label>
          <input className="form-control" value={editingId ? getPendingCount(editingId) : 0} disabled readOnly />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">Hỏng</label>
          <input type="number" min="0" className="form-control" value={form.damagedCopies} onChange={updateField('damagedCopies')} />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">Mất</label>
          <input type="number" min="0" className="form-control" value={form.lostCopies} onChange={updateField('lostCopies')} />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">Vị trí kệ</label>
          <input className="form-control" value={form.shelfLocation} onChange={updateField('shelfLocation')} />
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold">Trạng thái</label>
          <select className="form-select" value={form.status} onChange={updateField('status')}>
            <option value="available">Đang hiển thị</option>
            <option value="unavailable">Đã ẩn</option>
          </select>
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Ảnh bìa URL</label>
          <input className="form-control" value={form.coverImage} onChange={updateField('coverImage')} />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Mô tả</label>
          <textarea className="form-control" rows="2" value={form.description} onChange={updateField('description')} />
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary" type="submit">{editingId ? 'Cập nhật sách' : 'Thêm sách'}</button>
          {editingId && <button className="btn btn-outline-secondary" type="button" onClick={onCancel}>Hủy sửa</button>}
        </div>
      </div>
    </form>
  );
}
