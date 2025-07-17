
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { ProjectTask, ProjectMilestone } from '@/types/project';

interface QuickTaskCreatorProps {
  onCreateTask: (taskData: Omit<ProjectTask, 'id'>) => void;
  parentTaskId?: string;
  milestones: ProjectMilestone[];
  onCancel?: () => void;
  placeholder?: string;
}

const QuickTaskCreator: React.FC<QuickTaskCreatorProps> = ({
  onCreateTask,
  parentTaskId,
  milestones,
  onCancel,
  placeholder = "Enter task name..."
}) => {
  const [taskName, setTaskName] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [priority, setPriority] = useState<string>('Medium');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (!taskName.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const taskData: Omit<ProjectTask, 'id'> = {
      name: taskName.trim(),
      description: '',
      startDate: today,
      endDate: endDate,
      baselineStartDate: today,
      baselineEndDate: endDate,
      progress: 0,
      assignedResources: [],
      assignedStakeholders: [],
      dependencies: [],
      priority: priority as any,
      status: 'Not Started',
      milestoneId: selectedMilestone || undefined,
      duration: 7,
      parentTaskId,
      hierarchyLevel: parentTaskId ? 1 : 0,
      sortOrder: 0,
      hasChildren: false
    };

    onCreateTask(taskData);
    setTaskName('');
    setSelectedMilestone('');
    setPriority('Medium');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    } else if (e.key === 'Tab' && taskName.trim()) {
      e.preventDefault();
      // Create task and indent (make it a subtask)
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/30">
      <div className="flex-1">
        <Input
          ref={inputRef}
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="w-24 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Critical">Critical</SelectItem>
        </SelectContent>
      </Select>

      <Select value={selectedMilestone} onValueChange={setSelectedMilestone}>
        <SelectTrigger className="w-32 h-8">
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

      <div className="flex items-center gap-1">
        <Button size="sm" onClick={handleSubmit} disabled={!taskName.trim()}>
          <Plus className="h-3 w-3" />
        </Button>
        {onCancel && (
          <Button size="sm" variant="ghost" onClick={onCancel}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="text-xs text-muted-foreground hidden sm:block">
        Enter to create • Tab to indent • Esc to cancel
      </div>
    </div>
  );
};

export default QuickTaskCreator;
