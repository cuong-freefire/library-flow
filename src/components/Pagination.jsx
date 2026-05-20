import { useEffect, useMemo, useState } from 'react';

export function usePagination(items, { pageSize = 8, resetKey = '' } = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [resetKey]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  return {
    currentPage,
    pageItems,
    pageSize,
    setCurrentPage,
    totalItems,
    totalPages,
  };
}

export function PaginationControls({ currentPage, setCurrentPage, totalItems, totalPages }) {
  if (!totalItems || totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination-bar">
      <nav aria-label="Phân trang">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" type="button" onClick={() => setCurrentPage(currentPage - 1)}>
              Trước
            </button>
          </li>
          {pages.map((page) => (
            <li className={`page-item ${page === currentPage ? 'active' : ''}`} key={page}>
              <button className="page-link" type="button" onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" type="button" onClick={() => setCurrentPage(currentPage + 1)}>
              Sau
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
