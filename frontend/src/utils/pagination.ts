import type { PaginatedResult } from '../types';

/**
 * Client-side helper to paginate an array of items
 */
export function paginateArray<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): PaginatedResult<T> {
  const currentPage = Math.max(1, page);
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const data = items.slice(startIndex, endIndex);

  return {
    data,
    total,
    page: currentPage,
    pageSize,
    totalPages,
  };
}

/**
 * Filter items by multi-field search term
 */
export function filterData<T>(
  items: T[],
  searchTerm: string,
  searchKeys: (keyof T | string)[]
): T[] {
  if (!searchTerm.trim()) return items;

  const term = searchTerm.toLowerCase().trim();

  return items.filter((item) => {
    return searchKeys.some((key) => {
      const val = (item as Record<string, unknown>)[key as string];
      if (val === undefined || val === null) return false;
      return String(val).toLowerCase().includes(term);
    });
  });
}

/**
 * Sort items array by key and direction
 */
export function sortData<T>(
  items: T[],
  key: keyof T | string,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const valA = (a as Record<string, unknown>)[key as string];
    const valB = (b as Record<string, unknown>)[key as string];

    if (valA === valB) return 0;
    if (valA === undefined || valA === null) return 1;
    if (valB === undefined || valB === null) return -1;

    let comparison = 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      comparison = valA - valB;
    } else {
      comparison = String(valA).localeCompare(String(valB));
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Generate pagination page numbers range with ellipsis support
 */
export function getPaginationRange(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
}
