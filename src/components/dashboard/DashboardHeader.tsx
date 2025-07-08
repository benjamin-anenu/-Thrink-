import React from 'react';
import { Brain, Zap } from 'lucide-react';

interface DashboardHeaderProps {
  aiConfidence: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ aiConfidence }) => {
  return (
    <div className="bg-gradient-to-r from-card/95 to-card/90 backdrop-blur-2xl p-8 border-b border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-purple-500 to-cyan-500 flex items-center justify-center shadow-glow">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">AI Project Intelligence</h2>
            <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span>Enterprise Intelligence Network</span>
              <div className="px-3 py-1 bg-emerald-400/20 text-emerald-400 rounded-lg text-xs font-bold">
                ACTIVE
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">AI Confidence</div>
            <div className="text-2xl font-bold text-primary">{aiConfidence}%</div>
          </div>
          <div className="h-12 px-4 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 flex items-center text-primary text-sm font-bold shadow-elevated">
            <Zap className="h-4 w-4 mr-2 animate-pulse" />
            Processing
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;