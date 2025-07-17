
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Filter, Search, X, Save, Bookmark } from 'lucide-react';
import { ProjectTask, ProjectMilestone } from '@/types/project';

export interface TaskFilters {
  search: string;
  status: string[];
  priority: string[];
  assignedResources: string[];
  milestones: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  hierarchyLevel: number[];
  hasChildren: boolean | null;
  overdue: boolean;
  completedTasks: boolean;
}

interface AdvancedTaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  tasks: ProjectTask[];
  milestones: ProjectMilestone[];
  availableResources: Array<{ id: string; name: string; role: string }>;
  savedFilters: Array<{ id: string; name: string; filters: TaskFilters }>;
  onSaveFilter: (name: string, filters: TaskFilters) => void;
  onLoadFilter: (filters: TaskFilters) => void;
}

const AdvancedTaskFilters: React.FC<AdvancedTaskFiltersProps> = ({
  filters,
  onFiltersChange,
  tasks,
  milestones,
  availableResources,
  savedFilters,
  onSaveFilter,
  onLoadFilter
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState('');

  const statusOptions = ['Not Started', 'In Progress', 'Completed', 'On Hold'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof TaskFilters>(key: K, value: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray as TaskFilters[K]);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      priority: [],
      assignedResources: [],
      milestones: [],
      dateRange: {},
      hierarchyLevel: [],
      hasChildren: null,
      overdue: false,
      completedTasks: true
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.assignedResources.length > 0) count++;
    if (filters.milestones.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.hierarchyLevel.length > 0) count++;
    if (filters.hasChildren !== null) count++;
    if (filters.overdue) count++;
    if (!filters.completedTasks) count++;
    return count;
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim()) {
      onSaveFilter(saveFilterName.trim(), filters);
      setSaveFilterName('');
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Quick Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-8 w-64"
        />
      </div>

      {/* Quick Status Filter - Fixed to use proper value handling */}
      <Select 
        value={filters.status[0] || '__ALL__'} 
        onValueChange={(value) => updateFilter('status', value === '__ALL__' ? [] : [value])}
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__ALL__">All Status</SelectItem>
          {statusOptions.map(status => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Advanced Filters Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Saved Filters</label>
                <div className="space-y-2">
                  {savedFilters.map(savedFilter => (
                    <Button
                      key={savedFilter.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onLoadFilter(savedFilter.filters)}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      {savedFilter.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <div className="space-y-2">
                {statusOptions.map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status}`}
                      checked={filters.status.includes(status)}
                      onCheckedChange={() => toggleArrayFilter('status', status)}
                    />
                    <label htmlFor={`status-${status}`} className="text-sm">
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <div className="space-y-2">
                {priorityOptions.map(priority => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={filters.priority.includes(priority)}
                      onCheckedChange={() => toggleArrayFilter('priority', priority)}
                    />
                    <label htmlFor={`priority-${priority}`} className="text-sm">
                      {priority}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Hierarchy Level Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Hierarchy Level</label>
              <div className="space-y-2">
                {[0, 1, 2, 3, 4].map(level => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={filters.hierarchyLevel.includes(level)}
                      onCheckedChange={() => toggleArrayFilter('hierarchyLevel', level.toString())}
                    />
                    <label htmlFor={`level-${level}`} className="text-sm">
                      Level {level} {level === 0 ? '(Root)' : ''}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Task Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Task Type</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="parent-tasks"
                    checked={filters.hasChildren === true}
                    onCheckedChange={(checked) => updateFilter('hasChildren', checked ? true : null)}
                  />
                  <label htmlFor="parent-tasks" className="text-sm">
                    Parent Tasks Only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="leaf-tasks"
                    checked={filters.hasChildren === false}
                    onCheckedChange={(checked) => updateFilter('hasChildren', checked ? false : null)}
                  />
                  <label htmlFor="leaf-tasks" className="text-sm">
                    Leaf Tasks Only
                  </label>
                </div>
              </div>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <div className="space-y-2">
                <Input
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Special Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Special Filters</label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="overdue"
                    checked={filters.overdue}
                    onCheckedChange={(checked) => updateFilter('overdue', !!checked)}
                  />
                  <label htmlFor="overdue" className="text-sm">
                    Overdue Tasks
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-completed"
                    checked={filters.completedTasks}
                    onCheckedChange={(checked) => updateFilter('completedTasks', !!checked)}
                  />
                  <label htmlFor="show-completed" className="text-sm">
                    Show Completed Tasks
                  </label>
                </div>
              </div>
            </div>

            {/* Save Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Save Current Filter</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Filter name"
                  value={saveFilterName}
                  onChange={(e) => setSaveFilterName(e.target.value)}
                />
                <Button size="sm" onClick={handleSaveFilter} disabled={!saveFilterName.trim()}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={clearAllFilters} className="flex-1">
                Clear All
              </Button>
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear ({getActiveFilterCount()})
        </Button>
      )}
    </div>
  );
};

export default AdvancedTaskFilters;
