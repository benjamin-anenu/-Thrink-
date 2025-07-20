
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast"
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Plus, Settings } from 'lucide-react';
import WorkspaceForm from '@/components/WorkspaceForm';
import WorkspaceSettingsModal from '@/components/WorkspaceSettingsModal';

const Workspaces = () => {
  const { 
    workspaces, 
    currentWorkspace, 
    setCurrentWorkspace, 
    loading 
  } = useWorkspace();
  
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const { toast } = useToast();

  const handleWorkspaceSelect = (workspace: any) => {
    setCurrentWorkspace(workspace);
    toast({
      title: "Workspace switched",
      description: `Switched to ${workspace.name}`
    });
  };

  const handleOpenSettings = (workspace: any) => {
    setSelectedWorkspace(workspace);
    setShowSettings(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workspaces</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Workspace
        </Button>
      </div>

      {loading ? (
        <div>Loading workspaces...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Card key={workspace.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {workspace.name}
                  <Button variant="ghost" size="icon" onClick={() => handleOpenSettings(workspace)}>
                    <Settings className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">{workspace.description}</p>
                <Button variant="outline" onClick={() => handleWorkspaceSelect(workspace)}>
                  Switch to Workspace
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <WorkspaceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
      />

      <WorkspaceSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        workspace={selectedWorkspace}
      />
    </div>
  );
};

export default Workspaces;
