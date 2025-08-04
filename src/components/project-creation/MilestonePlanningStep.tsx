import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Plus, Trash2, Flag, Target, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

interface Milestone {
  id: string;
  name: string;
  description: string;
  targetDate: Date;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Planned' | 'In Progress' | 'Completed' | 'At Risk';
  dependencies: string[];
  deliverables: string[];
  criteria: string[];
  assignedTo: string[];
  phaseId?: string;
}

interface MilestonePlanningStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const MilestonePlanningStep: React.FC<MilestonePlanningStepProps> = ({ data, onDataChange }) => {
  const [milestones, setMilestones] = useState<Milestone[]>(data.milestones || []);
  const [newMilestone, setNewMilestone] = useState<Partial<Milestone>>({
    priority: 'Medium',
    status: 'Planned',
    dependencies: [],
    deliverables: [],
    criteria: [],
    assignedTo: [],
    phaseId: ''
  });

  const priorities = [
    { value: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { value: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    { value: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
    { value: 'Critical', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
  ];

  const statusOptions = [
    { value: 'Planned', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    { value: 'In Progress', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
    { value: 'Completed', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { value: 'At Risk', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
  ];

  const stakeholders = data.stakeholders || [];

  const addMilestone = () => {
    if (newMilestone.name && newMilestone.targetDate) {
      const milestone: Milestone = {
        id: Date.now().toString(),
        name: newMilestone.name,
        description: newMilestone.description || '',
        targetDate: newMilestone.targetDate,
        priority: newMilestone.priority || 'Medium',
        status: 'Planned',
        dependencies: newMilestone.dependencies || [],
        deliverables: newMilestone.deliverables || [],
        criteria: newMilestone.criteria || [],
        assignedTo: newMilestone.assignedTo || [],
        phaseId: newMilestone.phaseId
      };
      
      const updatedMilestones = [...milestones, milestone];
      setMilestones(updatedMilestones);
      setNewMilestone({
        priority: 'Medium',
        status: 'Planned',
        dependencies: [],
        deliverables: [],
        criteria: [],
        assignedTo: [],
        phaseId: ''
      });
      
      onDataChange({
        ...data,
        milestones: updatedMilestones
      });
    }
  };

  const removeMilestone = (id: string) => {
    const updatedMilestones = milestones.filter(m => m.id !== id);
    setMilestones(updatedMilestones);
    onDataChange({
      ...data,
      milestones: updatedMilestones
    });
  };

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    const updatedMilestones = milestones.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    setMilestones(updatedMilestones);
    onDataChange({
      ...data,
      milestones: updatedMilestones
    });
  };

  const addDeliverable = (milestoneId: string, deliverable: string) => {
    if (deliverable.trim()) {
      const milestone = milestones.find(m => m.id === milestoneId);
      if (milestone) {
        updateMilestone(milestoneId, {
          deliverables: [...milestone.deliverables, deliverable.trim()]
        });
      }
    }
  };

  const removeDeliverable = (milestoneId: string, index: number) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (milestone) {
      updateMilestone(milestoneId, {
        deliverables: milestone.deliverables.filter((_, i) => i !== index)
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || '';
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || '';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Milestone Planning</h3>
        <p className="text-sm text-muted-foreground">
          Define project milestones, deliverables, and success criteria
        </p>
      </div>

      {/* Add New Milestone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag size={20} />
            Add Milestone
          </CardTitle>
          <CardDescription>
            Create milestones to track project progress and deliverables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="milestoneName">Milestone Name</Label>
              <Input
                id="milestoneName"
                value={newMilestone.name || ''}
                onChange={(e) => setNewMilestone({...newMilestone, name: e.target.value})}
                placeholder="e.g., Phase 1 Completion"
              />
            </div>
            <div>
              <Label>Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newMilestone.targetDate ? format(newMilestone.targetDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newMilestone.targetDate}
                    onSelect={(date) => setNewMilestone({...newMilestone, targetDate: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="milestoneDescription">Description</Label>
            <Textarea
              id="milestoneDescription"
              value={newMilestone.description || ''}
              onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
              placeholder="Describe what this milestone represents"
            />
          </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Priority</Label>
                <Select 
                  value={newMilestone.priority} 
                  onValueChange={(value) => setNewMilestone({...newMilestone, priority: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Phase</Label>
                <Select 
                  value={newMilestone.phaseId || ''} 
                  onValueChange={(value) => setNewMilestone({...newMilestone, phaseId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-phase">No Phase</SelectItem>
                    {(data.phases || []).map((phase: any) => (
                      <SelectItem key={phase.id} value={phase.id}>
                        {phase.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assigned To</Label>
                <Select 
                  value={newMilestone.assignedTo?.[0] || ''} 
                  onValueChange={(value) => setNewMilestone({...newMilestone, assignedTo: [value]})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stakeholder" />
                  </SelectTrigger>
                  <SelectContent>
                    {stakeholders.map((stakeholder: any) => (
                      <SelectItem key={stakeholder.id} value={stakeholder.id}>
                        {stakeholder.name} ({stakeholder.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

          <Button onClick={addMilestone} className="w-full">
            <Plus size={16} className="mr-2" />
            Add Milestone
          </Button>
        </CardContent>
      </Card>

      {/* Existing Milestones */}
      <div className="space-y-4">
        {milestones
          .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
          .map((milestone, index) => (
          <Card key={milestone.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                    {index > 0 && <ArrowRight size={14} className="text-muted-foreground" />}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target size={18} />
                      {milestone.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPriorityColor(milestone.priority)}>
                        {milestone.priority}
                      </Badge>
                      <Badge className={getStatusColor(milestone.status)}>
                        {milestone.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Due: {format(milestone.targetDate, 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMilestone(milestone.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestone.description && (
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
              )}

              <div>
                <Label className="text-sm font-medium">Deliverables</Label>
                <div className="space-y-2 mt-2">
                  {milestone.deliverables.map((deliverable, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <span className="text-sm">{deliverable}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDeliverable(milestone.id, idx)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add deliverable..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addDeliverable(milestone.id, e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="text-sm"
                    />
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                        if (input) {
                          addDeliverable(milestone.id, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>
              </div>

              {milestone.assignedTo.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <div className="flex gap-2 mt-1">
                    {milestone.assignedTo.map(assigneeId => {
                      const stakeholder = stakeholders.find((s: any) => s.id === assigneeId);
                      return stakeholder ? (
                        <Badge key={assigneeId} variant="outline">
                          {stakeholder.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {milestones.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Flag size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
            <p className="text-muted-foreground">No milestones defined</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add milestones to track project progress and key deliverables
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MilestonePlanningStep;
