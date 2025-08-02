
import React from 'react';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsMetrics from '@/components/analytics/AnalyticsMetrics';
import PageHeader from '@/components/PageHeader';

const Analytics = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <PageHeader 
        title="Analytics Dashboard"
        description="Monitor project performance, team productivity, and system health"
      />
      <AnalyticsMetrics />
    </div>
  );
};

export default Analytics;
