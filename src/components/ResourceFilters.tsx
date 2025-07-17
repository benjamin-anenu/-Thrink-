
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

export interface FilterState {
  search: string;
  department: string;
  role: string;
  availability: string;
}

interface ResourceFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const ResourceFilters: React.FC<ResourceFiltersProps> = ({ filters, onFiltersChange }) => {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filters.department} onValueChange={(value) => updateFilter('department', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Design">Design</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Developer">Developer</SelectItem>
              <SelectItem value="Designer">Designer</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Analyst">Analyst</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.availability} onValueChange={(value) => updateFilter('availability', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Availability</SelectItem>
              <SelectItem value="available">Available (&gt;50%)</SelectItem>
              <SelectItem value="busy">Busy (≤50%)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceFilters;
