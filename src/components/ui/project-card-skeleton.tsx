import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectCardSkeletonProps {
  count?: number;
}

export const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-pulse min-h-[120px]">
          <CardHeader className="p-4 md:p-6 pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 md:h-6 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
            </div>
            <Skeleton className="h-8 md:h-10 w-full mt-2" />
          </CardHeader>

          <CardContent className="p-4 md:p-6 pt-0 space-y-3 md:space-y-4">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 md:h-4 md:w-4 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 md:h-4 md:w-4 rounded-full" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 md:h-4 md:w-4 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>

            {/* Health Indicator */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row gap-2 pt-2">
              <Skeleton className="h-10 md:h-9 flex-1" />
              <Skeleton className="h-10 md:h-9 flex-1" />
              <Skeleton className="h-10 md:h-9 md:w-12" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};