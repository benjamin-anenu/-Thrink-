
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Settings, Plus, Mail, MoreHorizontal, Crown, Shield, Eye, UserPlus, LayoutDashboard } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import CreateWorkspaceModal from '@/components/CreateWorkspaceModal';
import InviteMemberModal from '@/components/InviteMemberModal';
import WorkspaceSettingsModal from '@/components/WorkspaceSettingsModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import SystemOwnerDashboard from '@/components/dashboard/SystemOwnerDashboard';
import { toast } from '@/components/ui/use-toast';

const Workspaces: React.FC = () => {
  const { workspaces, currentWorkspace, setCurrentWorkspace, removeMember, updateMemberRole } = useWorkspace();
  const { isSystemOwner, role, refreshProfile } = useAuth();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(currentWorkspace);
  const navigate = useNavigate();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown size={14} className="text-amber-500" />;
      case 'admin': return <Shield size={14} className="text-blue-500" />;
      case 'member': return <Users size={14} className="text-green-500" />;
      case 'viewer': return <Eye size={14} className="text-gray-500" />;
      default: return null;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'member': return 'outline';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      
      <div className="container mx-auto px-4 pt-28 pb-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Workspaces {isSystemOwner && (
                <Badge variant="secondary" className="ml-2 gap-1">
                  <Crown size={12} />
                  System Owner
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground">
              {isSystemOwner 
                ? "Manage all workspaces across the system and collaborate with your teams"
                : "Manage your workspaces and collaborate with your team"
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={async () => { await refreshProfile(); toast({ title: 'Access updated', description: 'Your roles and permissions were refreshed.' }); }}>
              Refresh access
            </Button>
            <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
              <Plus size={16} />
              Create Workspace
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {isSystemOwner && workspaces.length > 0 && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Crown size={20} />
                    System Owner Dashboard
                  </CardTitle>
                  <CardDescription>
                    You have access to all {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate('/system/portfolio')} className="gap-2">
                    <LayoutDashboard size={16} />
                    Open System Portfolio
                  </Button>
                </CardContent>
              </Card>
            )}

            {(isSystemOwner || role === 'owner' || role === 'admin') && (
              <div>
                <SystemOwnerDashboard />
              </div>
            )}
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(isSystemOwner || role === 'owner' || role === 'admin') && (
                <Card 
                  key="all-workspaces" 
                  className="cursor-pointer transition-all duration-200 hover:shadow-md"
                  onClick={() => navigate('/system/portfolio')}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <LayoutDashboard size={20} className="text-primary" />
                      <CardTitle className="text-lg">System Portfolio</CardTitle>
                    </div>
                    <CardDescription>View portfolio across all workspaces</CardDescription>
                  </CardHeader>
                </Card>
              )}
              {workspaces.map((workspace) => (
                <Card 
                  key={workspace.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    currentWorkspace?.id === workspace.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => { setCurrentWorkspace(workspace); navigate('/dashboard'); }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 size={20} className="text-primary" />
                        <CardTitle className="text-lg">{workspace.name}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentWorkspace?.id === workspace.id && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                        {isSystemOwner && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Crown size={10} />
                          </Badge>
                        )}
                      </div>
                    </div>
                    {workspace.description && (
                      <CardDescription>{workspace.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users size={14} />
                        <span>{workspace.members.length} members</span>
                      </div>
                      <div className="flex -space-x-1">
                        {workspace.members.slice(0, 3).map((member) => (
                          <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="text-xs">
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {workspace.members.length > 3 && (
                          <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">
                              +{workspace.members.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {currentWorkspace?.name} Members
                {isSystemOwner && (
                  <Badge variant="secondary" className="ml-2 gap-1 text-xs">
                    <Crown size={10} />
                    Full Access
                  </Badge>
                )}
              </h2>
              <Button onClick={() => setInviteModalOpen(true)} className="gap-2">
                <UserPlus size={16} />
                Invite Member
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {currentWorkspace?.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{member.name}</span>
                            {member.status === 'pending' && (
                              <Badge variant="outline" className="text-xs">
                                <Mail size={10} className="mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{member.email}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant={getRoleBadgeVariant(member.role)} className="gap-1">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                        
                        {(member.role !== 'owner' && (isSystemOwner || currentWorkspace?.ownerId)) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => updateMemberRole(currentWorkspace!.id, member.id, 'admin')}
                                disabled={member.role === 'admin'}
                              >
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateMemberRole(currentWorkspace!.id, member.id, 'member')}
                                disabled={member.role === 'member'}
                              >
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateMemberRole(currentWorkspace!.id, member.id, 'viewer')}
                                disabled={member.role === 'viewer'}
                              >
                                Make Viewer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => removeMember(currentWorkspace!.id, member.id)}
                                className="text-destructive"
                              >
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  Workspace Settings
                  {isSystemOwner && (
                    <Badge variant="secondary" className="ml-2 gap-1 text-xs">
                      <Crown size={10} />
                      System Owner
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure workspace permissions and preferences
                  {isSystemOwner && " (You have full system access)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => setSettingsModalOpen(true)}>
                  Open Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateWorkspaceModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <InviteMemberModal 
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen}
        workspaceId={currentWorkspace?.id || ''}
      />
      <WorkspaceSettingsModal
        open={settingsModalOpen}
        onOpenChange={setSettingsModalOpen}
        workspace={currentWorkspace}
      />
    </div>
  );
};

export default Workspaces;
