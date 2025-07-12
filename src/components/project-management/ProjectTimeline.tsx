
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, AlertCircle, Target } from 'lucide-react';

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  // Mock data - in real app, this would be fetched based on projectId
  const milestones = [
    {
      id: '1',
      name: 'Project Kickoff',
      date: '2024-01-15',
      status: 'completed',
      description: 'Initial project setup and team onboarding',
      tasks: 3,
      completedTasks: 3
    },
    {
      id: '2',
      name: 'Requirements Gathering',
      date: '2024-01-25',
      status: 'completed',
      description: 'Complete requirements analysis and documentation',
      tasks: 5,
      completedTasks: 5
    },
    {
      id: '3',
      name: 'Design Phase Complete',
      date: '2024-02-15',
      status: 'in-progress',
      description: 'UI/UX design mockups and prototypes finalized',
      tasks: 8,
      completedTasks: 6
    },
    {
      id: '4',
      name: 'Development Phase 1',
      date: '2024-03-01',
      status: 'upcoming',
      description: 'Core functionality implementation',
      tasks: 12,
      completedTasks: 0
    },
    {
      id: '5',
      name: 'Beta Testing',
      date: '2024-03-15',
      status: 'upcoming',
      description: 'Internal testing and bug fixes',
      tasks: 6,
      completedTasks: 0
    },
    {
      id: '6',
      name: 'Project Delivery',
      date: '2024-03-30',
      status: 'upcoming',
      description: 'Final deployment and project handover',
      tasks: 4,
      completedTasks: 0
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'upcoming':
        return <Target className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Delayed';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-semibold">
                  {milestones.filter(m => m.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="font-semibold">
                  {milestones.filter(m => m.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="font-semibold">
                  {milestones.filter(m => m.status === 'upcoming').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Milestones</p>
                <p className="font-semibold">{milestones.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-start gap-6">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-background border-2 border-border rounded-full">
                    {getStatusIcon(milestone.status)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Card className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{milestone.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(milestone.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                          <Badge variant="secondary" className={getStatusColor(milestone.status)}>
                            {getStatusText(milestone.status)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {milestone.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <span className="text-muted-foreground">
                              Tasks: {milestone.completedTasks}/{milestone.tasks}
                            </span>
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${(milestone.completedTasks / milestone.tasks) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          {milestone.status === 'completed' && (
                            <span className="text-green-600 text-xs font-medium">
                              ✓ Completed on time
                            </span>
                          )}
                          
                          {milestone.status === 'in-progress' && (
                            <span className="text-blue-600 text-xs font-medium">
                              🔄 In progress
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Path */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Path Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Critical tasks that directly impact the project timeline
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">UI/UX Design Phase</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Delay risk: Medium - Dependencies on stakeholder feedback
                </p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">Backend Development</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  On track - All prerequisites completed
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimeline;
