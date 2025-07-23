
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit2, Save, X, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { useEscalationTriggers } from '@/hooks/useEscalationTriggers';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';

const EscalationTriggersManagement = () => {
  const { currentWorkspace } = useWorkspace();
  const { triggers, loading, createTrigger, updateTrigger } = useEscalationTriggers();
  const [editingTrigger, setEditingTrigger] = useState<any>(null);
  const [newTrigger, setNewTrigger] = useState({
    name: '',
    description: '',
    condition_type: 'task_overdue',
    threshold_value: 1,
    threshold_unit: 'days',
    is_active: true
  });

  const conditionTypes = [
    { 
      value: 'task_overdue', 
      label: 'Task Overdue', 
      icon: Clock,
      description: 'Triggers when a task is overdue by specified days'
    },
    { 
      value: 'project_delay', 
      label: 'Project Delay', 
      icon: TrendingUp,
      description: 'Triggers when project is delayed beyond threshold'
    },
    { 
      value: 'resource_overload', 
      label: 'Resource Overload', 
      icon: AlertTriangle,
      description: 'Triggers when resource utilization exceeds threshold'
    },
    { 
      value: 'budget_overrun', 
      label: 'Budget Overrun', 
      icon: TrendingUp,
      description: 'Triggers when budget exceeds allocated amount'
    }
  ];

  // Filter triggers to show only workspace-specific ones for unassigned triggers
  const workspaceTriggers = triggers.filter(trigger => 
    trigger.workspace_id === currentWorkspace?.id
  );

  const globalTriggers = triggers.filter(trigger => 
    trigger.workspace_id === null
  );

  const handleCreateTrigger = async () => {
    if (!newTrigger.name.trim()) {
      toast.error('Please enter a trigger name');
      return;
    }

    try {
      await createTrigger({
        ...newTrigger,
        workspace_id: currentWorkspace?.id || null
      });
      
      setNewTrigger({
        name: '',
        description: '',
        condition_type: 'task_overdue',
        threshold_value: 1,
        threshold_unit: 'days',
        is_active: true
      });
      
      toast.success('Trigger created successfully');
    } catch (error) {
      toast.error('Failed to create trigger');
    }
  };

  const handleUpdateTrigger = async (triggerId: string, updates: any) => {
    try {
      await updateTrigger(triggerId, updates);
      setEditingTrigger(null);
      toast.success('Trigger updated successfully');
    } catch (error) {
      toast.error('Failed to update trigger');
    }
  };

  const TriggerCard = ({ trigger, isEditable = true }: { trigger: any, isEditable?: boolean }) => {
    const conditionType = conditionTypes.find(ct => ct.value === trigger.condition_type);
    const Icon = conditionType?.icon || AlertTriangle;
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-sm">{trigger.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {conditionType?.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={trigger.is_active ? "default" : "secondary"}>
                {trigger.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {isEditable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTrigger(trigger)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Condition:</span>
              <span className="font-medium">{conditionType?.label}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Threshold:</span>
              <span className="font-medium">
                {trigger.threshold_value} {trigger.threshold_unit}
              </span>
            </div>
            
            {trigger.description && (
              <div className="text-sm">
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1 text-foreground">{trigger.description}</p>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <Switch
                checked={trigger.is_active}
                onCheckedChange={(checked) => 
                  isEditable && handleUpdateTrigger(trigger.id, { is_active: checked })
                }
                disabled={!isEditable}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading triggers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Escalation Triggers</h3>
          <p className="text-sm text-muted-foreground">
            Configure when escalations should be triggered
          </p>
        </div>
      </div>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workspace">Workspace Triggers</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned Triggers</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Active Workspace Triggers</h4>
            <Badge variant="outline">{workspaceTriggers.length} triggers</Badge>
          </div>
          
          {workspaceTriggers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No workspace-specific triggers configured yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workspaceTriggers.map(trigger => (
                <TriggerCard key={trigger.id} trigger={trigger} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="unassigned" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Available Triggers for Assignment</h4>
            <Badge variant="outline">{globalTriggers.filter(t => t.is_active).length} available</Badge>
          </div>
          
          {globalTriggers.filter(t => t.is_active).length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No unassigned triggers available for this workspace
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {globalTriggers.filter(t => t.is_active).map(trigger => (
                <TriggerCard key={trigger.id} trigger={trigger} isEditable={false} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Trigger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trigger-name">Trigger Name</Label>
                  <Input
                    id="trigger-name"
                    value={newTrigger.name}
                    onChange={(e) => setNewTrigger(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter trigger name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="condition-type">Condition Type</Label>
                  <select
                    id="condition-type"
                    value={newTrigger.condition_type}
                    onChange={(e) => setNewTrigger(prev => ({ ...prev, condition_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    {conditionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="threshold-value">Threshold Value</Label>
                  <Input
                    id="threshold-value"
                    type="number"
                    value={newTrigger.threshold_value}
                    onChange={(e) => setNewTrigger(prev => ({ ...prev, threshold_value: parseInt(e.target.value) }))}
                    placeholder="Enter threshold value"
                  />
                </div>
                
                <div>
                  <Label htmlFor="threshold-unit">Threshold Unit</Label>
                  <select
                    id="threshold-unit"
                    value={newTrigger.threshold_unit}
                    onChange={(e) => setNewTrigger(prev => ({ ...prev, threshold_unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="days">Days</option>
                    <option value="hours">Hours</option>
                    <option value="percent">Percent</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="trigger-description">Description</Label>
                <Textarea
                  id="trigger-description"
                  value={newTrigger.description}
                  onChange={(e) => setNewTrigger(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter trigger description"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={newTrigger.is_active}
                  onCheckedChange={(checked) => setNewTrigger(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>

              <Button onClick={handleCreateTrigger} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Trigger
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Trigger Modal */}
      {editingTrigger && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Trigger</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTrigger(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Trigger Name</Label>
                <Input
                  id="edit-name"
                  value={editingTrigger.name}
                  onChange={(e) => setEditingTrigger(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-threshold">Threshold Value</Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  value={editingTrigger.threshold_value}
                  onChange={(e) => setEditingTrigger(prev => ({ ...prev, threshold_value: parseInt(e.target.value) }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTrigger.description}
                  onChange={(e) => setEditingTrigger(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingTrigger.is_active}
                  onCheckedChange={(checked) => setEditingTrigger(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Active</Label>
              </div>
              
              <Button 
                onClick={() => handleUpdateTrigger(editingTrigger.id, editingTrigger)}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EscalationTriggersManagement;
