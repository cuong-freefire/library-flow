import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { BookFilters } from './books/BookFilters';
import { BookForm } from './books/BookForm';
import { BookTable } from './books/BookTable';
import { useAdminBooks } from './books/useAdminBooks';

export function AdminBooksPage() {
  // Page chỉ điều phối dữ liệu từ hook xuống các component con: form, filter và table.
  const adminBooks = useAdminBooks();
  const {
    categories,
    editingId,
    error,
    filteredBooks,
    filters,
    form,
    getAvailableCount,
    getBorrowedCount,
    getPendingCount,
    isSaving,
    loading,
    pagination,
    processingBookId,
    query,
    resetForm,
    setFilters,
    setQuery,
    submitBook,
    editBook,
    removeBook,
    restoreBook,
  } = adminBooks;

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Quản lý sách" description="Thêm, sửa, ẩn hoặc hiện lại sách trong danh mục." />
      {error && <ErrorState message={error} />}
      <BookForm
        categories={categories}
        editingId={editingId}
        form={form}
        getBorrowedCount={getBorrowedCount}
        getPendingCount={getPendingCount}
        isSaving={isSaving}
        onCancel={resetForm}
        onSubmit={submitBook}
      />
      <BookFilters
        categories={categories}
        filters={filters}
        onFiltersChange={setFilters}
        onQueryChange={setQuery}
        query={query}
      />
      {filteredBooks.length === 0 ? <EmptyState title="Không có sách" description="Thêm sách mới hoặc đổi từ khóa tìm kiếm." /> : (
        <BookTable
          categories={categories}
          getAvailableCount={getAvailableCount}
          getBorrowedCount={getBorrowedCount}
          getPendingCount={getPendingCount}
          onEdit={editBook}
          onRemove={removeBook}
          onRestore={restoreBook}
          pagination={pagination}
          processingBookId={processingBookId}
        />
      )}
    </>
  );
}
