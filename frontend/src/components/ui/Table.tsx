import type { TableColumn } from '../../types';
import { ArrowUpDown } from 'lucide-react';
import './Table.css';

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  emptyMessage?: string;
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  onSort,
  sortKey,
  sortDirection,
  emptyMessage = 'No records found',
  isLoading = false,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="fic-table-container">
      <table className="fic-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={String(col.key) || idx}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && onSort && onSort(String(col.key))}
              >
                <div className="fic-table__th-content">
                  <span>{col.header}</span>
                  {col.sortable && (
                    <ArrowUpDown
                      size={14}
                      className={`fic-table__sort-icon ${
                        sortKey === String(col.key) ? `active ${sortDirection}` : ''
                      }`}
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="fic-table__loading-cell">
                <div className="fic-table__spinner animate-spin" />
                <span>Loading data...</span>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="fic-table__empty-cell">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick && onRowClick(item)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((col, idx) => (
                  <td key={String(col.key) || idx}>
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[String(col.key)] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
