
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, AlertTriangle, Users, Link } from 'lucide-react';
import { useEscalationTriggers } from '@/hooks/useEscalationTriggers';
import { useEscalationLevels } from '@/hooks/useEscalationLevels';
import { useEscalationAssignments } from '@/hooks/useEscalationAssignments';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface TriggerAssignmentInterfaceProps {
  onAssignmentChange?: () => void;
}

const TriggerAssignmentInterface: React.FC<TriggerAssignmentInterfaceProps> = ({ onAssignmentChange }) => {
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [selectedStakeholder, setSelectedStakeholder] = useState<string>('');

  const { currentWorkspace } = useWorkspace();
  const { triggers } = useEscalationTriggers();
  const { levels } = useEscalationLevels();
  const { assignments, createAssignment, deleteAssignment, getAssignmentsByLevel } = useEscalationAssignments();
  const { stakeholders } = useStakeholders();

  const handleCreateAssignment = async () => {
    if (!selectedLevel || !selectedTrigger || !selectedStakeholder) return;
    
    await createAssignment(selectedLevel, selectedStakeholder, selectedTrigger);
    setShowAssignmentDialog(false);
    resetForm();
    onAssignmentChange?.();
  };

  const resetForm = () => {
    setSelectedLevel('');
    setSelectedTrigger('');
    setSelectedStakeholder('');
  };

  const getTriggerColor = (conditionType: string) => {
    const colorMap: Record<string, string> = {
      'task_overdue': 'bg-red-100 text-red-800',
      'budget_exceeded': 'bg-orange-100 text-orange-800',
      'milestone_delay': 'bg-yellow-100 text-yellow-800',
      'resource_overallocation': 'bg-purple-100 text-purple-800',
      'quality_score': 'bg-blue-100 text-blue-800',
      'communication_gap': 'bg-green-100 text-green-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colorMap[conditionType] || colorMap['default'];
  };

  const getUnassignedTriggers = () => {
    const assignedTriggerIds = assignments.map(a => a.trigger_id);
    return triggers.filter(trigger => !assignedTriggerIds.includes(trigger.id));
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please select a workspace to manage trigger assignments</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Trigger Assignment Management</h3>
          <p className="text-sm text-muted-foreground">
            Assign escalation triggers to levels and stakeholders
          </p>
        </div>
        <Button 
          onClick={() => setShowAssignmentDialog(true)}
          disabled={getUnassignedTriggers().length === 0}
        >
          <Plus size={16} className="mr-2" />
          Assign Trigger
        </Button>
      </div>

      {/* Trigger Assignment Visual Map */}
      <div className="grid gap-4">
        {levels.sort((a, b) => a.level_order - b.level_order).map((level) => {
          const levelAssignments = getAssignmentsByLevel(level.id);
          
          return (
            <Card key={level.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {level.level_order}
                    </div>
                    <span>{level.name}</span>
                    <Badge variant="secondary">{levelAssignments.length} assignments</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {levelAssignments.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Link className="h-8 w-8 mx-auto mb-2" />
                    <p>No triggers assigned to this level</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {levelAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">{assignment.trigger.name}</span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={getTriggerColor(assignment.trigger.condition_type)}
                          >
                            {assignment.trigger.threshold_value} {assignment.trigger.threshold_unit}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="text-sm">{assignment.stakeholder.name}</span>
                          </div>
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
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Unassigned Triggers */}
      {getUnassignedTriggers().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Unassigned Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getUnassignedTriggers().map((trigger) => (
                <div key={trigger.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{trigger.name}</div>
                      <div className="text-sm text-muted-foreground">{trigger.description}</div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getTriggerColor(trigger.condition_type)}
                    >
                      {trigger.threshold_value} {trigger.threshold_unit}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assignment Dialog */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Trigger to Level</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="level">Escalation Level</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select escalation level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.sort((a, b) => a.level_order - b.level_order).map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                          {level.level_order}
                        </div>
                        <span>{level.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="trigger">Escalation Trigger</Label>
              <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger" />
                </SelectTrigger>
                <SelectContent>
                  {getUnassignedTriggers().map((trigger) => (
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

            <div>
              <Label htmlFor="stakeholder">Assigned Stakeholder</Label>
              <Select value={selectedStakeholder} onValueChange={setSelectedStakeholder}>
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
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowAssignmentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAssignment}
              disabled={!selectedLevel || !selectedTrigger || !selectedStakeholder}
            >
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TriggerAssignmentInterface;
