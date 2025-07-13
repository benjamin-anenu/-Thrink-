
import React from 'react';
import { Brain, Sparkles, Building2 } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface DashboardHeaderProps {
  aiConfidence: number;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ aiConfidence }) => {
  const { currentWorkspace } = useWorkspace();
  
  return (
    <div className="p-8 border-b border-primary/10 bg-gradient-to-r from-card/80 to-card/60">
      {/* Current Workspace Display */}
      {currentWorkspace && (
        <div className="mb-6 p-4 bg-background/50 rounded-xl border border-border/50">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-foreground">{currentWorkspace.name}</h2>
              {currentWorkspace.description && (
                <p className="text-sm text-muted-foreground">{currentWorkspace.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {currentWorkspace.members.length} member{currentWorkspace.members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
      
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
