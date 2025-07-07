
import React from 'react';
import { Brain } from 'lucide-react';
import AIProjectDashboard from '../AIProjectDashboard';

const HeroDashboard: React.FC = () => {
  return (
    <div className="relative rounded-3xl overflow-hidden glass-card shadow-premium hover:shadow-glow transition-all duration-500 transform hover:scale-[1.02] border border-primary/20">
      {/* Premium Dashboard Header */}
      <div className="bg-gradient-to-r from-card/95 to-card/80 backdrop-blur-3xl p-8 border-b border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-foreground font-bold text-xl">Milo AI Enterprise</span>
              <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Advanced Intelligence Active</span>
                <div className="px-2 py-1 bg-emerald-400/20 text-emerald-400 rounded-md text-xs font-semibold">LIVE</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 flex items-center text-emerald-400 text-sm font-bold shadow-elevated">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
              AI Processing
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Project Dashboard */}
      <div className="h-[650px] relative">
        <AIProjectDashboard />
      </div>
    </div>
  );
};

export default HeroDashboard;
