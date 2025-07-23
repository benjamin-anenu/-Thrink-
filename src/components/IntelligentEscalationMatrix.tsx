
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Users, AlertTriangle, Settings } from 'lucide-react';
import { useEscalationLevels } from '@/hooks/useEscalationLevels';
import { useEscalationAssignments } from '@/hooks/useEscalationAssignments';
import { useEscalationTriggers } from '@/hooks/useEscalationTriggers';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface IntelligentEscalationMatrixProps {
  projectId?: string;
}

const IntelligentEscalationMatrix: React.FC<IntelligentEscalationMatrixProps> = ({ projectId }) => {
  const [showLevelDialog, setShowLevelDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    level_order: 1,
    stakeholder_id: '',
    trigger_id: ''
  });

  const { currentWorkspace } = useWorkspace();
  const { levels, loading: levelsLoading, createLevel, updateLevel, deleteLevel } = useEscalationLevels();
  const { assignments, loading: assignmentsLoading, createAssignment, deleteAssignment, getAssignmentsByLevel } = useEscalationAssignments();
  const { triggers, loading: triggersLoading } = useEscalationTriggers();
  const { stakeholders, loading: stakeholdersLoading } = useStakeholders();

  const handleCreateLevel = async () => {
    if (!formData.name.trim()) return;
    
    if (editingLevel) {
      await updateLevel(editingLevel.id, {
        name: formData.name,
        level_order: formData.level_order
      });
    } else {
      await createLevel(formData.name, formData.level_order);
    }
    
    setShowLevelDialog(false);
    setEditingLevel(null);
    setFormData({ name: '', level_order: 1, stakeholder_id: '', trigger_id: '' });
  };

  const handleCreateAssignment = async () => {
    if (!selectedLevel || !formData.stakeholder_id || !formData.trigger_id) return;
    
    await createAssignment(selectedLevel, formData.stakeholder_id, formData.trigger_id);
    setShowAssignmentDialog(false);
    setFormData({ name: '', level_order: 1, stakeholder_id: '', trigger_id: '' });
  };

  const openLevelDialog = (level?: any) => {
    if (level) {
      setEditingLevel(level);
      setFormData({
        name: level.name,
        level_order: level.level_order,
        stakeholder_id: '',
        trigger_id: ''
      });
    } else {
      setEditingLevel(null);
      setFormData({
        name: '',
        level_order: Math.max(...levels.map(l => l.level_order), 0) + 1,
        stakeholder_id: '',
        trigger_id: ''
      });
    }
    setShowLevelDialog(true);
  };

  const openAssignmentDialog = (levelId: string) => {
    setSelectedLevel(levelId);
    setFormData({ name: '', level_order: 1, stakeholder_id: '', trigger_id: '' });
    setShowAssignmentDialog(true);
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please select a workspace to manage escalation matrix</p>
        </CardContent>
      </Card>
    );
  }

  if (levelsLoading || assignmentsLoading || triggersLoading || stakeholdersLoading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-muted-foreground">Loading escalation matrix...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Intelligent Escalation Matrix</h2>
          <p className="text-muted-foreground">
            Configure automated escalation levels with stakeholder assignments and triggers
          </p>
        </div>
        <Button onClick={() => openLevelDialog()}>
          <Plus size={16} className="mr-2" />
          Add Level
        </Button>
      </div>

      {levels.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No escalation levels configured</p>
            <Button onClick={() => openLevelDialog()}>
              <Plus size={16} className="mr-2" />
              Create First Level
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {levels.sort((a, b) => a.level_order - b.level_order).map((level) => {
            const levelAssignments = getAssignmentsByLevel(level.id);
            
            return (
              <Card key={level.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Level {level.level_order}: {level.name}
                        <Badge variant="outline">{levelAssignments.length} assignments</Badge>
                      </CardTitle>
                      <CardDescription>
                        {levelAssignments.length === 0 
                          ? 'No assignments configured' 
                          : `${levelAssignments.length} stakeholder-trigger assignments`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAssignmentDialog(level.id)}
                      >
                        <Plus size={16} className="mr-1" />
                        Assign
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openLevelDialog(level)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteLevel(level.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {levelAssignments.length > 0 && (
                  <CardContent>
                    <div className="space-y-3">
                      {levelAssignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-primary" />
                            <div>
                              <div className="font-medium">{assignment.stakeholder.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {assignment.stakeholder.email} • {assignment.stakeholder.role}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {assignment.trigger.name}
                            </Badge>
                            <Badge variant="outline">
                              {assignment.trigger.threshold_value} {assignment.trigger.threshold_unit}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAssignment(assignment.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Level Creation/Edit Dialog */}
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
            <Button onClick={handleCreateLevel}>
              {editingLevel ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Stakeholder & Trigger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stakeholder">Stakeholder</Label>
              <Select value={formData.stakeholder_id} onValueChange={(value) => setFormData({ ...formData, stakeholder_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stakeholder" />
                </SelectTrigger>
                <SelectContent>
                  {stakeholders.map((stakeholder) => (
                    <SelectItem key={stakeholder.id} value={stakeholder.id}>
                      <div className="flex flex-col">
                        <span>{stakeholder.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {stakeholder.email} • {stakeholder.role}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="trigger">Escalation Trigger</Label>
              <Select value={formData.trigger_id} onValueChange={(value) => setFormData({ ...formData, trigger_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  {triggers.map((trigger) => (
                    <SelectItem key={trigger.id} value={trigger.id}>
                      <div className="flex flex-col">
                        <span>{trigger.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {trigger.description} • {trigger.threshold_value} {trigger.threshold_unit}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAssignment}>
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntelligentEscalationMatrix;
