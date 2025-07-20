
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EscalationTrigger {
  id: string;
  name: string;
  description?: string;
  condition: string;
  created_at: string;
}

interface EscalationTriggersManagementProps {
  workspaceId: string;
}

const EscalationTriggersManagement: React.FC<EscalationTriggersManagementProps> = ({ workspaceId }) => {
  const [triggers, setTriggers] = useState<EscalationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<EscalationTrigger | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', condition: '' });

  useEffect(() => {
    fetchTriggers();
  }, [workspaceId]);

  const fetchTriggers = async () => {
    try {
      const { data, error } = await supabase
        .from('escalation_triggers')
        .select('id, name, description, condition, created_at')
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
      if (editingTrigger) {
        const { error } = await supabase
          .from('escalation_triggers')
          .update({
            name: formData.name,
            description: formData.description,
            condition: formData.condition
          })
          .eq('id', editingTrigger.id);

        if (error) throw error;
        toast.success('Escalation trigger updated successfully');
      } else {
        const { error } = await supabase
          .from('escalation_triggers')
          .insert({
            name: formData.name,
            description: formData.description,
            condition: formData.condition,
            workspace_id: workspaceId
          });

        if (error) throw error;
        toast.success('Escalation trigger created successfully');
      }

      setFormData({ name: '', description: '', condition: '' });
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
      condition: trigger.condition 
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
              setFormData({ name: '', description: '', condition: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Trigger
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <Input
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  placeholder="e.g., task_overdue > 3_days"
                  required
                />
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
                <TableHead>Description</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {triggers.map((trigger) => (
                <TableRow key={trigger.id}>
                  <TableCell className="font-medium">{trigger.name}</TableCell>
                  <TableCell>{trigger.description}</TableCell>
                  <TableCell>{trigger.condition}</TableCell>
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
