import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

export interface ProjectFiltersState {
  search: string;
  status: string[];
  priority: string[];
  healthStatus: string[];
  teamSizeMin: number | null;
  teamSizeMax: number | null;
  startDateFrom: string;
  startDateTo: string;
  endDateFrom: string;
  endDateTo: string;
}

interface ProjectFiltersProps {
  filters: ProjectFiltersState;
  onFiltersChange: (filters: ProjectFiltersState) => void;
  onClearFilters: () => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const statusOptions = ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];
  const priorityOptions = ['Low', 'Medium', 'High'];
  const healthStatusOptions = ['green', 'yellow', 'red'];

  const updateFilter = (key: keyof ProjectFiltersState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'status' | 'priority' | 'healthStatus', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const hasActiveFilters = () => {
    return filters.search ||
           filters.status.length > 0 ||
           filters.priority.length > 0 ||
           filters.healthStatus.length > 0 ||
           filters.teamSizeMin !== null ||
           filters.teamSizeMax !== null ||
           filters.startDateFrom ||
           filters.startDateTo ||
           filters.endDateFrom ||
           filters.endDateTo;
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
          </div>
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Search */}
        <div>
          <label className="text-sm font-medium mb-2 block">Search Projects</label>
          <Input
            placeholder="Search by project name or description..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Badge
                key={status}
                variant={filters.status.includes(status) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter('status', status)}
              >
                {status}
              </Badge>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Priority</label>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((priority) => (
              <Badge
                key={priority}
                variant={filters.priority.includes(priority) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter('priority', priority)}
              >
                {priority}
              </Badge>
            ))}
          </div>
        </div>

        {/* Health Status Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Health Status</label>
          <div className="flex flex-wrap gap-2">
            {healthStatusOptions.map((health) => (
              <Badge
                key={health}
                variant={filters.healthStatus.includes(health) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayFilter('healthStatus', health)}
              >
                <div className={`w-2 h-2 rounded-full mr-1 ${
                  health === 'green' ? 'bg-green-500' :
                  health === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                {health.charAt(0).toUpperCase() + health.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Team Size Filter */}
        <div>
          <label className="text-sm font-medium mb-2 block">Team Size</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.teamSizeMin || ''}
              onChange={(e) => updateFilter('teamSizeMin', e.target.value ? parseInt(e.target.value) : null)}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.teamSizeMax || ''}
              onChange={(e) => updateFilter('teamSizeMax', e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="From"
                value={filters.startDateFrom}
                onChange={(e) => updateFilter('startDateFrom', e.target.value)}
              />
              <Input
                type="date"
                placeholder="To"
                value={filters.startDateTo}
                onChange={(e) => updateFilter('startDateTo', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <div className="space-y-2">
              <Input
                type="date"
                placeholder="From"
                value={filters.endDateFrom}
                onChange={(e) => updateFilter('endDateFrom', e.target.value)}
              />
              <Input
                type="date"
                placeholder="To"
                value={filters.endDateTo}
                onChange={(e) => updateFilter('endDateTo', e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectFilters;
