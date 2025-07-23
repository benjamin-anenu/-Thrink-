
import React from 'react';
import { DarkModeCard, DarkModeCardHeader } from '@/components/ui/dark-mode-card';
import { DarkModeBadge } from '@/components/ui/dark-mode-badge';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

interface NotificationHeaderProps {
  unreadCount: number;
}

export const NotificationHeader: React.FC<NotificationHeaderProps> = ({ unreadCount }) => {
  return (
    <DarkModeCard variant="elevated">
      <DarkModeCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-blue-400" />
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">Notification Center</CardTitle>
              <CardDescription className="text-zinc-400">
                Stay updated with project activities and team communications
              </CardDescription>
            </div>
          </div>
          {unreadCount > 0 && (
            <DarkModeBadge variant="error" compact>
              {unreadCount} unread
            </DarkModeBadge>
          )}
        </div>
      </DarkModeCardHeader>
    </DarkModeCard>
  );
};
