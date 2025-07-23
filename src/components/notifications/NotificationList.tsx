
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'project' | 'deadline' | 'team' | 'system' | 'performance' | 'escalation';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  projectName?: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onDelete,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project':
        return 'bg-blue-500';
      case 'deadline':
        return 'bg-red-500';
      case 'team':
        return 'bg-green-500';
      case 'system':
        return 'bg-gray-500';
      case 'performance':
        return 'bg-purple-500';
      case 'escalation':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">No notifications to display</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {notifications.map((notification) => (
          <Card key={notification.id} className={`${notification.read ? 'bg-muted/20' : 'bg-background'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-1 h-12 rounded-full ${getCategoryColor(notification.category)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(notification.type)}
                      <h3 className={`font-medium ${notification.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {notification.title}
                      </h3>
                      <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                        {notification.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="capitalize">
                        {notification.category}
                      </Badge>
                      {notification.projectName && (
                        <span>• {notification.projectName}</span>
                      )}
                      <span>• {formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkAsRead(notification.id)}
                      className="h-8 w-8 p-0"
                      title="Mark as read"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(notification.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NotificationList;
