
import React, { useState, useCallback, useRef } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table';

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

  // Helper function to safely check if element is a React element with props
  const isReactElementWithProps = (child: any): child is React.ReactElement<any> => {
    return React.isValidElement(child) && typeof child.props === 'object' && child.props !== null;
  };

  // Generate CSS custom properties for column widths
  const getTableStyle = () => {
    const customProperties: { [key: string]: string } = {};
    Object.entries(columnWidths).forEach(([index, width]) => {
      customProperties[`--col-${index}-width`] = `${width}px`;
    });
    return customProperties;
  };

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
      <Table 
        ref={tableRef} 
        className={`${getDensityClasses()} ${className}`}
        style={{ 
          tableLayout: 'fixed',
          ...getTableStyle()
        }}
      >
        {React.Children.map(children, (child) => {
          if (!isReactElementWithProps(child)) return child;

          // Handle TableHeader
          if (child.type === TableHeader) {
            return React.cloneElement(child, {
              children: React.Children.map(child.props.children, (headerRow) => {
                if (!isReactElementWithProps(headerRow) || headerRow.type !== TableRow) return headerRow;
                
                return React.cloneElement(headerRow, {
                  children: React.Children.map(headerRow.props.children, (headerCell, cellIndex) => {
                    if (!isReactElementWithProps(headerCell) || headerCell.type !== TableHead) return headerCell;
                    
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
                          className="absolute right-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-primary/20 transition-colors z-10"
                          onMouseDown={(e) => handleMouseDown(cellIndex, e)}
                        />
                      </TableHead>
                    );
                  })
                });
              })
            });
          }

          // Handle TableBody
          if (child.type === TableBody) {
            return React.cloneElement(child, {
              children: React.Children.map(child.props.children, (bodyRow) => {
                if (!isReactElementWithProps(bodyRow) || bodyRow.type !== TableRow) return bodyRow;
                
                return React.cloneElement(bodyRow, {
                  children: React.Children.map(bodyRow.props.children, (bodyCell, cellIndex) => {
                    if (!isReactElementWithProps(bodyCell)) return bodyCell;
                    
                    // Handle both TableCell and custom td elements
                    if (bodyCell.type === TableCell || bodyCell.type === 'td') {
                      return React.cloneElement(bodyCell, {
                        style: {
                          ...bodyCell.props.style,
                          width: columnWidths[cellIndex] || 'auto',
                          minWidth: '80px',
                          maxWidth: '400px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        },
                        className: `${bodyCell.props.className || ''} border-r border-border last:border-r-0`
                      });
                    }
                    
                    return bodyCell;
                  })
                });
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
