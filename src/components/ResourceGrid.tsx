
import React from 'react';
import { Button } from '@/components/ui/button';
import ResourceCard from '@/components/ResourceCard';

interface Resource {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  availability: number;
  currentProjects: string[];
  hourlyRate: string;
  utilization: number;
  status: string;
}

interface ResourceGridProps {
  resources: Resource[];
  onAssignTask: (resourceId: string, resourceName: string) => void;
  onShowResourceForm: () => void;
}

const ResourceGrid = ({ resources, onAssignTask, onShowResourceForm }: ResourceGridProps) => {
  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No resources found matching your search.</p>
        <Button onClick={onShowResourceForm}>Add New Resource</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {resources.map((resource) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          onAssignTask={onAssignTask}
        />
      ))}
    </div>
  );
};

export default ResourceGrid;
