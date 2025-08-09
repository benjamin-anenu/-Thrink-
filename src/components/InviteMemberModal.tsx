
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Users, Eye, X } from 'lucide-react';

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ open, onOpenChange, workspaceId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [emails, setEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { inviteMember, workspaces, currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(workspaceId || currentWorkspace?.id || '');

  useEffect(() => {
    setSelectedWorkspaceId(workspaceId || currentWorkspace?.id || '');
  }, [workspaceId, currentWorkspace, open]);

  const roleDescriptions = {
    admin: 'Can manage workspace settings and members',
    member: 'Can create and manage projects',
    viewer: 'Can view projects but not edit them'
  };

  const addEmail = () => {
    const normalized = email.trim().toLowerCase();
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normalized || !EMAIL_RE.test(normalized)) return;
    setEmails(prev => (prev.includes(normalized) ? prev : [...prev, normalized]));
    setEmail('');
  };
  const removeEmail = (emailToRemove: string) => {
    setEmails(prev => prev.filter(e => e !== emailToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emails.length === 0) return;

    setIsLoading(true);
    
    try {
      const targetId = workspaceId || selectedWorkspaceId;
      if (!targetId) {
        toast({
          title: 'Select a workspace',
          description: 'Please choose a workspace to send invites.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      await Promise.all(
        emails.map((emailAddress) => inviteMember(targetId, emailAddress, role))
      );
      
      toast({
        title: 'Invitations sent! 📧',
        description: `Invited ${emails.length} member${emails.length > 1 ? 's' : ''} to join the workspace.`,
      });
      
      // Reset form
      setEmails([]);
      setEmail('');
      setRole('member');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error sending invitations",
        description: (error as any)?.message || (typeof error === 'string' ? error : 'Please try again later.'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Team Members</DialogTitle>
          <DialogDescription>
            Invite people to collaborate in this workspace. They'll receive an email invitation.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Addresses</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              
              placeholder="Enter email and press Enter"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {emails.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1">
                  {email}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => removeEmail(email)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
          {!workspaceId && (
            <div className="space-y-2">
              <Label htmlFor="workspace">Workspace</Label>
              <Select value={selectedWorkspaceId} onValueChange={(val) => setSelectedWorkspaceId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: 'admin' | 'member' | 'viewer') => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-blue-500" />
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-xs text-muted-foreground">
                        Can manage workspace settings and members
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="member">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-green-500" />
                    <div>
                      <div className="font-medium">Member</div>
                      <div className="text-xs text-muted-foreground">
                        Can create and manage projects
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="viewer">
                  <div className="flex items-center gap-2">
                    <Eye size={14} className="text-gray-500" />
                    <div>
                      <div className="font-medium">Viewer</div>
                      <div className="text-xs text-muted-foreground">
                        Can view projects but not edit them
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={emails.length === 0 || isLoading || (!workspaceId && !selectedWorkspaceId)}>
              {isLoading ? 'Sending...' : `Send ${emails.length} Invitation${emails.length > 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteMemberModal;
