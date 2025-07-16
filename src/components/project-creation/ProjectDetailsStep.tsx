import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, DollarSign, Users, Target, FileText } from 'lucide-react';

interface ProjectDetailsStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ data, onDataChange }) => {
  const handleNameChange = (name: string) => {
    onDataChange({ name });
  };

  const handleDescriptionChange = (description: string) => {
    onDataChange({ description });
  };

  const handlePriorityChange = (priority: string) => {
    onDataChange({ priority });
  };

  const handleStatusChange = (status: string) => {
    onDataChange({ status });
  };

  const handleBudgetChange = (budget: string) => {
    onDataChange({ 
      resources: {
        ...data.resources,
        budget
      }
    });
  };

  const handleStartDateChange = (startDate: string) => {
    onDataChange({ 
      resources: {
        ...data.resources,
        timeline: {
          ...data.resources?.timeline,
          start: startDate
        }
      }
    });
  };

  const handleEndDateChange = (endDate: string) => {
    onDataChange({ 
      resources: {
        ...data.resources,
        timeline: {
          ...data.resources?.timeline,
          end: endDate
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Project Details</h2>
        <p className="text-muted-foreground">
          Define the basic information and parameters for your new project
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Provide the essential details about your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              placeholder="Enter your project name..."
              value={data.name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="project-description">Project Description</Label>
            <Textarea
              id="project-description"
              placeholder="Describe your project goals, scope, and expected outcomes..."
              value={data.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={4}
              className="mt-1 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Project Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Project Configuration
          </CardTitle>
          <CardDescription>
            Set priority level and initial status for the project
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="project-priority">Priority Level</Label>
            <Select value={data.priority || 'Medium'} onValueChange={handlePriorityChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Low</Badge>
                    <span>Standard timeline</span>
                  </div>
                </SelectItem>
                <SelectItem value="Medium">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Medium</Badge>
                    <span>Moderate urgency</span>
                  </div>
                </SelectItem>
                <SelectItem value="High">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">High</Badge>
                    <span>High priority</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="project-status">Initial Status</Label>
            <Select value={data.status || 'Planning'} onValueChange={handleStatusChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Budget */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Timeline & Budget
          </CardTitle>
          <CardDescription>
            Define project timeline and budget constraints (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={data.resources?.timeline?.start || ''}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={data.resources?.timeline?.end || ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="project-budget">Budget</Label>
            <div className="relative mt-1">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="project-budget"
                placeholder="Enter project budget (e.g., $50,000)"
                value={data.resources?.budget || ''}
                onChange={(e) => handleBudgetChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Project Setup Progress</h4>
              <p className="text-sm text-muted-foreground">
                {data.name ? 'Ready to proceed to kickoff session' : 'Project name is required to continue'}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={data.name ? 'default' : 'secondary'}>
                {data.name ? 'Ready' : 'Incomplete'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailsStep;