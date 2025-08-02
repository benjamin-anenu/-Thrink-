
import React from 'react';
import Layout from '@/components/Layout';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CalendarTab from '@/components/analytics/CalendarTab';
import ReportsTab from '@/components/analytics/ReportsTab';
import SettingsTab from '@/components/analytics/SettingsTab';

const Analytics: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          <AnalyticsHeader />
          <AnalyticsMetrics />
          
          <Tabs defaultValue="reports" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="reports" className="space-y-4">
              <ReportsTab />
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <CalendarTab />
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <SettingsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
