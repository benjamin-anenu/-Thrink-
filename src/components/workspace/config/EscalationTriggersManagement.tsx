
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EscalationTrigger {
  id: string;
  name: string;
  description?: string;
  condition_type: string;
  threshold_value?: number;
  threshold_unit?: string;
  is_active: boolean;
  created_at: string;
}

interface EscalationTriggersManagementProps {
  workspaceId: string;
}

const PREDEFINED_CONDITIONS = [
  { value: 'task_overdue', label: 'Task Overdue', requiresThreshold: true, units: ['hours', 'days'] },
  { value: 'project_delay', label: 'Project Delay', requiresThreshold: true, units: ['days', 'weeks'] },
  { value: 'budget_overrun', label: 'Budget Overrun', requiresThreshold: true, units: ['percent', 'amount'] },
  { value: 'resource_overallocation', label: 'Resource Over-allocation', requiresThreshold: true, units: ['percent'] },
  { value: 'milestone_missed', label: 'Milestone Missed', requiresThreshold: false, units: [] },
  { value: 'risk_level_high', label: 'Risk Level High', requiresThreshold: false, units: [] },
  { value: 'quality_below_threshold', label: 'Quality Below Threshold', requiresThreshold: true, units: ['percent', 'score'] },
  { value: 'stakeholder_complaint', label: 'Stakeholder Complaint', requiresThreshold: false, units: [] },
  { value: 'team_unavailable', label: 'Team Member Unavailable', requiresThreshold: true, units: ['days'] },
  { value: 'deliverable_rejected', label: 'Deliverable Rejected', requiresThreshold: true, units: ['times'] }
];

const EscalationTriggersManagement: React.FC<EscalationTriggersManagementProps> = ({ workspaceId }) => {
  const [triggers, setTriggers] = useState<EscalationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<EscalationTrigger | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    condition_type: '',
    threshold_value: '',
    threshold_unit: '',
    is_active: true
  });

  useEffect(() => {
    fetchTriggers();
  }, [workspaceId]);

  const fetchTriggers = async () => {
    try {
      const { data, error } = await supabase
        .from('escalation_triggers')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('name');

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error('Error fetching escalation triggers:', error);
      toast.error('Failed to load escalation triggers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        condition_type: formData.condition_type,
        threshold_value: formData.threshold_value ? parseInt(formData.threshold_value) : null,
        threshold_unit: formData.threshold_unit || null,
        is_active: formData.is_active,
        workspace_id: workspaceId
      };

      if (editingTrigger) {
        const { error } = await supabase
          .from('escalation_triggers')
          .update(data)
          .eq('id', editingTrigger.id);

        if (error) throw error;
        toast.success('Escalation trigger updated successfully');
      } else {
        const { error } = await supabase
          .from('escalation_triggers')
          .insert(data);

        if (error) throw error;
        toast.success('Escalation trigger created successfully');
      }

      setFormData({ name: '', description: '', condition_type: '', threshold_value: '', threshold_unit: '', is_active: true });
      setEditingTrigger(null);
      setShowDialog(false);
      fetchTriggers();
    } catch (error) {
      console.error('Error saving escalation trigger:', error);
      toast.error('Failed to save escalation trigger');
    }
  };

  const handleEdit = (trigger: EscalationTrigger) => {
    setEditingTrigger(trigger);
    setFormData({
      name: trigger.name,
      description: trigger.description || '',
      condition_type: trigger.condition_type,
      threshold_value: trigger.threshold_value?.toString() || '',
      threshold_unit: trigger.threshold_unit || '',
      is_active: trigger.is_active
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this escalation trigger?')) return;

    try {
      const { error } = await supabase
        .from('escalation_triggers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Escalation trigger deleted successfully');
      fetchTriggers();
    } catch (error) {
      console.error('Error deleting escalation trigger:', error);
      toast.error('Failed to delete escalation trigger');
    }
  };

  const selectedCondition = PREDEFINED_CONDITIONS.find(c => c.value === formData.condition_type);

  if (loading) {
    return <div>Loading escalation triggers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Escalation Triggers Management</h3>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTrigger(null);
              setFormData({ name: '', description: '', condition_type: '', threshold_value: '', threshold_unit: '', is_active: true });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Escalation Trigger
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingTrigger ? 'Edit Escalation Trigger' : 'Add New Escalation Trigger'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Trigger Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="condition_type">Condition Type</Label>
                <Select
                  value={formData.condition_type}
                  onValueChange={(value) => setFormData({ ...formData, condition_type: value, threshold_unit: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREDEFINED_CONDITIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCondition?.requiresThreshold && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="threshold_value">Threshold Value</Label>
                    <Input
                      id="threshold_value"
                      type="number"
                      value={formData.threshold_value}
                      onChange={(e) => setFormData({ ...formData, threshold_value: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="threshold_unit">Unit</Label>
                    <Select
                      value={formData.threshold_unit}
                      onValueChange={(value) => setFormData({ ...formData, threshold_unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCondition.units.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked as boolean })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingTrigger ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {triggers.map((trigger) => (
                <TableRow key={trigger.id}>
                  <TableCell className="font-medium">{trigger.name}</TableCell>
                  <TableCell>
                    {PREDEFINED_CONDITIONS.find(c => c.value === trigger.condition_type)?.label || trigger.condition_type}
                  </TableCell>
                  <TableCell>
                    {trigger.threshold_value && trigger.threshold_unit
                      ? `${trigger.threshold_value} ${trigger.threshold_unit}`
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={trigger.is_active ? "default" : "secondary"}>
                      {trigger.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(trigger.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(trigger)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(trigger.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalationTriggersManagement;
