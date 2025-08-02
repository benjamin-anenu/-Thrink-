
import React from 'react';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { AnalyticsMetrics } from '@/components/analytics/AnalyticsMetrics';

const Analytics = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <AnalyticsHeader />
      <AnalyticsMetrics />
    </div>
  );
};

export default Analytics;
