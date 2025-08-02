
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, Database, MessageCircle, Settings, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';

const AIHub = () => {
  const aiFeatures = [
    {
      title: "Tink AI Assistant",
      description: "Your intelligent project management companion",
      icon: Brain,
      status: "Active",
      features: ["Data Analysis", "Smart Insights", "Chat Support"]
    },
    {
      title: "Predictive Analytics",
      description: "Forecast project outcomes and resource needs",
      icon: Sparkles,
      status: "Beta",
      features: ["Risk Prediction", "Timeline Forecasting", "Resource Planning"]
    },
    {
      title: "Smart Data Processing",
      description: "Automated data analysis and reporting",
      icon: Database,
      status: "Active",
      features: ["Auto Reports", "Data Visualization", "Performance Metrics"]
    },
    {
      title: "Intelligent Communication",
      description: "AI-powered stakeholder communication",
      icon: MessageCircle,
      status: "Coming Soon",
      features: ["Auto Updates", "Smart Notifications", "Status Reports"]
    }
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <PageHeader 
        title="AI Hub"
        description="Harness the power of artificial intelligence for smarter project management"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {aiFeatures.map((feature, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </div>
                </div>
                <Badge variant={feature.status === 'Active' ? 'default' : 
                              feature.status === 'Beta' ? 'secondary' : 'outline'}>
                  {feature.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((feat, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feat}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  {feature.status === 'Active' && (
                    <Button size="sm" variant="outline">
                      <Zap className="w-4 h-4 mr-2" />
                      Launch
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Performance Metrics</CardTitle>
          <CardDescription>Track how AI is improving your project management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">87%</div>
              <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">42hrs</div>
              <div className="text-sm text-muted-foreground">Time Saved This Month</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">156</div>
              <div className="text-sm text-muted-foreground">AI Insights Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIHub;
