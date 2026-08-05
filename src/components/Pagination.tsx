import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (size: number) => void;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems,
}) => {
  if (totalPages <= 1) return null;

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePageSelect = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-emerald-100 mt-8">
      {/* Count Info */}
      <div className="text-xs font-semibold text-slate-600">
        Showing Page <span className="text-emerald-950 font-bold">{currentPage}</span> of{' '}
        <span className="text-emerald-950 font-bold">{totalPages}</span> ({totalItems} total graduates)
      </div>

      {/* Page Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handlePageSelect(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={idx}
              onClick={() => handlePageSelect(p)}
              className={`w-9 h-9 rounded-lg text-xs font-bold transition ${
                currentPage === p
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-white border border-emerald-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-1 text-slate-400 text-xs font-bold">
              ...
            </span>
          )
        )}

        <button
          onClick={() => handlePageSelect(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-emerald-200 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-950 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-sm"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Items Per Page */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <span>Per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          className="bg-white border border-emerald-200 rounded-lg px-2 py-1 text-xs text-emerald-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm"
        >
          <option value={20}>20</option>
          <option value={40}>40</option>
          <option value={80}>80</option>
        </select>
      </div>
    </div>
  );
};
