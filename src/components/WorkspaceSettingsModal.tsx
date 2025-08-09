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
import RecycleBin from './workspace-settings/RecycleBin';
import { supabase } from '@/integrations/supabase/client';

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
  const [currency, setCurrency] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('');
  
  const { updateWorkspace, refreshWorkspaces } = useWorkspace();
  const { toast } = useToast();

  // Supported values (fallback to minimal lists if not available)
  const supportedCurrencies: string[] = (Intl as any).supportedValuesOf
    ? (Intl as any).supportedValuesOf('currency')
    : ['USD', 'EUR', 'GBP', 'NGN'];
  const supportedTimeZones: string[] = (Intl as any).supportedValuesOf
    ? (Intl as any).supportedValuesOf('timeZone')
    : [Intl.DateTimeFormat().resolvedOptions().timeZone];

  const formatCurrencyLabel = (code: string) => {
    try {
      const parts = new Intl.NumberFormat(undefined, { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }).formatToParts(1);
      const symbol = parts.find(p => p.type === 'currency')?.value || code;
      return `${code} (${symbol})`;
    } catch {
      return code;
    }
  };

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
      setCurrency(workspace.settings.currency || '');
      setTimeZone(workspace.settings.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);

      // If currency/timezone not set, try to detect from IP
      const detectDefaults = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          if (!workspace.settings.currency && data?.currency) setCurrency(data.currency);
          if (!workspace.settings.timeZone && data?.timezone) setTimeZone(data.timezone);
        } catch {
          // ignore network errors and keep fallbacks
        }
      };
      if (!workspace.settings.currency || !workspace.settings.timeZone) {
        detectDefaults();
      }
    }
  }, [workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !name.trim()) return;

    setIsLoading(true);
    
    try {
      const newSettings = {
        allowGuestAccess,
        defaultProjectVisibility,
        currency: currency || 'USD',
        timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        notificationSettings: {
          emailNotifications,
          projectUpdates,
          taskAssignments,
          deadlineReminders,
        },
      };

      const { error } = await supabase.rpc('update_workspace_settings', {
        p_workspace_id: workspace.id,
        p_name: name.trim(),
        p_description: description.trim(),
        p_settings: newSettings,
      });

      if (error) throw error;

      // Optimistic local update + ensure state refresh from DB
      updateWorkspace(workspace.id, {
        name: name.trim(),
        description: description.trim(),
        settings: newSettings,
      });
      await refreshWorkspaces();

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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
            <TabsTrigger value="recycle-bin">Recycle Bin</TabsTrigger>
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

              {/* Regional Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Regional Settings</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedCurrencies.map((code) => (
                          <SelectItem key={code} value={code}>{formatCurrencyLabel(code)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select value={timeZone} onValueChange={setTimeZone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedTimeZones.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

          <TabsContent value="recycle-bin">
            <RecycleBin />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceSettingsModal;
