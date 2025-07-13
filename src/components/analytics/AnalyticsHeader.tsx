
import React from 'react';

const AnalyticsHeader: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground">
          Comprehensive project insights, automated reports, performance tracking, and AI-powered email reminders
        </p>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
