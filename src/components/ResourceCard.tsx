import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Clock, UserPlus, Target } from 'lucide-react';
import { PerformanceTracker } from '@/services/PerformanceTracker';

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

interface ResourceCardProps {
  resource: Resource;
  onAssignTask: (resourceId: string, resourceName: string) => void;
}

const ResourceCard = ({ resource, onAssignTask }: ResourceCardProps) => {
  const [performanceProfile, setPerformanceProfile] = React.useState<any>(null);

  React.useEffect(() => {
    const tracker = PerformanceTracker.getInstance();
    const profile = tracker.getPerformanceProfile(resource.id);
    setPerformanceProfile(profile);
  }, [resource.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'Busy': return 'bg-yellow-500';
      case 'Overallocated': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-500';
    if (utilization >= 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{resource.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{resource.name}</CardTitle>
              <CardDescription>{resource.role}</CardDescription>
              {/* Performance indicator */}
              {performanceProfile && (
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={performanceProfile.trend === 'improving' ? 'default' : 
                           performanceProfile.trend === 'declining' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {Math.round(performanceProfile.currentScore)}/100
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {performanceProfile.trend}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Badge className={`${getStatusColor(resource.status)} text-white`}>
            {resource.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{resource.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{resource.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{resource.location}</span>
          </div>
        </div>

        {/* Utilization */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Utilization</span>
            <span className={getUtilizationColor(resource.utilization)}>
              {resource.utilization}%
            </span>
          </div>
          <Progress value={resource.utilization} className="h-2" />
        </div>

        {/* Availability */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span>Availability</span>
            <span>{resource.availability}%</span>
          </div>
          <Progress value={resource.availability} className="h-2" />
        </div>

        {/* Skills */}
        <div>
          <p className="text-sm font-medium mb-2">Skills</p>
          <div className="flex flex-wrap gap-1">
            {resource.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {/* Current Projects */}
        <div>
          <p className="text-sm font-medium mb-2">Current Projects</p>
          <div className="space-y-1">
            {resource.currentProjects.map((project, index) => (
              <p key={index} className="text-xs text-muted-foreground">• {project}</p>
            ))}
          </div>
        </div>

        {/* Rate */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Rate: {resource.hourlyRate}</span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Performance Insights */}
        {performanceProfile && (
          <div>
            <p className="text-sm font-medium mb-2">AI Performance Insights</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Performance Score</span>
                <span className={`font-medium ${
                  performanceProfile.currentScore > 80 ? 'text-green-600' :
                  performanceProfile.currentScore > 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(performanceProfile.currentScore)}/100
                </span>
              </div>
              <Progress value={performanceProfile.currentScore} className="h-1" />
              {performanceProfile.riskLevel !== 'low' && (
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {performanceProfile.riskLevel} risk level
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <UserPlus size={14} className="mr-1" />
            Edit
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={() => onAssignTask(resource.id, resource.name)}
          >
            <Target size={14} className="mr-1" />
            Assign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
