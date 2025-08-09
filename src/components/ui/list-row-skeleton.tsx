import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ListRowSkeletonProps {
  count?: number;
  showActions?: boolean;
}

export const ListRowSkeleton: React.FC<ListRowSkeletonProps> = ({ 
  count = 5, 
  showActions = true 
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="animate-pulse border border-border rounded-lg p-4 bg-card"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Main Content */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-48" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              
              <Skeleton className="h-4 w-3/4" />
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex flex-col lg:flex-row gap-2 lg:flex-shrink-0">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-9" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};