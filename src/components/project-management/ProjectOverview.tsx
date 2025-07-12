
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import HealthIndicator from '../HealthIndicator';
import { Calendar, Users, Target, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface ProjectOverviewProps {
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

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
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
    <div className="space-y-6">
      {/* Project Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getPriorityColor(project.priority)} text-white`}>
                {project.priority}
              </Badge>
              <HealthIndicator health={project.health.status} score={project.health.score} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Timeline</p>
                <p className="font-semibold">{getProjectDuration()} days</p>
                <p className="text-xs text-muted-foreground">Total duration</p>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">Out of 20 total tasks</p>
            <Progress value={60} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Progress Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+15%</div>
            <p className="text-sm text-muted-foreground">This week vs last week</p>
            <div className="flex items-center gap-1 mt-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">Above target</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Low</div>
            <p className="text-sm text-muted-foreground">Current risk level</p>
            <div className="flex items-center gap-1 mt-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600">No major risks</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm">Task "User Interface Mockups" completed by Emily Rodriguez</p>
                <p className="text-xs text-muted-foreground">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm">New milestone "Design Phase" added to project timeline</p>
                <p className="text-xs text-muted-foreground">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm">Resource allocation updated for Frontend Development phase</p>
                <p className="text-xs text-muted-foreground">1 day ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm">Budget review completed - all expenses within limits</p>
                <p className="text-xs text-muted-foreground">2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectOverview;
