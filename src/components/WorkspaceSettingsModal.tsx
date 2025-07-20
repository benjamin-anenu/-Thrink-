
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { Workspace } from '@/types/workspace';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DepartmentsManagement from './workspace-settings/DepartmentsManagement';
import SkillsManagement from './workspace-settings/SkillsManagement';
import EscalationTriggersManagement from './workspace-settings/EscalationTriggersManagement';

interface WorkspaceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace | null;
}

const WorkspaceSettingsModal: React.FC<WorkspaceSettingsModalProps> = ({ 
  open, 
  onOpenChange, 
  workspace 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allowGuestAccess, setAllowGuestAccess] = useState(false);
  const [defaultProjectVisibility, setDefaultProjectVisibility] = useState<'private' | 'workspace' | 'public'>('workspace');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [taskAssignments, setTaskAssignments] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const { updateWorkspace } = useWorkspace();
  const { toast } = useToast();

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description || '');
      setAllowGuestAccess(workspace.settings.allowGuestAccess);
      setDefaultProjectVisibility(workspace.settings.defaultProjectVisibility);
      setEmailNotifications(workspace.settings.notificationSettings.emailNotifications);
      setProjectUpdates(workspace.settings.notificationSettings.projectUpdates);
      setTaskAssignments(workspace.settings.notificationSettings.taskAssignments);
      setDeadlineReminders(workspace.settings.notificationSettings.deadlineReminders);
    }
  }, [workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !name.trim()) return;

    setIsLoading(true);
    
    try {
      updateWorkspace(workspace.id, {
        name: name.trim(),
        description: description.trim(),
        settings: {
          allowGuestAccess,
          defaultProjectVisibility,
          notificationSettings: {
            emailNotifications,
            projectUpdates,
            taskAssignments,
            deadlineReminders
          }
        }
      });
      
      toast({
        title: "Settings updated! ⚙️",
        description: "Workspace settings have been saved successfully.",
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error updating settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!workspace) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Workspace Settings</DialogTitle>
          <DialogDescription>
            Configure settings for {workspace.name}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Access & Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Access & Permissions</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Guest Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow people without accounts to view public projects
                </p>
              </div>
              <Switch
                checked={allowGuestAccess}
                onCheckedChange={setAllowGuestAccess}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="defaultVisibility">Default Project Visibility</Label>
              <Select 
                value={defaultProjectVisibility} 
                onValueChange={(value: 'private' | 'workspace' | 'public') => setDefaultProjectVisibility(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private - Only project members</SelectItem>
                  <SelectItem value="workspace">Workspace - All workspace members</SelectItem>
                  <SelectItem value="public">Public - Anyone with link</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Notification Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email notifications to workspace members
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Project Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when projects are created, updated, or completed
                </p>
              </div>
              <Switch
                checked={projectUpdates}
                onCheckedChange={setProjectUpdates}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Task Assignments</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when tasks are assigned or reassigned
                </p>
              </div>
              <Switch
                checked={taskAssignments}
                onCheckedChange={setTaskAssignments}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Deadline Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send reminders before project and task deadlines
                </p>
              </div>
              <Switch
                checked={deadlineReminders}
                onCheckedChange={setDeadlineReminders}
              />
            </div>
          </div>
          
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!name.trim() || isLoading}>
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentsManagement />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsManagement />
          </TabsContent>

          <TabsContent value="escalation">
            <EscalationTriggersManagement />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceSettingsModal;
