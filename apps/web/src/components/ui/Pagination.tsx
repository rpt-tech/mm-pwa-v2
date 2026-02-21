interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  // Show at most 7 page buttons with ellipsis
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:border-[#0272BA] hover:text-[#0272BA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        ‹ Trước
      </button>
      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-gray-400">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`w-9 h-9 text-sm border rounded transition-colors ${
              page === currentPage
                ? 'bg-[#0272BA] text-white border-[#0272BA]'
                : 'border-gray-300 hover:border-[#0272BA] hover:text-[#0272BA]'
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:border-[#0272BA] hover:text-[#0272BA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Sau ›
      </button>
    </div>
  );
};

export default Pagination;
