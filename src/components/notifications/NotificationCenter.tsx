
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationHeader } from './NotificationHeader';
import { NotificationFilters } from './NotificationFilters';
import { NotificationList } from './NotificationList';
import { NotificationSettings } from './NotificationSettings';
import BlackoutPeriodsManager from './BlackoutPeriodsManager';

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

  const handleSettingChange = (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [key]: value }));
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

  return (
    <div className="space-y-6">
      <NotificationHeader unreadCount={unreadCount} />

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="blackout">Blackout Periods</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filter={filter}
            onFilterChange={setFilter}
            unreadCount={unreadCount}
            onMarkAllAsRead={markAllAsRead}
          />

          <NotificationList
            notifications={filteredNotifications}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <NotificationSettings
            settings={notificationSettings}
            onSettingChange={handleSettingChange}
          />
        </TabsContent>

        <TabsContent value="blackout" className="space-y-6">
          <BlackoutPeriodsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;
