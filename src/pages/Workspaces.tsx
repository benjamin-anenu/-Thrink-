
import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';
import WorkspaceSettingsModal from '@/components/WorkspaceSettingsModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Users, Calendar } from 'lucide-react';

const Workspaces = () => {
  const { workspaces, currentWorkspace, setCurrentWorkspace, loading } = useWorkspace();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
          <p className="text-muted-foreground">
            Manage your workspaces and team collaboration spaces
          </p>
        </div>
        
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </Button>
      </div>

      {/* Current Workspace */}
      {currentWorkspace && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {currentWorkspace.name}
                <Badge variant="secondary">Current</Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedWorkspaceId(currentWorkspace.id);
                  setShowSettingsModal(true);
                }}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            {currentWorkspace.description && (
              <CardDescription>{currentWorkspace.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{currentWorkspace.members?.length || 0} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(currentWorkspace.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Workspaces */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Workspaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Card 
              key={workspace.id} 
              className={`cursor-pointer transition-colors hover:border-primary/30 ${
                workspace.id === currentWorkspace?.id ? 'border-primary/20 bg-primary/5' : ''
              }`}
              onClick={() => setCurrentWorkspace(workspace)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{workspace.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkspaceId(workspace.id);
                      setShowSettingsModal(true);
                    }}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                {workspace.description && (
                  <CardDescription>{workspace.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{workspace.members?.length || 0} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <CreateWorkspaceModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {selectedWorkspaceId && (
        <WorkspaceSettingsModal 
          isOpen={showSettingsModal}
          onClose={() => {
            setShowSettingsModal(false);
            setSelectedWorkspaceId(null);
          }}
          workspaceId={selectedWorkspaceId}
        />
      )}
    </div>
  );
};

export default Workspaces;
