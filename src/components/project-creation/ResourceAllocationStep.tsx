
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useResources } from '@/hooks/useResources';
import { User, Users, Clock, Target } from 'lucide-react';

interface ResourceAllocationStepProps {
  onNext: () => void;
  onBack: () => void;
  formData: any;
  updateFormData: (data: any) => void;
}

interface ResourceData {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  workspace_id: string;
}

const ResourceAllocationStep: React.FC<ResourceAllocationStepProps> = ({
  onNext,
  onBack,
  formData,
  updateFormData
}) => {
  const { resources, loading } = useResources();
  const [selectedResources, setSelectedResources] = useState<string[]>(formData.resources || []);
  const [allocationHours, setAllocationHours] = useState<{[key: string]: number}>(formData.allocationHours || {});

  // Filter available resources (only non-deleted resources)
  const availableResources: ResourceData[] = resources
    .filter(resource => resource.id && resource.name)
    .map(resource => ({
      id: resource.id,
      name: resource.name,
      role: resource.role || 'Unknown Role',
      department: resource.department || 'No Department',
      email: resource.email || '',
      workspace_id: resource.workspace_id || ''
    }));

  const handleResourceToggle = (resourceId: string) => {
    setSelectedResources(prev => {
      if (prev.includes(resourceId)) {
        const newSelected = prev.filter(id => id !== resourceId);
        const newAllocation = { ...allocationHours };
        delete newAllocation[resourceId];
        setAllocationHours(newAllocation);
        return newSelected;
      } else {
        return [...prev, resourceId];
      }
    });
  };

  const handleAllocationChange = (resourceId: string, hours: number) => {
    setAllocationHours(prev => ({
      ...prev,
      [resourceId]: hours
    }));
  };

  const handleNext = () => {
    updateFormData({
      ...formData,
      resources: selectedResources,
      allocationHours,
      teamSize: selectedResources.length
    });
    onNext();
  };

  const getResourceById = (id: string): ResourceData | undefined => {
    return availableResources.find(r => r.id === id);
  };

  const calculateTotalAllocation = () => {
    return Object.values(allocationHours).reduce((sum, hours) => sum + hours, 0);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Resource Allocation
          </CardTitle>
          <CardDescription>
            Select team members and allocate their time to this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Team Size Summary */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Team Size</span>
            </div>
            <Badge variant="secondary">{selectedResources.length} members</Badge>
          </div>

          {/* Resource Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Available Resources</Label>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading resources...</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {availableResources.map((resource) => (
                  <div key={resource.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={resource.id}
                      checked={selectedResources.includes(resource.id)}
                      onCheckedChange={() => handleResourceToggle(resource.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {resource.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor={resource.id} className="font-medium cursor-pointer">
                            {resource.name}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {resource.role} • {resource.department}
                          </p>
                        </div>
                        <Badge variant="default">
                          Available
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allocation Hours */}
          {selectedResources.length > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Allocation Hours (per week)</Label>
              <div className="grid gap-3">
                {selectedResources.map((resourceId) => {
                  const resource = getResourceById(resourceId);
                  if (!resource) return null;
                  
                  return (
                    <div key={resourceId} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {resource.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{resource.name}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          max="40"
                          value={allocationHours[resourceId] || 0}
                          onChange={(e) => handleAllocationChange(resourceId, parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">hours/week</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Total Allocation */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">Total Allocation</span>
                <Badge variant="outline">
                  {calculateTotalAllocation()} hours/week
                </Badge>
              </div>
            </div>
          )}

          {/* Project Requirements */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Project Requirements</Label>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Estimated Team Size</span>
                </div>
                <Badge variant="secondary">3-5 members recommended</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Weekly Hours</span>
                </div>
                <Badge variant="secondary">{calculateTotalAllocation()}/120 hours</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={selectedResources.length === 0}
        >
          Next: Timeline Planning
        </Button>
      </div>
    </div>
  );
};

export default ResourceAllocationStep;
