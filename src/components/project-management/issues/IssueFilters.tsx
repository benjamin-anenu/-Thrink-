import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Search } from 'lucide-react';
import { IssueFilters as IFilters } from '@/types/issue';
import { supabase } from '@/integrations/supabase/client';

interface IssueFiltersProps {
  filters: IFilters;
  onFiltersChange: (filters: IFilters) => void;
  projectId: string;
}

export const IssueFilters = ({ filters, onFiltersChange, projectId }: IssueFiltersProps) => {
  const [assignees, setAssignees] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchAssignees = async () => {
      const { data } = await supabase
        .from('resources')
        .select('id, name')
        .order('name');
      if (data) setAssignees(data);
    };
    fetchAssignees();
  }, []);

  const updateFilter = (key: keyof IFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addToArrayFilter = (key: 'status' | 'severity' | 'priority' | 'category' | 'assignee', value: string) => {
    const current = filters[key] as string[];
    if (!current.includes(value)) {
      updateFilter(key, [...current, value]);
    }
  };

  const removeFromArrayFilter = (key: 'status' | 'severity' | 'priority' | 'category' | 'assignee', value: string) => {
    const current = filters[key] as string[];
    updateFilter(key, current.filter(item => item !== value));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      severity: [],
      priority: [],
      category: [],
      assignee: [],
      dateRange: {}
    });
  };

  const statusOptions = ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'];
  const severityOptions = ['Low', 'Medium', 'High', 'Critical'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];
  const categoryOptions = ['Technical', 'Process', 'Client', 'Resource', 'Scope', 'Communication', 'Quality'];

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          Clear All
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search issues..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="text-xs font-medium mb-1 block">Status</label>
          <Select onValueChange={(value) => addToArrayFilter('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Severity</label>
          <Select onValueChange={(value) => addToArrayFilter('severity', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              {severityOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Priority</label>
          <Select onValueChange={(value) => addToArrayFilter('priority', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Category</label>
          <Select onValueChange={(value) => addToArrayFilter('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium mb-1 block">Assignee</label>
          <Select onValueChange={(value) => addToArrayFilter('assignee', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              {assignees.map(assignee => (
                <SelectItem key={assignee.id} value={assignee.id}>{assignee.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.status.map(status => (
          <Badge key={status} variant="secondary" className="flex items-center gap-1">
            Status: {status}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeFromArrayFilter('status', status)}
            />
          </Badge>
        ))}
        {filters.severity.map(severity => (
          <Badge key={severity} variant="secondary" className="flex items-center gap-1">
            Severity: {severity}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeFromArrayFilter('severity', severity)}
            />
          </Badge>
        ))}
        {filters.priority.map(priority => (
          <Badge key={priority} variant="secondary" className="flex items-center gap-1">
            Priority: {priority}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeFromArrayFilter('priority', priority)}
            />
          </Badge>
        ))}
        {filters.category.map(category => (
          <Badge key={category} variant="secondary" className="flex items-center gap-1">
            Category: {category}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeFromArrayFilter('category', category)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );
};