
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
  BarChart3
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Resource } from '@/contexts/ResourceContext';

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
  if (!resource) return null;

  // Safe defaults for arrays that might be undefined
  const skills = resource.skills || [];
  const currentProjects = resource.currentProjects || [];

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
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Utilization</span>
                      <span className="text-sm text-muted-foreground">{resource.utilization}%</span>
                    </div>
                    <Progress value={resource.utilization} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Availability</span>
                      <span className="text-sm text-muted-foreground">{resource.availability}%</span>
                    </div>
                    <Progress value={resource.availability} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Hourly Rate</span>
                    <span className="text-sm">{resource.hourlyRate}</span>
                  </div>
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
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills listed</p>
                    )}
                  </div>
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
                <div className="flex flex-wrap gap-2">
                  {currentProjects.length > 0 ? (
                    currentProjects.map((project, index) => (
                      <Badge key={index} variant="outline">
                        {project}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No current projects</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>
                  Track performance metrics and productivity trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Performance metrics will be available soon</p>
                </div>
              </CardContent>
            </Card>
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
                <div className="space-y-4">
                  {currentProjects.length > 0 ? (
                    currentProjects.map((project, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="font-medium">{project}</p>
                          <p className="text-sm text-muted-foreground">Active Project</p>
                        </div>
                        <Badge variant="secondary">Ongoing</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No project history available</p>
                  )}
                </div>
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
                  <span>{resource.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{resource.location}</span>
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
