import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatsCardSkeletonProps {
  count?: number;
  variant?: 'default' | 'compact';
}

export const StatsCardSkeleton: React.FC<StatsCardSkeletonProps> = ({ 
  count = 4, 
  variant = 'default' 
}) => {
  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="animate-pulse h-24 md:h-auto">
            <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
              <div className="flex items-center justify-between space-y-0 pb-1 md:pb-2">
                <Skeleton className="h-3 md:h-4 w-20 md:w-24" />
                <Skeleton className="h-3 md:h-4 w-3 md:w-4 rounded-sm" />
              </div>
              <Skeleton className="h-6 md:h-8 w-12 md:w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-sm" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};