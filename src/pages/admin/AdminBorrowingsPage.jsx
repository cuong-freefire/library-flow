import { EmptyState, ErrorState, LoadingState } from '../../components/AsyncState';
import { PageHeader } from '../../components/PageHeader';
import { BorrowingFilters } from './borrowings/BorrowingFilters';
import { BorrowingTable } from './borrowings/BorrowingTable';
import { useAdminBorrowings } from './borrowings/useAdminBorrowings';

export function AdminBorrowingsPage() {
  // Page giữ vai trò ghép màn hình; logic tải/lọc/xử lý phiếu nằm trong hook riêng.
  const adminBorrowings = useAdminBorrowings();
  const {
    books,
    changeStatus,
    clearDateFilter,
    dateField,
    dateFrom,
    dateTo,
    error,
    filteredBorrowings,
    getUser,
    loading,
    pagination,
    processingAction,
    query,
    setDateField,
    setDateFrom,
    setDateTo,
    setQuery,
    status,
    users,
    approve,
    reject,
    returnBook,
  } = adminBorrowings;

  if (loading) return <LoadingState />;

  return (
    <>
      <PageHeader eyebrow="Admin" title="Quản lý phiếu mượn" description="Duyệt, từ chối phiếu chờ duyệt và xác nhận trả sách." />
      {error && <ErrorState message={error} />}
      <BorrowingFilters
        dateField={dateField}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onClearDates={clearDateFilter}
        onDateFieldChange={setDateField}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onQueryChange={setQuery}
        onStatusChange={changeStatus}
        query={query}
        status={status}
      />
      {filteredBorrowings.length === 0 ? <EmptyState title="Không có phiếu mượn" description="Phiếu phù hợp bộ lọc sẽ xuất hiện tại đây." /> : (
        <BorrowingTable
          books={books}
          getUser={getUser}
          onApprove={approve}
          onReject={reject}
          onReturn={returnBook}
          pagination={pagination}
          processingAction={processingAction}
          users={users}
        />
      )}
    </>
  );
}
