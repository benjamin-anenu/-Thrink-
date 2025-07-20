
import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';
import InviteMemberModal from '@/components/InviteMemberModal';
import WorkspaceSettingsModal from '@/components/WorkspaceSettingsModal';
import WorkspaceConfiguration from '@/components/workspace/WorkspaceConfiguration';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Users, Settings, Crown, Shield, Eye, Edit, User, Building } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Workspaces = () => {
  const { workspaces, currentWorkspace, switchWorkspace, members } = useWorkspace();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedWorkspaceForSettings, setSelectedWorkspaceForSettings] = useState<string | null>(null);

  const isOwner = (workspaceId: string) => {
    const member = members.find(m => m.workspace_id === workspaceId && m.user_id === user?.id);
    return member?.role === 'owner';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'member':
        return <User className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'member':
        return 'outline';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workspaces</h1>
            <p className="text-muted-foreground mt-2">
              Manage your workspaces and collaborate with your team
            </p>
          </div>
          <div className="flex items-center gap-4">
            {currentWorkspace && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current:</span>
                <Select
                  value={currentWorkspace.id}
                  onValueChange={(value) => {
                    const workspace = workspaces.find(w => w.id === value);
                    if (workspace) switchWorkspace(workspace);
                  }}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((workspace) => (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {workspace.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workspace
            </Button>
          </div>
        </div>

        {currentWorkspace && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              {isOwner(currentWorkspace.id) && (
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {workspaces.map((workspace) => {
                  const userMember = members.find(m => m.workspace_id === workspace.id && m.user_id === user?.id);
                  const workspaceMembers = members.filter(m => m.workspace_id === workspace.id);
                  
                  return (
                    <Card 
                      key={workspace.id} 
                      className={`transition-all hover:shadow-lg ${
                        currentWorkspace?.id === workspace.id ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-primary" />
                          <CardTitle className="text-lg font-semibold">
                            {workspace.name}
                          </CardTitle>
                        </div>
                        {userMember && (
                          <Badge variant={getRoleBadgeVariant(userMember.role)} className="flex items-center gap-1">
                            {getRoleIcon(userMember.role)}
                            {userMember.role}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {workspace.description && (
                            <p className="text-sm text-muted-foreground">
                              {workspace.description}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{workspaceMembers.length} members</span>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => switchWorkspace(workspace)}
                              disabled={currentWorkspace?.id === workspace.id}
                            >
                              {currentWorkspace?.id === workspace.id ? 'Current' : 'Switch'}
                            </Button>
                            
                            {(userMember?.role === 'owner' || userMember?.role === 'admin') && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowInviteModal(true)}
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedWorkspaceForSettings(workspace.id);
                                    setShowSettingsModal(true);
                                  }}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Workspace Members</CardTitle>
                    {currentWorkspace && (isOwner(currentWorkspace.id) || members.find(m => m.workspace_id === currentWorkspace.id && m.user_id === user?.id)?.role === 'admin') && (
                      <Button onClick={() => setShowInviteModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentWorkspace && members
                      .filter(member => member.workspace_id === currentWorkspace.id)
                      .map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{member.email || 'Unknown User'}</p>
                              <p className="text-sm text-muted-foreground">
                                Joined {new Date(member.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                            {getRoleIcon(member.role)}
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {isOwner(currentWorkspace.id) && (
              <TabsContent value="configuration">
                <WorkspaceConfiguration workspaceId={currentWorkspace.id} />
              </TabsContent>
            )}
          </Tabs>
        )}

        {/* Modals */}
        <CreateWorkspaceModal 
          open={showCreateModal} 
          onOpenChange={setShowCreateModal} 
        />
        
        {currentWorkspace && (
          <InviteMemberModal 
            open={showInviteModal} 
            onOpenChange={setShowInviteModal}
            workspaceId={currentWorkspace.id}
          />
        )}
        
        {selectedWorkspaceForSettings && (
          <WorkspaceSettingsModal 
            open={showSettingsModal} 
            onOpenChange={setShowSettingsModal}
            workspaceId={selectedWorkspaceForSettings}
          />
        )}
      </main>
    </div>
  );
};

export default Workspaces;
