
import React, { useState } from 'react';
import Header from '@/components/Header';
import MiloAssistant from '@/components/MiloAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';
import { simulateAIMonitoring } from '@/services/PerformanceTracker';
import { startEmailReminderService } from '@/services/EmailReminderService';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import AIInsightsCard from '@/components/analytics/AIInsightsCard';
import ReportsTab from '@/components/analytics/ReportsTab';
import CalendarTab from '@/components/analytics/CalendarTab';
import SettingsTab from '@/components/analytics/SettingsTab';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  type: 'call' | 'meeting' | 'deadline' | 'milestone' | 'review';
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  projectId: string;
  projectName: string;
}

const Analytics = () => {
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize AI services
  React.useEffect(() => {
    simulateAIMonitoring();
    startEmailReminderService();
  }, []);

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Sprint Planning',
      description: 'Plan next sprint activities',
      type: 'meeting',
      date: new Date(),
      startTime: '09:00',
      endTime: '10:30',
      location: 'Conference Room A',
      projectId: 'proj-1',
      projectName: 'E-commerce Platform'
    },
    {
      id: '2',
      title: 'UI Design Review',
      description: 'Review new UI mockups',
      type: 'review',
      date: new Date(Date.now() + 86400000),
      startTime: '14:00',
      endTime: '15:00',
      projectId: 'proj-2',
      projectName: 'Mobile App Redesign'
    },
    {
      id: '3',
      title: 'Project Deadline',
      description: 'Beta release deadline',
      type: 'deadline',
      date: new Date(Date.now() + 172800000),
      projectId: 'proj-1',
      projectName: 'E-commerce Platform'
    }
  ];

  const handleScheduleReport = (config: any) => {
    toast.success(`${config.type} report scheduled to run ${config.frequency}`);
  };

  const handleDownloadReport = (type: string, dateRange: any) => {
    toast.success(`Downloading ${type} report...`);
  };

  const handleSendReport = (type: string, dateRange: any) => {
    if (selectedRecipients.length === 0) {
      toast.error('Please select recipients first');
      return;
    }
    toast.success(`Sending ${type} report to ${selectedRecipients.length} recipients`);
  };

  const handleCreateEvent = (event: Omit<CalendarEvent, 'id'>) => {
    toast.success('Event creation modal would open here');
  };

  const handleEventClick = (event: CalendarEvent) => {
    toast.info(`Opening event: ${event.title}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <AnalyticsHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AnalyticsMetrics />
            <AIInsightsCard />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceDashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsTab
              selectedProject={selectedProject}
              onProjectChange={setSelectedProject}
              selectedRecipients={selectedRecipients}
              onRecipientsChange={setSelectedRecipients}
              onScheduleReport={handleScheduleReport}
              onDownloadReport={handleDownloadReport}
              onSendReport={handleSendReport}
            />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarTab
              events={mockEvents}
              onCreateEvent={handleCreateEvent}
              onEventClick={handleEventClick}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>

      <MiloAssistant />
    </div>
  );
};

export default Analytics;
