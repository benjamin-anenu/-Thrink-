
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Filter } from 'lucide-react';

interface FilterState {
  departments: string[];
  skills: string[];
  availability: [number, number];
  utilization: [number, number];
  status: string[];
  location: string[];
}

interface ResourceFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ResourceFilters = ({ onFiltersChange, isOpen, onToggle }: ResourceFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    departments: [],
    skills: [],
    availability: [0, 100],
    utilization: [0, 100],
    status: [],
    location: []
  });

  const departments = ['Engineering', 'Design', 'Marketing', 'Operations', 'Sales', 'HR'];
  const skills = ['React', 'TypeScript', 'Node.js', 'Python', 'UI/UX', 'Figma', 'Project Management', 'SEO'];
  const statuses = ['Available', 'Busy', 'Overallocated'];
  const locations = ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Denver, CO'];

  const handleDepartmentChange = (department: string, checked: boolean) => {
    const newDepartments = checked
      ? [...filters.departments, department]
      : filters.departments.filter(d => d !== department);
    
    const newFilters = { ...filters, departments: newDepartments };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    const newSkills = checked
      ? [...filters.skills, skill]
      : filters.skills.filter(s => s !== skill);
    
    const newFilters = { ...filters, skills: newSkills };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    
    const newFilters = { ...filters, status: newStatus };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleAvailabilityChange = (value: number[]) => {
    const newFilters = { ...filters, availability: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleUtilizationChange = (value: number[]) => {
    const newFilters = { ...filters, utilization: [value[0], value[1]] as [number, number] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      departments: [],
      skills: [],
      availability: [0, 100],
      utilization: [0, 100],
      status: [],
      location: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    return filters.departments.length + 
           filters.skills.length + 
           filters.status.length + 
           filters.location.length +
           (filters.availability[0] > 0 || filters.availability[1] < 100 ? 1 : 0) +
           (filters.utilization[0] > 0 || filters.utilization[1] < 100 ? 1 : 0);
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={onToggle} className="flex items-center gap-2">
        <Filter size={16} />
        Filters
        {getActiveFiltersCount() > 0 && (
          <Badge variant="secondary" className="ml-1">
            {getActiveFiltersCount()}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X size={16} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Department Filter */}
        <div>
          <h4 className="font-medium mb-3">Department</h4>
          <div className="grid grid-cols-2 gap-2">
            {departments.map(dept => (
              <div key={dept} className="flex items-center space-x-2">
                <Checkbox
                  id={dept}
                  checked={filters.departments.includes(dept)}
                  onCheckedChange={(checked) => handleDepartmentChange(dept, checked as boolean)}
                />
                <label htmlFor={dept} className="text-sm">{dept}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Filter */}
        <div>
          <h4 className="font-medium mb-3">Skills</h4>
          <div className="grid grid-cols-2 gap-2">
            {skills.map(skill => (
              <div key={skill} className="flex items-center space-x-2">
                <Checkbox
                  id={skill}
                  checked={filters.skills.includes(skill)}
                  onCheckedChange={(checked) => handleSkillChange(skill, checked as boolean)}
                />
                <label htmlFor={skill} className="text-sm">{skill}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Availability Range */}
        <div>
          <h4 className="font-medium mb-3">
            Availability ({filters.availability[0]}% - {filters.availability[1]}%)
          </h4>
          <Slider
            value={filters.availability}
            onValueChange={handleAvailabilityChange}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>

        {/* Utilization Range */}
        <div>
          <h4 className="font-medium mb-3">
            Utilization ({filters.utilization[0]}% - {filters.utilization[1]}%)
          </h4>
          <Slider
            value={filters.utilization}
            onValueChange={handleUtilizationChange}
            max={100}
            step={5}
            className="mt-2"
          />
        </div>

        {/* Status Filter */}
        <div>
          <h4 className="font-medium mb-3">Status</h4>
          <div className="space-y-2">
            {statuses.map(status => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={status}
                  checked={filters.status.includes(status)}
                  onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
                />
                <label htmlFor={status} className="text-sm">{status}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Active Filters</h4>
            <div className="flex flex-wrap gap-1">
              {filters.departments.map(dept => (
                <Badge key={dept} variant="secondary" className="text-xs">
                  {dept}
                </Badge>
              ))}
              {filters.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {filters.status.map(status => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceFilters;
