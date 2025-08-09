import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useEscalationTriggers } from '@/hooks/useEscalationTriggers';
import { AlertTriangle, Plus, Edit, Trash2, Globe } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EscalationTriggersManagement: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const { triggers, loading, createTrigger, updateTrigger, deleteTrigger } = useEscalationTriggers();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condition_type: '',
    threshold_value: 1,
    threshold_unit: 'day'
  });

  // Filter for workspace-level triggers only (project_id = null)
  const workspaceTriggers = triggers.filter(trigger => !trigger.project_id);

  const handleSubmit = async () => {
    if (editingTrigger) {
      await updateTrigger(editingTrigger.id, formData);
    } else {
      await createTrigger(
        formData.name,
        formData.description,
        formData.condition_type,
        formData.threshold_value,
        formData.threshold_unit,
        false // isProjectSpecific = false for workspace-level
      );
    }
    setShowCreateDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      condition_type: '',
      threshold_value: 1,
      threshold_unit: 'day'
    });
    setEditingTrigger(null);
  };

  const openDialog = (trigger?: any) => {
    if (trigger) {
      setEditingTrigger(trigger);
      setFormData({
        name: trigger.name,
        description: trigger.description || '',
        condition_type: trigger.condition_type,
        threshold_value: trigger.threshold_value,
        threshold_unit: trigger.threshold_unit
      });
    } else {
      resetForm();
    }
    setShowCreateDialog(true);
  };

  const getTriggerColor = (conditionType: string) => {
    const colorMap: Record<string, string> = {
      'task_overdue': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'budget_exceeded': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'milestone_delay': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'resource_overallocation': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'quality_score': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'communication_gap': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'default': 'bg-muted text-muted-foreground'
    };
    return colorMap[conditionType] || colorMap['default'];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Workspace Escalation Triggers
              </CardTitle>
              <CardDescription>
                Create global triggers that apply to all projects in this workspace
              </CardDescription>
            </div>
            <Button onClick={() => openDialog()}>
              <Plus size={16} className="mr-2" />
              Create Trigger
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center text-muted-foreground py-8">
              Loading escalation triggers...
            </div>
          ) : workspaceTriggers.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No workspace triggers configured yet</p>
              <p className="text-sm">Create your first trigger to apply across all projects</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workspaceTriggers.map(trigger => (
                <div key={trigger.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{trigger.name}</span>
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        Workspace
                      </Badge>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={getTriggerColor(trigger.condition_type)}
                    >
                      {trigger.threshold_value} {trigger.threshold_unit}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(trigger)}
                    >
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTrigger(trigger.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Workspace triggers automatically apply to all projects. Create project-specific triggers in the project's escalation matrix.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTrigger ? 'Edit Workspace Trigger' : 'Create Workspace Trigger'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Trigger Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Task Overdue Alert"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe when this trigger should activate"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="condition_type">Condition Type</Label>
              <Select value={formData.condition_type} onValueChange={(value) => setFormData({ ...formData, condition_type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task_overdue">Task Overdue</SelectItem>
                  <SelectItem value="budget_exceeded">Budget Exceeded</SelectItem>
                  <SelectItem value="milestone_delay">Milestone Delay</SelectItem>
                  <SelectItem value="resource_overallocation">Resource Overallocation</SelectItem>
                  <SelectItem value="quality_score">Quality Score Low</SelectItem>
                  <SelectItem value="communication_gap">Communication Gap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="threshold_value">Threshold</Label>
                <Input
                  id="threshold_value"
                  type="number"
                  value={formData.threshold_value}
                  onChange={(e) => setFormData({ ...formData, threshold_value: parseInt(e.target.value) || 1 })}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="threshold_unit">Unit</Label>
                <Select value={formData.threshold_unit} onValueChange={(value) => setFormData({ ...formData, threshold_unit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">Hour(s)</SelectItem>
                    <SelectItem value="day">Day(s)</SelectItem>
                    <SelectItem value="week">Week(s)</SelectItem>
                    <SelectItem value="percent">Percent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.name || !formData.condition_type}
            >
              {editingTrigger ? 'Update' : 'Create'} Trigger
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EscalationTriggersManagement;
