import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { bookSchema } from './bookSchemas';

export function BookForm({
  categories,
  editingId,
  form,
  getBorrowedCount,
  getPendingCount,
  isSaving,
  onCancel,
  onSubmit,
}) {
  const bookForm = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: form,
  });

  useEffect(() => {
    bookForm.reset(form);
  }, [bookForm, form]);

  const errors = bookForm.formState.errors;

  return (
    <form className="surface p-3 mb-4" onSubmit={bookForm.handleSubmit(onSubmit)} noValidate>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label fw-semibold" htmlFor="title">Tên sách</label>
          <input id="title" className={`form-control ${errors.title ? 'is-invalid' : ''}`} disabled={isSaving} {...bookForm.register('title')} />
          <div className="invalid-feedback">{errors.title?.message}</div>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold" htmlFor="author">Tác giả</label>
          <input id="author" className={`form-control ${errors.author ? 'is-invalid' : ''}`} disabled={isSaving} {...bookForm.register('author')} />
          <div className="invalid-feedback">{errors.author?.message}</div>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-semibold" htmlFor="categoryId">Thể loại</label>
          <select id="categoryId" className={`form-select ${errors.categoryId ? 'is-invalid' : ''}`} disabled={isSaving} {...bookForm.register('categoryId')}>
            <option value="">Chọn thể loại</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <div className="invalid-feedback">{errors.categoryId?.message}</div>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold" htmlFor="totalCopies">Tổng bản</label>
          <input id="totalCopies" type="number" min="1" className={`form-control ${errors.totalCopies ? 'is-invalid' : ''}`} disabled={isSaving} {...bookForm.register('totalCopies')} />
          <div className="invalid-feedback">{errors.totalCopies?.message}</div>
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
          <label className="form-label fw-semibold" htmlFor="damagedCopies">Hỏng</label>
          <input id="damagedCopies" type="number" min="0" className={`form-control ${errors.damagedCopies ? 'is-invalid' : ''}`} disabled={isSaving} {...bookForm.register('damagedCopies')} />
          <div className="invalid-feedback">{errors.damagedCopies?.message}</div>
        </div>
        <div className="col-md-2">
          <label className="form-label fw-semibold" htmlFor="lostCopies">Mất</label>
          <input id="lostCopies" type="number" min="0" className={`form-control ${errors.lostCopies ? 'is-invalid' : ''}`} disabled={isSaving} {...bookForm.register('lostCopies')} />
          <div className="invalid-feedback">{errors.lostCopies?.message}</div>
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold" htmlFor="coverImage">Ảnh bìa URL</label>
          <input id="coverImage" className="form-control" disabled={isSaving} {...bookForm.register('coverImage')} />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold" htmlFor="description">Mô tả</label>
          <textarea id="description" className="form-control" rows="2" disabled={isSaving} {...bookForm.register('description')} />
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary" disabled={isSaving} type="submit">
            {isSaving ? 'Đang lưu...' : editingId ? 'Cập nhật sách' : 'Thêm sách'}
          </button>
          {editingId && <button className="btn btn-outline-secondary" disabled={isSaving} type="button" onClick={onCancel}>Hủy sửa</button>}
        </div>
      </div>
    </form>
  );
}
