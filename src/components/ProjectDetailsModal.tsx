
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HealthIndicator from './HealthIndicator';
import { Calendar, Users, Target, Clock, MapPin, DollarSign } from 'lucide-react';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    description: string;
    status: string;
    priority: string;
    progress: number;
    health: { status: 'green' | 'yellow' | 'red'; score: number };
    startDate: string;
    endDate: string;
    teamSize: number;
    budget: string;
    tags: string[];
  };
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getDaysRemaining = () => {
    const endDate = new Date(project.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProjectDuration = () => {
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{project.name}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getPriorityColor(project.priority)} text-white`}>
                {project.priority}
              </Badge>
              <HealthIndicator health={project.health.status} score={project.health.score} />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{project.description}</p>
              
              {/* Status and Progress */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Current Status</p>
                  <Badge variant="secondary" className="text-sm">{project.status}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Overall Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={project.progress} className="flex-1" />
                    <span className="text-sm font-medium">{project.progress}%</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="font-semibold">{getProjectDuration()} days</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <p className="font-semibold">{getDaysRemaining()} days</p>
                    <p className="text-xs text-muted-foreground">Until completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Team Size</p>
                    <p className="font-semibold">{project.teamSize} members</p>
                    <p className="text-xs text-muted-foreground">Active contributors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold">{project.budget}</p>
                    <p className="text-xs text-muted-foreground">Total allocated</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Health Score Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                Project Health
                <HealthIndicator health={project.health.status} score={project.health.score} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Overall Health Score</span>
                  <span className="font-semibold">{project.health.score}/100</span>
                </div>
                <Progress value={project.health.score} className="h-2" />
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                  <div className="text-center">
                    <div className="h-2 bg-green-500 rounded mb-1"></div>
                    <p className="text-muted-foreground">On Track</p>
                  </div>
                  <div className="text-center">
                    <div className="h-2 bg-yellow-500 rounded mb-1"></div>
                    <p className="text-muted-foreground">At Risk</p>
                  </div>
                  <div className="text-center">
                    <div className="h-2 bg-red-500 rounded mb-1"></div>
                    <p className="text-muted-foreground">Critical</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">Task "User Interface Mockups" completed</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">New team member assigned to project</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm">Milestone "Design Phase" achieved</p>
                    <p className="text-xs text-muted-foreground">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsModal;
