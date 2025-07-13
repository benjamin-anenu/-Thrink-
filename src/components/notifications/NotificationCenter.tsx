
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Calendar, 
  Users, 
  Settings,
  Search,
  Filter,
  Archive
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'project' | 'deadline' | 'team' | 'system';
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  projectId?: string;
  projectName?: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Project Deadline Approaching',
      message: 'E-commerce Platform project deadline is in 3 days',
      type: 'warning',
      category: 'deadline',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false,
      priority: 'high',
      projectId: 'proj-1',
      projectName: 'E-commerce Platform'
    },
    {
      id: '2',
      title: 'New Team Member Added',
      message: 'Sarah Johnson has been added to the Marketing team',
      type: 'info',
      category: 'team',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      read: false,
      priority: 'medium'
    },
    {
      id: '3',
      title: 'Task Completed',
      message: 'UI Design Review has been marked as completed',
      type: 'success',
      category: 'project',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: true,
      priority: 'low',
      projectId: 'proj-2',
      projectName: 'Mobile App Redesign'
    }
  ]);

  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    slack: false,
    deadlines: true,
    teamUpdates: true,
    projectMilestones: true,
    systemAlerts: false
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-error" />;
      default: return <Info className="h-4 w-4 text-info" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-error text-error-foreground';
      case 'high': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deadline': return <Calendar className="h-4 w-4" />;
      case 'team': return <Users className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
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
    const matchesFilter = filter === 'all' || 
                         (filter === 'unread' && !notif.read) ||
                         (filter === 'read' && notif.read) ||
                         notif.category === filter;
    
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Filters and Search */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {['all', 'unread', 'read', 'project', 'deadline', 'team', 'system'].map(filterType => (
                      <Button
                        key={filterType}
                        variant={filter === filterType ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilter(filterType)}
                        className="capitalize"
                      >
                        {filterType}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                  disabled={unreadCount === 0}
                >
                  Mark All Read
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No notifications found</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-surface-hover transition-colors ${
                        !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-medium text-sm ${!notification.read ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                {notification.priority}
                              </Badge>
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
                              {getCategoryIcon(notification.category)}
                              <span className="text-xs text-muted-foreground capitalize">
                                {notification.category}
                              </span>
                              {notification.projectName && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    {notification.projectName}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <Button
                                  onClick={() => markAsRead(notification.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                >
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                onClick={() => deleteNotification(notification.id)}
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-error"
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.email}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, email: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.push}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, push: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="slack-notifications">Slack Integration</Label>
                    <Switch
                      id="slack-notifications"
                      checked={notificationSettings.slack}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, slack: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="deadline-notifications">Project Deadlines</Label>
                    <Switch
                      id="deadline-notifications"
                      checked={notificationSettings.deadlines}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, deadlines: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="team-notifications">Team Updates</Label>
                    <Switch
                      id="team-notifications"
                      checked={notificationSettings.teamUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, teamUpdates: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="milestone-notifications">Project Milestones</Label>
                    <Switch
                      id="milestone-notifications"
                      checked={notificationSettings.projectMilestones}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, projectMilestones: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system-notifications">System Alerts</Label>
                    <Switch
                      id="system-notifications"
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
