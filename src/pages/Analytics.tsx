
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import AIInsights from '@/components/dashboard/AIInsights';
import ReportsTab from '@/components/analytics/ReportsTab';
import CalendarTab from '@/components/analytics/CalendarTab';
import SettingsTab from '@/components/analytics/SettingsTab';
import TinkAssistant from '@/components/TinkAssistant';

const Analytics = () => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [reportType, setReportType] = useState('summary');
  const [events, setEvents] = useState([]);

  const handleCreateEvent = (event: any) => {
    setEvents(prev => [...prev, event]);
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
  };

  const handleScheduleReport = (config: any) => {
    console.log('Schedule report:', config);
  };

  const handleDownloadReport = (type: string, dateRange: any) => {
    console.log('Download report:', type, dateRange);
  };

  const handleSendReport = (type: string, dateRange: any) => {
    console.log('Send report:', type, dateRange);
  };

  return (
    <div className="space-y-6">
      <AnalyticsHeader />
      <AnalyticsMetrics />
      
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-4">
          <AIInsights />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
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
        
        <TabsContent value="calendar" className="space-y-4">
          <CalendarTab 
            events={events}
            onCreateEvent={handleCreateEvent}
            onEventClick={handleEventClick}
          />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
      
      <TinkAssistant />
    </div>
  );
};

export default Analytics;
