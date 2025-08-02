
import React from 'react';
import AIInsightsDashboard from '@/components/AIInsightsDashboard';
import AIProjectDashboard from '@/components/AIProjectDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AIHub = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Hub</h1>
        <p className="text-muted-foreground">
          Leverage artificial intelligence to optimize your project management
        </p>
      </div>

      <Tabs defaultValue="insights" className="w-full">
        <TabsList>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="project-ai">Project AI</TabsTrigger>
        </TabsList>
        
        <TabsContent value="insights" className="space-y-6 mt-6">
          <AIInsightsDashboard />
        </TabsContent>
        
        <TabsContent value="project-ai" className="space-y-6 mt-6">
          <AIProjectDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIHub;
