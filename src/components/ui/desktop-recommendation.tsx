import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';

interface DesktopRecommendationProps {
  title?: string;
  description?: string;
  showSimplified?: boolean;
  onViewSimplified?: () => void;
  children?: React.ReactNode;
}

export const DesktopRecommendation: React.FC<DesktopRecommendationProps> = ({
  title = "Better on Desktop",
  description = "This view is optimized for desktop. For the best experience, we recommend viewing this on a larger screen.",
  showSimplified = false,
  onViewSimplified,
  children
}) => {
  return (
    <div className="space-y-4">
      <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Monitor className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-medium text-amber-900 dark:text-amber-100">{title}</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">{description}</p>
              {showSimplified && onViewSimplified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewSimplified}
                  className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  View Mobile Version
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {children}
    </div>
  );
};