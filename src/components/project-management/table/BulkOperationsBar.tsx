
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Users, Calendar, Flag, Trash2, Move } from 'lucide-react';
import { ProjectTask, ProjectMilestone } from '@/types/project';

interface BulkOperationsBarProps {
  selectedTasks: string[];
  allTasks: ProjectTask[];
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string }>;
  onClearSelection: () => void;
  onBulkStatusUpdate: (status: string) => void;
  onBulkPriorityUpdate: (priority: string) => void;
  onBulkResourceAssign: (resourceIds: string[]) => void;
  onBulkMilestoneAssign: (milestoneId: string) => void;
  onBulkDelete: () => void;
}

const BulkOperationsBar: React.FC<BulkOperationsBarProps> = ({
  selectedTasks,
  allTasks,
  milestones,
  availableResources,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkPriorityUpdate,
  onBulkResourceAssign,
  onBulkMilestoneAssign,
  onBulkDelete
}) => {
  if (selectedTasks.length === 0) return null;

  const statusOptions = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' }
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Critical', label: 'Critical' }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-4 z-50 min-w-96">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select onValueChange={onBulkStatusUpdate}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={onBulkPriorityUpdate}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={onBulkMilestoneAssign}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Milestone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Milestone</SelectItem>
            {milestones.map(milestone => (
              <SelectItem key={milestone.id} value={milestone.id}>
                {milestone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-1" />
          Assign
        </Button>

        <Button variant="outline" size="sm">
          <Move className="h-4 w-4 mr-1" />
          Move
        </Button>

        <Button variant="destructive" size="sm" onClick={onBulkDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default BulkOperationsBar;
