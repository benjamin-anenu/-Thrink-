
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface GanttTableHeaderProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
}

const GanttTableHeader: React.FC<GanttTableHeaderProps> = ({
  sortBy,
  sortDirection,
  onSort
}) => {
  const getSortIcon = (column: string) => {
    if (sortBy === column) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  return (
    <TableHeader className="table-header">
      <TableRow>
        <TableHead className="cursor-pointer table-cell" onClick={() => onSort('name')}>
          Task Name {getSortIcon('name')}
        </TableHead>
        <TableHead className="cursor-pointer table-cell" onClick={() => onSort('status')}>
          Status {getSortIcon('status')}
        </TableHead>
        <TableHead className="cursor-pointer table-cell" onClick={() => onSort('priority')}>
          Priority {getSortIcon('priority')}
        </TableHead>
        <TableHead className="table-cell">Assigned Resources</TableHead>
        <TableHead className="cursor-pointer table-cell" onClick={() => onSort('startDate')}>
          Start Date {getSortIcon('startDate')}
        </TableHead>
        <TableHead className="cursor-pointer table-cell" onClick={() => onSort('endDate')}>
          End Date {getSortIcon('endDate')}
        </TableHead>
        <TableHead className="cursor-pointer table-cell" onClick={() => onSort('duration')}>
          Duration {getSortIcon('duration')}
        </TableHead>
        <TableHead className="cursor-pointer table-cell" onClick={() => onSort('progress')}>
          Progress {getSortIcon('progress')}
        </TableHead>
        <TableHead className="table-cell">Dependencies</TableHead>
        <TableHead className="table-cell">Milestone</TableHead>
        <TableHead className="table-cell">Variance</TableHead>
        <TableHead className="table-cell">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default GanttTableHeader;
