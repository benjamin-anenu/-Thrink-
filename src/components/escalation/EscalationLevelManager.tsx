
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { useEscalationLevels } from '@/hooks/useEscalationLevels';
import { useEscalationAssignments } from '@/hooks/useEscalationAssignments';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface EscalationLevelManagerProps {
  onLevelChange?: () => void;
}

const EscalationLevelManager: React.FC<EscalationLevelManagerProps> = ({ onLevelChange }) => {
  const [showLevelDialog, setShowLevelDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    level_order: 1
  });

  const { currentWorkspace } = useWorkspace();
  const { levels, createLevel, updateLevel, deleteLevel } = useEscalationLevels();
  const { getAssignmentsByLevel } = useEscalationAssignments();

  const handleSubmit = async () => {
    if (!formData.name.trim()) return;
    
    if (editingLevel) {
      await updateLevel(editingLevel.id, formData);
    } else {
      await createLevel(formData.name, formData.level_order);
    }
    
    setShowLevelDialog(false);
    resetForm();
    onLevelChange?.();
  };

  const resetForm = () => {
    setFormData({ name: '', level_order: 1 });
    setEditingLevel(null);
  };

  const openDialog = (level?: any) => {
    if (level) {
      setEditingLevel(level);
      setFormData({
        name: level.name,
        level_order: level.level_order
      });
    } else {
      setEditingLevel(null);
      setFormData({
        name: '',
        level_order: Math.max(...levels.map(l => l.level_order), 0) + 1
      });
    }
    setShowLevelDialog(true);
  };

  const handleDelete = async (levelId: string) => {
    const assignments = getAssignmentsByLevel(levelId);
    if (assignments.length > 0) {
      alert('Cannot delete level with existing assignments. Please remove all assignments first.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this escalation level?')) {
      await deleteLevel(levelId);
      onLevelChange?.();
    }
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please select a workspace to manage escalation levels</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Escalation Level Management</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage escalation levels with proper hierarchy
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus size={16} className="mr-2" />
          Add Level
        </Button>
      </div>

      {/* Escalation Levels List */}
      <div className="space-y-3">
        {levels.sort((a, b) => a.level_order - b.level_order).map((level) => {
          const assignments = getAssignmentsByLevel(level.id);
          
          return (
            <Card key={level.id} className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                      {level.level_order}
                    </div>
                    <div>
                      <div className="font-medium">{level.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {assignments.length} assignments
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(level)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(level.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {levels.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No escalation levels configured</p>
            <Button onClick={() => openDialog()}>
              <Plus size={16} className="mr-2" />
              Create First Level
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Level Dialog */}
      <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLevel ? 'Edit Escalation Level' : 'Create Escalation Level'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Level Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Team Lead, Manager, Executive"
              />
            </div>
            <div>
              <Label htmlFor="level_order">Level Order</Label>
              <Input
                id="level_order"
                type="number"
                value={formData.level_order}
                onChange={(e) => setFormData({ ...formData, level_order: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowLevelDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingLevel ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EscalationLevelManager;
