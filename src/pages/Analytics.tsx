
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
  const [scheduleSettings, setScheduleSettings] = useState({
    frequency: 'weekly' as const,
    dayOfWeek: 1,
    time: '09:00'
  });
  const [reportType, setReportType] = useState('summary');
  const [events, setEvents] = useState([]);

  const handleCreateEvent = (event: any) => {
    setEvents(prev => [...prev, event]);
  };

  const handleEventClick = (event: any) => {
    console.log('Event clicked:', event);
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
            scheduleSettings={scheduleSettings}
            onScheduleChange={setScheduleSettings}
            reportType={reportType}
            onReportTypeChange={setReportType}
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
