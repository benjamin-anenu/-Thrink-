
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationHeader } from './NotificationHeader';
import { NotificationFilters } from './NotificationFilters';
// Fixed import to use default export
import NotificationList from './NotificationList';
import { NotificationSettings } from './NotificationSettings';
import BlackoutPeriodsManager from './BlackoutPeriodsManager';
import { NotificationIntegrationService, ProjectNotification } from '@/services/NotificationIntegrationService';

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<ProjectNotification[]>([]);
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

  const notificationService = NotificationIntegrationService.getInstance();

  useEffect(() => {
    // Load initial notifications
    setNotifications(notificationService.getNotifications());

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    return unsubscribe;
  }, []);

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const deleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
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

  // Convert ProjectNotification to the expected interface for NotificationList
  const convertedNotifications = filteredNotifications.map(notif => ({
    id: notif.id,
    title: notif.title,
    message: notif.message,
    type: notif.type,
    category: notif.category,
    timestamp: notif.timestamp,
    read: notif.read,
    priority: notif.priority,
    projectId: notif.projectId,
    projectName: notif.projectName
  }));

  return (
    <div className="space-y-6">
      <NotificationHeader unreadCount={unreadCount} />

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications" className="text-xs md:text-sm">Notifications</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs md:text-sm">Settings</TabsTrigger>
          <TabsTrigger value="blackout" className="text-xs md:text-sm">Blackout</TabsTrigger>
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
            notifications={convertedNotifications}
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
