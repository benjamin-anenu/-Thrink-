
import React, { useState } from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

export interface TaskFilters {
  status?: string;
  priority?: string;
  assignee?: string;
  milestone?: string;
  search?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

interface TaskFilterDialogProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  availableResources: Array<{ id: string; name: string; role: string }>;
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
}

const TaskFilterDialog: React.FC<TaskFilterDialogProps> = ({
  filters,
  onFiltersChange,
  availableResources,
  milestones,
  tasks
}) => {
  const [localFilters, setLocalFilters] = useState<TaskFilters>(filters);
  const [open, setOpen] = useState(false);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleClearFilters = () => {
    const emptyFilters: TaskFilters = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof TaskFilters];
      if (key === 'dateRange') {
        return value && typeof value === 'object' && (value.start || value.end);
      }
      return value && value !== '';
    }).length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFilterCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter Tasks</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search tasks..."
              value={localFilters.search || ''}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>

          {/* Status Filter */}
          <div>
            <Label>Status</Label>
            <Select
              value={localFilters.status || undefined}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, status: value || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div>
            <Label>Priority</Label>
            <Select
              value={localFilters.priority || undefined}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, priority: value || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Filter */}
          <div>
            <Label>Assignee</Label>
            <Select
              value={localFilters.assignee || undefined}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, assignee: value || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {availableResources.map(resource => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Milestone Filter */}
          <div>
            <Label>Milestone</Label>
            <Select
              value={localFilters.milestone || undefined}
              onValueChange={(value) => setLocalFilters(prev => ({ ...prev, milestone: value || undefined }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All milestones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-milestone">No milestone</SelectItem>
                {milestones.map(milestone => (
                  <SelectItem key={milestone.id} value={milestone.id}>
                    {milestone.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <Label>Date Range</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start-date" className="text-xs">Start</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={(localFilters.dateRange?.start) || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value || undefined }
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="end-date" className="text-xs">End</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={(localFilters.dateRange?.end) || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value || undefined }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleClearFilters}>
              Clear All
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskFilterDialog;
