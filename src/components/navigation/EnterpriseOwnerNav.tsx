import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, LayoutDashboard, Settings } from 'lucide-react';
import { useEnterpriseOwnerPersistence } from '@/hooks/useEnterpriseOwnerPersistence';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export function EnterpriseOwnerNav() {
  const { isEnterpriseOwner, preferences, toggleSystemView } = useEnterpriseOwnerPersistence();
  const { currentWorkspace } = useWorkspace();

  if (!isEnterpriseOwner) return null;

  const isInSystemView = !currentWorkspace;

  return (
    <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-primary" />
        <Badge variant={isInSystemView ? "default" : "secondary"}>
          {isInSystemView ? "System Administrator" : "Workspace View"}
        </Badge>
      </div>
      
      <Button
        onClick={toggleSystemView}
        variant="ghost"
        size="sm"
        className="h-8 px-2"
      >
        {isInSystemView ? (
          <>
            <LayoutDashboard className="h-3 w-3 mr-1" />
            Switch to Workspace
          </>
        ) : (
          <>
            <Settings className="h-3 w-3 mr-1" />
            System Administrator
          </>
        )}
      </Button>
    </div>
  );
}