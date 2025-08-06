
import React from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

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
    <div className="fixed top-14 md:top-16 left-0 right-0 z-40 bg-muted/20 backdrop-blur-sm border-b border-border/20">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-center py-1.5 md:py-2">
          <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2 text-center md:text-left">
            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
              <span className="text-muted-foreground font-medium">Workspace:</span>
              <span className="font-semibold text-foreground truncate max-w-[150px] md:max-w-none">{currentWorkspace.name}</span>
            </div>
            {currentWorkspace.description && (
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <span className="text-muted-foreground hidden md:inline">•</span>
                <span className="text-muted-foreground truncate max-w-[200px] md:max-w-none">{currentWorkspace.description}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceBanner;
