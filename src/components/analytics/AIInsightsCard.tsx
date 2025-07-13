
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AIInsightsCard: React.FC = () => {
  return (
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
  );
};

export default AIInsightsCard;
