
import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const WorkspaceBanner = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const location = useLocation();
  
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';
  
  // Don't show banner on landing page, auth page, or when no user/workspace
  if (isLandingPage || isAuthPage || !user || !currentWorkspace) {
    return null;
  }
  
  return (
    <div className="fixed top-16 left-0 right-0 z-30 px-4">
      <div className="max-w-4xl mx-auto">
        <div className={cn(
          "bg-card/90 backdrop-blur-sm border border-border/40 rounded-lg px-3 py-1.5",
          "flex items-center justify-center gap-2 shadow-sm max-w-md mx-auto"
        )}>
          <span className="text-xs text-muted-foreground">Workspace:</span>
          <span className="font-medium text-foreground text-sm">{currentWorkspace.name}</span>
          {currentWorkspace.description && (
            <>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs text-muted-foreground truncate max-w-32">{currentWorkspace.description}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceBanner;
