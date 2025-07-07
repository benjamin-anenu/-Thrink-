
import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
  aiConfidence: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ aiConfidence }) => {
  return (
    <div className="p-8 border-b border-primary/10 bg-gradient-to-r from-card/80 to-card/60">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow animate-pulse">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">AI Project Intelligence</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              Advanced real-time analysis active
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse shadow-glow"></div>
          <span className="text-sm text-emerald-400 font-bold">AI Processing</span>
          <div className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-bold border border-primary/30">
            {aiConfidence}% Confidence
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
