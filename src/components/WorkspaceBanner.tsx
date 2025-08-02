
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
    <div className="fixed top-16 left-0 right-0 z-40 bg-muted/30 backdrop-blur-sm border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground font-medium">Workspace:</span>
            <span className="font-semibold text-foreground">{currentWorkspace.name}</span>
            {currentWorkspace.description && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{currentWorkspace.description}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceBanner;
