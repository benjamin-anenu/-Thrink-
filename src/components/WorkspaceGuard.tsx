
import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus, Loader2 } from 'lucide-react';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkspaceGuardProps {
  children: React.ReactNode;
}

const WorkspaceGuard: React.FC<WorkspaceGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const { workspaces, loading, currentWorkspace } = useWorkspace();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Show loading state while checking workspaces
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user has no workspaces, show workspace creation prompt
  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Welcome to Project Manager! 🎉</CardTitle>
              <CardDescription className="text-base">
                Let's get you started by creating your first workspace. A workspace helps you organize your projects and collaborate with your team.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="w-full h-12 text-base gap-2"
              size="lg"
            >
              <Plus size={20} />
              Create Your First Workspace
            </Button>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Welcome, <strong>{user?.email}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Once you create a workspace, you'll have full access to all project management features.
              </p>
            </div>
          </CardContent>
        </Card>

        <CreateWorkspaceModal 
          open={createModalOpen} 
          onOpenChange={setCreateModalOpen} 
        />
      </div>
    );
  }

  // If user has workspaces, render the protected content
  return <>{children}</>;
};

export default WorkspaceGuard;
