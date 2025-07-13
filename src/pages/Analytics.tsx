import React, { useState } from 'react';
import Header from '@/components/Header';
import MiloAssistant from '@/components/MiloAssistant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, TrendingDown, Calendar, Download, Filter, Settings, Bell } from 'lucide-react';
import ProjectSelector from '@/components/reports/ProjectSelector';
import RecipientSelector from '@/components/reports/RecipientSelector';
import ReportScheduler from '@/components/reports/ReportScheduler';
import ProjectCalendar from '@/components/calendar/ProjectCalendar';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import { toast } from 'sonner';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';
import { simulateAIMonitoring, PerformanceTracker } from '@/services/PerformanceTracker';
import { startEmailReminderService } from '@/services/EmailReminderService';

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
            <p className="text-muted-foreground">Comprehensive project insights, automated reports, performance tracking, and AI-powered email reminders</p>
          </div>
        </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Project Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-green-600">+5% from last quarter</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Delivery Time</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5</div>
                  <p className="text-xs text-muted-foreground">weeks per project</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Resource Utilization</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-blue-600">Optimal range</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Variance</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">-3.2%</div>
                  <p className="text-xs text-red-600">Under budget</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>AI Insights & Recommendations</CardTitle>
                <CardDescription>Latest analytics and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Productivity Trend</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Team productivity has increased by 15% this quarter. The implementation of daily standups has improved communication.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Resource Alert</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Engineering team is approaching 90% utilization. Consider hiring additional developers for Q3 projects.
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Cost Optimization</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Current resource allocation is 3.2% under budget. You can reinvest savings into training programs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceDashboard />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-6">
                <ProjectSelector 
                  selectedProject={selectedProject}
                  onProjectChange={setSelectedProject}
                />
                <RecipientSelector
                  selectedRecipients={selectedRecipients}
                  onRecipientsChange={setSelectedRecipients}
                />
              </div>
              <div className="lg:col-span-2">
                <ReportScheduler
                  onScheduleReport={handleScheduleReport}
                  onDownloadReport={handleDownloadReport}
                  onSendReport={handleSendReport}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <ProjectCalendar
              events={mockEvents}
              onCreateEvent={handleCreateEvent}
              onEventClick={handleEventClick}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Advanced Settings
                </CardTitle>
                <CardDescription>Configure system settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Advanced settings panel coming soon...</p>
                  <p className="text-sm">This will include system configuration, integrations, and preferences</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <MiloAssistant />
    </div>
  );
};

export default Analytics;
