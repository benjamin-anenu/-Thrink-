
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell, BellOff, Settings, Trash2, MarkAsRead, Filter,
  AlertTriangle, Info, CheckCircle, Clock, Users, Target
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'project' | 'task' | 'team' | 'system' | 'deadline';
  timestamp: Date;
  read: boolean;
  actionRequired?: boolean;
  projectId?: string;
  taskId?: string;
  userId?: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    // Simulate loading notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Project Milestone Overdue',
        message: 'E-commerce Platform milestone "Design Review" is 2 days overdue.',
        type: 'error',
        priority: 'high',
        category: 'project',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        actionRequired: true,
        projectId: 'proj-1'
      },
      {
        id: '2',
        title: 'New Task Assignment',
        message: 'You have been assigned to "Update User Dashboard" task.',
        type: 'info',
        priority: 'medium',
        category: 'task',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        read: false,
        taskId: 'task-1'
      },
      {
        id: '3',
        title: 'Team Member Added',
        message: 'Sarah Johnson has joined Project Alpha team.',
        type: 'success',
        priority: 'low',
        category: 'team',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        read: true,
        userId: 'user-1'
      },
      {
        id: '4',
        title: 'Budget Alert',
        message: 'Project Beta has exceeded 85% of allocated budget.',
        type: 'warning',
        priority: 'high',
        category: 'project',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        read: false,
        actionRequired: true,
        projectId: 'proj-2'
      },
      {
        id: '5',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight from 2-4 AM.',
        type: 'info',
        priority: 'medium',
        category: 'system',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        read: true
      }
    ];
    
    setNotifications(mockNotifications);
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project': return Target;
      case 'task': return CheckCircle;
      case 'team': return Users;
      case 'deadline': return Clock;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const getTypeVariant = (type: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (priority) {
      case 'critical':
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    const categoryMatch = selectedCategory === 'all' || notif.category === selectedCategory;
    const readMatch = !showUnreadOnly || !notif.read;
    return categoryMatch && readMatch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const categories = ['all', 'project', 'task', 'team', 'deadline', 'system'];

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-surface border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Notifications</CardTitle>
                <CardDescription>
                  Stay updated with your project activities
                </CardDescription>
              </div>
              {unreadCount > 0 && (
                <StatusBadge variant="error">
                  {unreadCount} unread
                </StatusBadge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showUnreadOnly ? 'Show All' : 'Unread Only'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <MarkAsRead className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const CategoryIcon = getCategoryIcon(category);
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="flex items-center gap-2 capitalize"
            >
              <CategoryIcon className="h-4 w-4" />
              {category}
            </Button>
          );
        })}
      </div>

      {/* Notifications List */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-border">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {showUnreadOnly ? 'No unread notifications' : 'All caught up!'}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const TypeIcon = getTypeIcon(notification.type);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 transition-colors hover:bg-surface-hover ${
                        !notification.read ? 'bg-surface-muted' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border ${
                          notification.type === 'error' ? 'bg-error-muted border-error/20' :
                          notification.type === 'warning' ? 'bg-warning-muted border-warning/20' :
                          notification.type === 'success' ? 'bg-success-muted border-success/20' :
                          'bg-info-muted border-info/20'
                        }`}>
                          <TypeIcon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <StatusBadge variant={getPriorityVariant(notification.priority)}>
                                {notification.priority}
                              </StatusBadge>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <StatusBadge variant={getTypeVariant(notification.type)}>
                                {notification.type}
                              </StatusBadge>
                              <StatusBadge variant="default">
                                {notification.category}
                              </StatusBadge>
                              {notification.actionRequired && (
                                <StatusBadge variant="warning">
                                  Action Required
                                </StatusBadge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <MarkAsRead className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
