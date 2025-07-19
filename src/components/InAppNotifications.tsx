
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Bell, X, CheckCircle, AlertTriangle, Info, Clock, 
  BrainCircuit, Calendar, Users, Target
} from 'lucide-react';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
import { useProjectInsights } from '@/hooks/useProjectInsights';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'ai_insight' | 'deadline' | 'task_update' | 'resource_alert' | 'system' | 'milestone';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  projectName?: string;
  resourceId?: string;
  resourceName?: string;
  actionRequired?: boolean;
}

const InAppNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  
  const { insights, isLoading } = useProjectInsights();
  const { status, lastEvent } = useRealTimeEvents([
    'task_completed',
    'deadline_approaching',
    'resource_assigned',
    'project_updated',
    'performance_alert'
  ]);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('app-notifications');
    if (stored) {
      const parsed = JSON.parse(stored).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(parsed);
    }
  }, []);

  // Save notifications to localStorage
  const saveNotifications = (newNotifications: Notification[]) => {
    localStorage.setItem('app-notifications', JSON.stringify(newNotifications));
    setNotifications(newNotifications);
  };

  // Generate AI insight notifications
  useEffect(() => {
    if (!insights || insights.length === 0) return;

    const aiNotifications: Notification[] = insights
      .filter(insight => insight.actionable)
      .slice(0, 3) // Limit to top 3 insights
      .map(insight => ({
        id: `ai-${insight.id}`,
        type: 'ai_insight' as const,
        title: 'AI Recommendation',
        message: insight.description,
        timestamp: new Date(),
        read: false,
        priority: insight.type === 'error' ? 'critical' : 
                 insight.type === 'warning' ? 'high' : 'medium',
        projectId: insight.projectId,
        actionRequired: insight.actionable
      }));

    // Only add new AI notifications
    const existingAIIds = notifications
      .filter(n => n.type === 'ai_insight')
      .map(n => n.id);
    
    const newAINotifications = aiNotifications.filter(n => !existingAIIds.includes(n.id));
    
    if (newAINotifications.length > 0) {
      saveNotifications([...newAINotifications, ...notifications].slice(0, 50));
    }
  }, [insights]);

  // Handle real-time events
  useEffect(() => {
    if (!lastEvent) return;

    let notification: Notification | null = null;

    switch (lastEvent.type) {
      case 'task_completed':
        notification = {
          id: `task-${Date.now()}`,
          type: 'task_update',
          title: 'Task Completed',
          message: `${lastEvent.payload.taskName} has been completed by ${lastEvent.payload.resourceName}`,
          timestamp: lastEvent.timestamp,
          read: false,
          priority: 'medium',
          projectId: lastEvent.payload.projectId,
          projectName: lastEvent.payload.projectName,
          resourceId: lastEvent.payload.resourceId,
          resourceName: lastEvent.payload.resourceName
        };
        break;

      case 'deadline_approaching':
        notification = {
          id: `deadline-${Date.now()}`,
          type: 'deadline',
          title: 'Deadline Approaching',
          message: `${lastEvent.payload.taskName} is due in ${lastEvent.payload.daysRemaining} days`,
          timestamp: lastEvent.timestamp,
          read: false,
          priority: lastEvent.payload.daysRemaining <= 1 ? 'critical' : 'high',
          projectId: lastEvent.payload.projectId,
          projectName: lastEvent.payload.projectName,
          actionRequired: true
        };
        break;

      case 'resource_assigned':
        notification = {
          id: `resource-${Date.now()}`,
          type: 'resource_alert',
          title: 'Resource Assigned',
          message: `${lastEvent.payload.resourceName} has been assigned to ${lastEvent.payload.taskName}`,
          timestamp: lastEvent.timestamp,
          read: false,
          priority: 'low',
          projectId: lastEvent.payload.projectId,
          projectName: lastEvent.payload.projectName,
          resourceId: lastEvent.payload.resourceId,
          resourceName: lastEvent.payload.resourceName
        };
        break;

      case 'performance_alert':
        notification = {
          id: `perf-${Date.now()}`,
          type: 'resource_alert',
          title: 'Performance Alert',
          message: `${lastEvent.payload.resourceName} performance requires attention`,
          timestamp: lastEvent.timestamp,
          read: false,
          priority: lastEvent.payload.riskLevel === 'critical' ? 'critical' : 'high',
          resourceId: lastEvent.payload.resourceId,
          resourceName: lastEvent.payload.resourceName,
          actionRequired: true
        };
        break;
    }

    if (notification) {
      saveNotifications([notification, ...notifications].slice(0, 50));
    }
  }, [lastEvent]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ai_insight': return <BrainCircuit className="h-4 w-4" />;
      case 'deadline': return <Clock className="h-4 w-4" />;
      case 'task_update': return <CheckCircle className="h-4 w-4" />;
      case 'resource_alert': return <Users className="h-4 w-4" />;
      case 'milestone': return <Target className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    saveNotifications(updated);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="secondary">{unreadCount} unread</Badge>
              )}
            </DialogTitle>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'ai_insight', label: 'AI Insights', count: notifications.filter(n => n.type === 'ai_insight').length },
            { key: 'deadline', label: 'Deadlines', count: notifications.filter(n => n.type === 'deadline').length },
          ].map(tab => (
            <Button
              key={tab.key}
              variant={filter === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(tab.key)}
              className="flex items-center gap-1"
            >
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No notifications to display</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg ${
                    !notification.read ? 'bg-muted/50' : ''
                  } ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 ${getPriorityColor(notification.priority)} p-1 rounded`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                          {notification.actionRequired && (
                            <Badge variant="outline" className="text-xs">
                              Action Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm opacity-90 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-2 text-xs opacity-70">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(notification.timestamp, { addSuffix: true })}</span>
                          {notification.projectName && (
                            <>
                              <span>•</span>
                              <span>{notification.projectName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Connection Status */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{status.isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          {status.lastHeartbeat && (
            <span>Last sync: {formatDistanceToNow(status.lastHeartbeat, { addSuffix: true })}</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InAppNotifications;
