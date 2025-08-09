
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
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
const WorkspaceSelector: React.FC = () => {
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspace();
  const { isSystemOwner, role } = useAuth();
  const navigate = useNavigate();

  return (
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
              onSelect={() => {
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
            onSelect={() => setCurrentWorkspace(workspace)}
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
  );
};

export default WorkspaceSelector;
