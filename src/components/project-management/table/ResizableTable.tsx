
import React, { useState, useCallback, useRef } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ResizableTableProps {
  children: React.ReactNode;
  zoomLevel: number;
  tableDensity: 'compact' | 'normal' | 'comfortable';
  className?: string;
}

const ResizableTable: React.FC<ResizableTableProps> = ({
  children,
  zoomLevel,
  tableDensity,
  className = ""
}) => {
  const [columnWidths, setColumnWidths] = useState<{ [key: number]: number }>({});
  const tableRef = useRef<HTMLTableElement>(null);

  const getDensityClasses = () => {
    switch (tableDensity) {
      case 'compact':
        return '[&_td]:py-1 [&_th]:py-1 [&_td]:px-2 [&_th]:px-2 text-sm';
      case 'comfortable':
        return '[&_td]:py-4 [&_th]:py-4 [&_td]:px-6 [&_th]:px-6';
      default:
        return '[&_td]:py-2 [&_th]:py-2 [&_td]:px-4 [&_th]:px-4';
    }
  };

  const handleMouseDown = useCallback((columnIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = columnWidths[columnIndex] || 150;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(80, startWidth + (e.clientX - startX));
      setColumnWidths(prev => ({ ...prev, [columnIndex]: newWidth }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [columnWidths]);

  return (
    <div 
      className="relative overflow-auto border rounded-lg"
      style={{ 
        transform: `scale(${zoomLevel})`,
        transformOrigin: 'top left',
        width: `${100 / zoomLevel}%`,
        height: `${100 / zoomLevel}%`,
      }}
    >
      <Table ref={tableRef} className={`${getDensityClasses()} ${className}`}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === TableHeader) {
            return React.cloneElement(child, {
              children: React.Children.map(child.props.children, (headerRow) => {
                if (React.isValidElement(headerRow) && headerRow.type === TableRow) {
                  return React.cloneElement(headerRow, {
                    children: React.Children.map(headerRow.props.children, (headerCell, cellIndex) => {
                      if (React.isValidElement(headerCell) && headerCell.type === TableHead) {
                        return (
                          <TableHead
                            key={cellIndex}
                            className="relative border-r border-border last:border-r-0"
                            style={{ 
                              width: columnWidths[cellIndex] || 'auto',
                              minWidth: '80px',
                              maxWidth: '400px'
                            }}
                          >
                            {headerCell.props.children}
                            <div
                              className="absolute right-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-primary/20 transition-colors"
                              onMouseDown={(e) => handleMouseDown(cellIndex, e)}
                            />
                          </TableHead>
                        );
                      }
                      return headerCell;
                    })
                  });
                }
                return headerRow;
              })
            });
          }
          return child;
        })}
      </Table>
    </div>
  );
};

export default ResizableTable;
