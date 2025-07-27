
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles } from 'lucide-react';

const AIInsights = () => {
  return (
    <div className="space-y-6">
      {/* AI Insights Coming Soon */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-500" />
            AI Insights Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">AI Insights Coming Soon</h3>
            <p className="text-muted-foreground max-w-2xl mb-6 leading-relaxed">
              Our advanced AI-powered insights dashboard is currently in development. This feature will provide 
              intelligent analytics, predictive insights, risk assessments, and optimization recommendations 
              based on your project data and team performance patterns.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Badge variant="secondary" className="px-4 py-2">
                <Brain className="w-4 h-4 mr-2" />
                Machine Learning
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Sparkles className="w-4 h-4 mr-2" />
                Predictive Analytics
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                Q4 2025
              </Badge>
            </div>
            <div className="mt-8 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Planned Features:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Smart resource allocation recommendations</li>
                <li>• Project risk prediction and mitigation strategies</li>
                <li>• Performance optimization insights</li>
                <li>• Automated trend analysis and forecasting</li>
                <li>• Intelligent task prioritization</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
