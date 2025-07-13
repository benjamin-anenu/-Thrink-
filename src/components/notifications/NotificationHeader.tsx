
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

interface NotificationHeaderProps {
  unreadCount: number;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({ unreadCount }) => {
  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6" />
            <div>
              <CardTitle className="text-2xl font-bold">Notification Center</CardTitle>
              <CardDescription>
                Stay updated with project activities and team communications
              </CardDescription>
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount} unread
            </Badge>
          )}
        </div>
      </CardHeader>
    </Card>
  );
};
