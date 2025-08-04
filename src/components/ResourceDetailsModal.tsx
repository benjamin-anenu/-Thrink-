
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  User,
  Award,
  Clock,
  Target,
  BarChart3,
  Loader2
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Resource } from '@/types/resource';
import { useEnhancedResourceDetails } from '@/hooks/useEnhancedResourceDetails';
import { useRealResourceUtilization } from '@/hooks/useRealResourceUtilization';

interface ResourceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  onAssignTask?: (resourceId: string, resourceName: string) => void;
}

const ResourceDetailsModal: React.FC<ResourceDetailsModalProps> = ({
  isOpen,
  onClose,
  resource,
  onAssignTask
}) => {
  const { profile, skills, projectHistory, loading: detailsLoading } = useEnhancedResourceDetails(resource?.id || '');
  const { utilizationMetrics } = useRealResourceUtilization(resource ? [resource.id] : []);
  
  if (!resource) return null;

  const resourceMetrics = utilizationMetrics[resource.id];
  const currentProjects = projectHistory.filter(p => p.status === 'Active');

  const getStatusValue = (status: string): 'active' | 'inactive' | 'pending' => {
    if (status.toLowerCase() === 'available') return 'active';
    if (status.toLowerCase() === 'busy') return 'pending';
    return 'inactive';
  };

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={resource.name} />
              <AvatarFallback className="text-lg">{getInitials(resource.name)}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{resource.name}</DialogTitle>
              <DialogDescription className="text-lg">
                {resource.role} • {resource.department}
              </DialogDescription>
              <div className="mt-2">
                <StatusBadge status={getStatusValue(resource.status)} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Key Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Utilization</span>
                          <span className="text-sm text-muted-foreground">
                            {resourceMetrics?.utilization_percentage || 0}%
                          </span>
                        </div>
                        <Progress value={resourceMetrics?.utilization_percentage || 0} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Task Load</span>
                          <span className="text-sm text-muted-foreground">
                            {resourceMetrics?.task_count || 0}/{resourceMetrics?.task_capacity || 10}
                          </span>
                        </div>
                        <Progress value={((resourceMetrics?.task_count || 0) / (resourceMetrics?.task_capacity || 10)) * 100} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Hourly Rate</span>
                         <span className="text-sm">
                           {resource.hourly_rate ? `$${resource.hourly_rate}/hr` : 'Not set'}
                         </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status</span>
                        <Badge variant={
                          resourceMetrics?.status === 'Overloaded' ? 'destructive' :
                          resourceMetrics?.status === 'Well Utilized' ? 'default' : 'secondary'
                        }>
                          {resourceMetrics?.status || 'Available'}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {skills.length > 0 ? (
                        skills.map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                            <div>
                              <span className="font-medium">{skill.skill_name}</span>
                              <div className="text-xs text-muted-foreground">
                                {skill.years_experience} years experience
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary">
                                {skill.proficiency_level}/10
                              </Badge>
                              <div className="text-xs text-muted-foreground mt-1">
                                Confidence: {skill.confidence_score}/10
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No skills data available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Current Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Current Projects
                </CardTitle>
                <CardDescription>
                  Active project assignments and workload
                </CardDescription>
              </CardHeader>
              <CardContent>
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentProjects.length > 0 ? (
                      currentProjects.map((project, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{project.project_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {project.tasks_completed} tasks completed
                            </p>
                          </div>
                          <Badge variant="secondary">{project.status}</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No current projects</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Tasks Completed (30 days):</span>
                        <span className="font-medium">{resourceMetrics?.tasks_completed || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complexity Handling:</span>
                        <span className="font-medium">{profile?.complexity_handling_score || 5}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Collaboration Score:</span>
                        <span className="font-medium">{profile?.collaboration_effectiveness || 5}/10</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bottleneck Risk:</span>
                        <Badge variant={
                          (resourceMetrics?.bottleneck_risk || 0) > 7 ? 'destructive' : 
                          (resourceMetrics?.bottleneck_risk || 0) > 4 ? 'secondary' : 'outline'
                        }>
                          {resourceMetrics?.bottleneck_risk || 0}/10
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Work Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Seniority Level:</span>
                        <span className="font-medium">{profile?.seniority_level || 'Mid'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Work Style:</span>
                        <span className="font-medium">{profile?.preferred_work_style || 'Mixed'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimal Tasks/Day:</span>
                        <span className="font-medium">{profile?.optimal_task_count_per_day || 5}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mentorship:</span>
                        <Badge variant={profile?.mentorship_capacity ? 'default' : 'outline'}>
                          {profile?.mentorship_capacity ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project History</CardTitle>
                <CardDescription>
                  Complete project assignment history and contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {detailsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projectHistory.length > 0 ? (
                      projectHistory.map((project, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <p className="font-medium">{project.project_name}</p>
                             <p className="text-sm text-muted-foreground">
                               {project.tasks_completed} tasks completed • {project.role}
                             </p>
                          </div>
                          <Badge variant={project.status === 'Active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No project history available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{resource.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{resource.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{resource.location || 'Not specified'}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onAssignTask && (
            <Button onClick={() => onAssignTask(resource.id, resource.name)}>
              <Clock className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceDetailsModal;
