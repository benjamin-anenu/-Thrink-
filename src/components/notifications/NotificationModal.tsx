import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { DarkModeBadge } from '@/components/ui/dark-mode-badge';
import NotificationCenter from './NotificationCenter';
import { NotificationIntegrationService } from '@/services/NotificationIntegrationService';
import { cn } from '@/lib/utils';

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b border-border/50 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>Notification Center</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <NotificationCenter />
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  
  const notificationService = NotificationIntegrationService.getInstance();

  useEffect(() => {
    // Get initial count
    const notifications = notificationService.getNotifications();
    setUnreadCount(notifications.filter(notif => !notif.read).length);

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setUnreadCount(updatedNotifications.filter(notif => !notif.read).length);
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setModalOpen(true)}
        className={cn(
          "relative p-2 hover:bg-muted/50 transition-colors",
          className
        )}
      >
        <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <DarkModeBadge 
            variant="error" 
            compact
            className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center p-0 min-w-[20px]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </DarkModeBadge>
        )}
      </Button>

      <NotificationModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
};