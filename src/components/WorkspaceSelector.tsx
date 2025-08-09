
import React, { useState } from 'react';
import { ChevronDown, Building2, Plus, Check, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspaceAccess } from '@/hooks/useWorkspaceAccess';
import { Link, useNavigate } from 'react-router-dom';
const WorkspaceSelector: React.FC = () => {
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspace();
  const { isSystemOwner, role } = useAuth();
  const navigate = useNavigate();
  const { assumeAccess, clearAccess, getAssumedWorkspaceId } = useWorkspaceAccess();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);

  const handleConfirmRemote = async () => {
    if (!pendingWorkspaceId) return;
    const result = await assumeAccess(pendingWorkspaceId, 240, 'admin');
    if (result?.ok) {
      const ws = workspaces.find(w => w.id === pendingWorkspaceId) || null;
      if (ws) {
        setCurrentWorkspace(ws);
        navigate('/dashboard');
      }
    }
    setConfirmOpen(false);
    setPendingWorkspaceId(null);
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 px-3 text-sm gap-2 max-w-48">
            <Building2 size={16} className="text-muted-foreground" />
            <span className="truncate">
              {currentWorkspace?.name || 'Select Workspace'}
            </span>
            <ChevronDown size={14} className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64 bg-card/95 backdrop-blur-md border border-border">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide">
            Workspaces
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {(isSystemOwner || role === 'owner' || role === 'admin') && (
            <>
              <DropdownMenuItem
                onSelect={async () => {
                  const assumedId = getAssumedWorkspaceId();
                  if (assumedId) {
                    await clearAccess(assumedId);
                  }
                  setCurrentWorkspace(null);
                  navigate('/dashboard');
                }}
                className="flex items-center gap-2 p-3 cursor-pointer"
              >
                <LayoutDashboard size={14} />
                <span className="text-sm">System Owner Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          {workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onSelect={() => {
                setPendingWorkspaceId(workspace.id);
                setConfirmOpen(true);
              }}
              className="flex items-center justify-between p-3 cursor-pointer"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-muted-foreground" />
                  <span className="font-medium text-sm">{workspace.name}</span>
                </div>
                {workspace.description && (
                  <span className="text-xs text-muted-foreground pl-5 truncate">
                    {workspace.description}
                  </span>
                )}
                <span className="text-xs text-muted-foreground pl-5">
                  {workspace.members.length} member{workspace.members.length !== 1 ? 's' : ''}
                </span>
              </div>
              {currentWorkspace?.id === workspace.id && (
                <Check size={16} className="text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/workspaces" className="flex items-center gap-2 p-3 cursor-pointer">
              <Plus size={14} />
              <span className="text-sm">Manage Workspaces</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remote into workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Assume admin access to this workspace until you switch back to System Administrator mode.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemote}>Yes, continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorkspaceSelector;
