
import React from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Table, TableBody, TableHeader } from '@/components/ui/table';

interface ResizableTableProps {
  header: React.ReactNode;
  children: React.ReactNode;
  zoom: number;
  density: 'compact' | 'comfortable' | 'spacious';
}

const ResizableTable: React.FC<ResizableTableProps> = ({
  header,
  children,
  zoom,
  density
}) => {
  const getDensityClasses = () => {
    switch (density) {
      case 'compact':
        return 'text-sm [&_td]:py-1 [&_th]:py-1';
      case 'spacious':
        return 'text-base [&_td]:py-6 [&_th]:py-6';
      default:
        return 'text-sm [&_td]:py-4 [&_th]:py-4';
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-[400px]">
      <ResizablePanel defaultSize={100} minSize={50}>
        <div
          className="h-full overflow-auto"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
        >
          <Table className={`w-full ${getDensityClasses()}`}>
            <TableHeader>
              {header}
            </TableHeader>
            <TableBody>
              {children}
            </TableBody>
          </Table>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default ResizableTable;
