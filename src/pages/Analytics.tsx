
import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';
import { 
  initializePerformanceTracking, 
  startEmailReminderService, 
  initializeNotificationIntegration,
  initializeRealTimeDataSync,
  systemValidationService
} from '@/services';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import AIInsightsCard from '@/components/analytics/AIInsightsCard';
import ReportsTab from '@/components/analytics/ReportsTab';
import CalendarTab from '@/components/analytics/CalendarTab';
import SettingsTab from '@/components/analytics/SettingsTab';
import ReportsExport from '@/components/analytics/ReportsExport';
import SystemHealthDashboard from '@/components/analytics/SystemHealthDashboard';
import AdvancedAnalyticsDashboard from '@/components/analytics/AdvancedAnalyticsDashboard';
import ErrorBoundary from '@/components/ErrorBoundary';

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
  const [systemHealth, setSystemHealth] = useState<any>(null);

  // Initialize AI services and monitoring
  React.useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize core services
        initializePerformanceTracking();
        startEmailReminderService();
        initializeNotificationIntegration();
        initializeRealTimeDataSync();
        
        // Run initial system validation
        const healthResult = await systemValidationService.performSystemValidation();
        setSystemHealth(healthResult);
        
        console.log('[Analytics] All services initialized successfully');
      } catch (error) {
        console.error('[Analytics] Error initializing services:', error);
        toast.error('Some services failed to initialize');
      }
    };

    initializeServices();
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
        <AnalyticsHeader systemHealth={systemHealth} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="health">System</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="advanced">🚀 Advanced</TabsTrigger>
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

          <TabsContent value="export" className="space-y-6">
            <ReportsExport />
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <SystemHealthDashboard />
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <CalendarTab
              events={mockEvents}
              onCreateEvent={handleCreateEvent}
              onEventClick={handleEventClick}
            />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <ErrorBoundary fallback={<div className="p-8 text-center text-muted-foreground">Unable to load advanced analytics</div>}>
              <AdvancedAnalyticsDashboard />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>

      <TinkAssistant />
    </div>
  );
};

export default Analytics;
