import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardCardSkeletonProps {
  variant?: 'stats' | 'chart' | 'list' | 'grid';
  count?: number;
}

export const DashboardCardSkeleton: React.FC<DashboardCardSkeletonProps> = ({ 
  variant = 'stats', 
  count = 4 
}) => {
  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="animate-pulse min-h-[100px] md:min-h-[80px]">
            <CardHeader className="p-3 md:p-6 pb-1">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 md:h-4 w-16 md:w-20" />
                <Skeleton className="h-4 md:h-5 w-4 md:w-5 rounded-sm" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <Skeleton className="h-6 md:h-8 w-12 md:w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <Card className="animate-pulse">
        <CardHeader className="p-4 md:p-6">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (variant === 'list') {
    return (
      <Card className="animate-pulse">
        <CardHeader className="p-3 md:p-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 md:h-5 w-4 md:w-5 rounded-sm" />
            <Skeleton className="h-5 md:h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2 p-2 rounded-lg">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="p-3 md:p-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 md:h-5 w-4 md:w-5 rounded-sm" />
                <Skeleton className="h-5 md:h-6 w-32" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2 p-2 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return null;
};