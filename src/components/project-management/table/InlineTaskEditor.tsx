
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { Check, X } from 'lucide-react';

interface InlineTaskEditorProps {
  onSave: (task: Omit<ProjectTask, 'id'>) => void;
  onCancel: () => void;
  milestones: ProjectMilestone[];
  densityClass?: string;
}

const InlineTaskEditor: React.FC<InlineTaskEditorProps> = ({
  onSave,
  onCancel,
  milestones,
  densityClass = 'py-3 px-4'
}) => {
  const [taskData, setTaskData] = useState<Omit<ProjectTask, 'id'>>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    baselineStartDate: new Date().toISOString().split('T')[0],
    baselineEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Not Started',
    priority: 'Medium',
    progress: 0,
    duration: 7,
    assignedResources: [],
    assignedStakeholders: [],
    dependencies: [],
    parentTaskId: undefined,
    hierarchyLevel: 0,
    sortOrder: 0,
    hasChildren: false
  });

  const handleSave = () => {
    if (taskData.name.trim()) {
      onSave(taskData);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <TableRow className="bg-muted/20 border-2 border-primary/20">
      <TableCell className={`${densityClass} min-w-[320px]`}>
        <Input
          value={taskData.name}
          onChange={(e) => setTaskData({ ...taskData, name: e.target.value })}
          placeholder="Enter task name..."
          className="border-none bg-transparent p-0 focus-visible:ring-0"
          onKeyDown={handleKeyPress}
          autoFocus
        />
      </TableCell>
      <TableCell className={densityClass}>
        <Select
          value={taskData.status}
          onValueChange={(value) => setTaskData({ ...taskData, status: value as ProjectTask['status'] })}
        >
          <SelectTrigger className="border-none bg-transparent p-0 h-auto focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Not Started">Not Started</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="On Hold">On Hold</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className={densityClass}>
        <Select
          value={taskData.priority}
          onValueChange={(value) => setTaskData({ ...taskData, priority: value as ProjectTask['priority'] })}
        >
          <SelectTrigger className="border-none bg-transparent p-0 h-auto focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className={densityClass}>-</TableCell>
      <TableCell className={densityClass}>
        <Input
          type="date"
          value={taskData.startDate}
          onChange={(e) => setTaskData({ ...taskData, startDate: e.target.value })}
          className="border-none bg-transparent p-0 focus-visible:ring-0"
        />
      </TableCell>
      <TableCell className={densityClass}>
        <Input
          type="date"
          value={taskData.endDate}
          onChange={(e) => setTaskData({ ...taskData, endDate: e.target.value })}
          className="border-none bg-transparent p-0 focus-visible:ring-0"
        />
      </TableCell>
      <TableCell className={densityClass}>
        <Input
          type="number"
          value={taskData.duration}
          onChange={(e) => setTaskData({ ...taskData, duration: parseInt(e.target.value) || 1 })}
          className="border-none bg-transparent p-0 focus-visible:ring-0 w-16"
          min="1"
        />
      </TableCell>
      <TableCell className={densityClass}>0%</TableCell>
      <TableCell className={densityClass}>-</TableCell>
      <TableCell className={densityClass}>
        <Select
          value={taskData.milestoneId || ''}
          onValueChange={(value) => setTaskData({ ...taskData, milestoneId: value || undefined })}
        >
          <SelectTrigger className="border-none bg-transparent p-0 h-auto focus:ring-0">
            <SelectValue placeholder="No milestone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No milestone</SelectItem>
            {milestones.map((milestone) => (
              <SelectItem key={milestone.id} value={milestone.id}>
                {milestone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className={densityClass}>-</TableCell>
      <TableCell className={densityClass}>
        <div className="flex gap-1">
          <Button size="sm" variant="default" onClick={handleSave}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default InlineTaskEditor;
