import { useState, useEffect } from 'react';
import { Users, UserPlus, MoreHorizontal, Crown, Shield, Eye, Mail } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEnterprise } from '@/contexts/EnterpriseContext';
import { WorkspaceService } from '@/services/WorkspaceService';
import { WorkspaceMember, WorkspaceInvitation } from '@/types/enterprise';
import { InviteMemberModal } from './InviteMemberModal';
import { toast } from 'sonner';

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: Users,
  viewer: Eye,
};

const roleColors = {
  owner: 'bg-gradient-to-r from-yellow-400 to-orange-500',
  admin: 'bg-gradient-to-r from-blue-500 to-purple-600',
  member: 'bg-gradient-to-r from-green-500 to-teal-600',
  viewer: 'bg-gradient-to-r from-gray-500 to-slate-600',
};

export function TeamManagement() {
  const { currentWorkspace, workspaceMembers, refreshMembers } = useEnterprise();
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      loadInvitations();
    }
  }, [currentWorkspace]);

  const loadInvitations = async () => {
    if (!currentWorkspace) return;
    
    try {
      const invitationList = await WorkspaceService.getWorkspaceInvitations(currentWorkspace.id);
      setInvitations(invitationList);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      toast.error('Failed to load invitations');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!currentWorkspace) return;
    
    try {
      setLoading(true);
      await WorkspaceService.removeMember(currentWorkspace.id, memberId);
      await refreshMembers();
      toast.success('Member removed successfully');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!currentWorkspace) return;
    
    try {
      setLoading(true);
      await WorkspaceService.updateMemberRole(currentWorkspace.id, memberId, newRole);
      await refreshMembers();
      toast.success('Member role updated successfully');
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!currentWorkspace) return;
    
    try {
      setLoading(true);
      await WorkspaceService.revokeInvitation(currentWorkspace.id, invitationId);
      await loadInvitations();
      toast.success('Invitation revoked successfully');
    } catch (error) {
      console.error('Failed to revoke invitation:', error);
      toast.error('Failed to revoke invitation');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'inactive': return 'bg-gray-500';
      case 'suspended': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getInvitationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-green-500';
      case 'expired': return 'bg-gray-500';
      case 'revoked': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Please select a workspace to manage team members.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Manage members and invitations for {currentWorkspace.name}
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members ({workspaceMembers.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Invitations ({invitations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspaceMembers.map((member) => {
                    const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={(member as any).profiles?.avatar_url} />
                              <AvatarFallback>
                                {(member as any).profiles?.full_name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {(member as any).profiles?.full_name || 'Unknown User'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {(member as any).profiles?.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={`text-white ${roleColors[member.role as keyof typeof roleColors]}`}>
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(member.status)}`} />
                            <span className="text-sm capitalize">{member.status}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {member.role !== 'owner' && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.id, 'admin')}
                                  disabled={loading || member.role === 'admin'}
                                >
                                  Make Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.id, 'member')}
                                  disabled={loading || member.role === 'member'}
                                >
                                  Make Member
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateRole(member.id, 'viewer')}
                                  disabled={loading || member.role === 'viewer'}
                                >
                                  Make Viewer
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={loading}
                                >
                                  Remove Member
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">{invitation.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{invitation.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getInvitationStatusColor(invitation.status)}`} />
                          <span className="text-sm capitalize">{invitation.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(invitation.expires_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {invitation.status === 'pending' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRevokeInvitation(invitation.id)}
                                disabled={loading}
                              >
                                Revoke Invitation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteMemberModal
        open={showInviteModal}
        onOpenChange={setShowInviteModal}
        onInviteSent={() => {
          loadInvitations();
          refreshMembers();
        }}
      />
    </div>
  );
}