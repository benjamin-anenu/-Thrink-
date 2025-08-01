import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import WorkspaceGuard from '@/components/WorkspaceGuard';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Mail, 
  MoreHorizontal, 
  Crown, 
  Shield, 
  Eye, 
  UserPlus,
  Avatar,
  AvatarFallback
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useState } from 'react';

const Stakeholders = () => {
  const { currentWorkspace, updateMemberRole, removeMember } = useWorkspace();
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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
    <AuthGuard>
      <WorkspaceGuard>
        <Layout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Stakeholders</h1>
                <p className="text-muted-foreground mt-2">
                  Manage and collaborate with stakeholders in your workspace
                </p>
              </div>
              <Button onClick={() => setInviteModalOpen(true)} className="gap-2">
                <UserPlus size={16} />
                Invite Stakeholder
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Stakeholder List</CardTitle>
                <CardDescription>
                  View and manage stakeholders in the current workspace
                </CardDescription>
              </CardHeader>
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
                        
                        {member.role !== 'owner' && (
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
                                Remove Stakeholder
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
          </div>
        </Layout>
      </WorkspaceGuard>
    </AuthGuard>
  );
};

export default Stakeholders;
