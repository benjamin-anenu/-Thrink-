
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportsTab from '@/components/analytics/ReportsTab';
import CalendarTab from '@/components/analytics/CalendarTab';
import SettingsTab from '@/components/analytics/SettingsTab';

const Analytics: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <AnalyticsHeader />
          
          <div className="mt-8 space-y-8">
            <AnalyticsMetrics />
            
            <Tabs defaultValue="reports" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="reports" className="space-y-6">
                <ReportsTab 
                  selectedProject={selectedProject}
                  onProjectChange={setSelectedProject}
                  selectedRecipients={selectedRecipients}
                  onRecipientsChange={setSelectedRecipients}
                />
              </TabsContent>
              
              <TabsContent value="calendar" className="space-y-6">
                <CalendarTab />
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <SettingsTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
