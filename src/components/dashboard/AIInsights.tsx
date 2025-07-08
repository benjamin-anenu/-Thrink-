import React from 'react';
import { Brain, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

const AIInsights: React.FC = () => {
  const insights = [
    {
      icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
      title: "Performance Optimization",
      description: "Team velocity increased by 23% after AI workflow integration",
      confidence: 94,
      type: "success"
    },
    {
      icon: <AlertCircle className="h-5 w-5 text-orange-400" />,
      title: "Resource Bottleneck",
      description: "Backend team approaching capacity - recommend scaling",
      confidence: 87,
      type: "warning"
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-blue-400" />,
      title: "Automation Opportunity",
      description: "Testing phase can be 60% automated with current patterns",
      confidence: 91,
      type: "insight"
    }
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">AI Intelligence Feed</h3>
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="glass-card p-6 rounded-2xl border border-primary/20 hover:border-primary/40 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-primary/10">
                {insight.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-foreground">{insight.title}</h4>
                  <div className="text-xs text-muted-foreground">
                    {insight.confidence}% confidence
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                <div className="mt-3 h-1 bg-card rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 rounded-full ${
                      insight.type === 'success' ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' :
                      insight.type === 'warning' ? 'bg-gradient-to-r from-orange-400 to-red-400' :
                      'bg-gradient-to-r from-blue-400 to-purple-400'
                    }`}
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;