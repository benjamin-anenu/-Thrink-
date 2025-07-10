
import React from 'react';
import { Brain, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

const AIInsights: React.FC = () => {
  return (
    <div className="space-y-4">
      <h6 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Brain className="h-5 w-5 text-primary animate-pulse" />
        Live AI Insights
      </h6>
      
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-400/25 animate-fade-in shadow-elevated">
        <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
        <div className="text-sm flex-1">
          <span className="text-emerald-400 font-bold">Smart Assignment Complete</span>
          <span className="text-muted-foreground"> - AI assigned critical path tasks to optimal team members</span>
        </div>
        <div className="text-xs text-emerald-400 font-medium">Just now</div>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-400/25 animate-fade-in animation-delay-500 shadow-elevated">
        <TrendingUp className="h-5 w-5 text-blue-400 flex-shrink-0" />
        <div className="text-sm flex-1">
          <span className="text-blue-400 font-bold">Performance Boost Detected</span>
          <span className="text-muted-foreground"> - Team velocity increased 34% after AI optimization</span>
        </div>
        <div className="text-xs text-blue-400 font-medium">2 min ago</div>
      </div>

      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-400/25 animate-fade-in animation-delay-1000 shadow-elevated">
        <AlertTriangle className="h-5 w-5 text-purple-400 flex-shrink-0" />
        <div className="text-sm flex-1">
          <span className="text-purple-400 font-bold">Proactive Risk Mitigation</span>
          <span className="text-muted-foreground"> - AI identified and resolved potential bottleneck</span>
        </div>
        <div className="text-xs text-purple-400 font-medium">5 min ago</div>
      </div>
    </div>
  );
};

export default AIInsights;
