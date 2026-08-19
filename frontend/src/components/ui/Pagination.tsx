import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPaginationRange } from '../../utils/pagination';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const pages = getPaginationRange(currentPage, totalPages);

  return (
    <div className="fic-pagination">
      <div className="fic-pagination__info">
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
      </div>
      <div className="fic-pagination__controls">
        <button
          className="fic-pagination__btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="fic-pagination__ellipsis">
              ...
            </span>
          ) : (
            <button
              key={`page-${p}`}
              className={`fic-pagination__page ${currentPage === p ? 'active' : ''}`}
              onClick={() => onPageChange(Number(p))}
            >
              {p}
            </button>
          )
        )}

        <button
          className="fic-pagination__btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
