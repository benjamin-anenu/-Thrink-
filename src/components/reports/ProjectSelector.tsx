
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Calendar } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  teamSize: number;
  endDate: string;
}

interface ProjectSelectorProps {
  selectedProject: string;
  onProjectChange: (projectId: string) => void;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({ selectedProject, onProjectChange }) => {
  const projects: Project[] = [
    { id: 'proj-1', name: 'E-commerce Platform', status: 'In Progress', teamSize: 8, endDate: '2024-03-15' },
    { id: 'proj-2', name: 'Mobile App Redesign', status: 'Planning', teamSize: 5, endDate: '2024-04-20' },
    { id: 'proj-3', name: 'AI Integration Project', status: 'In Progress', teamSize: 12, endDate: '2024-05-10' },
    { id: 'all', name: 'All Projects', status: 'Multiple', teamSize: 25, endDate: '' }
  ];

  const selectedProjectData = projects.find(p => p.id === selectedProject);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Project Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedProject} onValueChange={onProjectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a project..." />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{project.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {project.status}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProjectData && selectedProjectData.id !== 'all' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{selectedProjectData.teamSize} team members</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Due: {selectedProjectData.endDate}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectSelector;
