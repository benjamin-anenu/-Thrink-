
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Resource } from '@/contexts/ResourceContext';

interface ResourceCardProps {
  resource: Resource;
  onViewDetails: (resource: Resource) => void;
  showCompareCheckbox?: boolean;
  isSelectedForComparison?: boolean;
  onCompareToggle?: (resourceId: string, selected: boolean) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  onViewDetails, 
  showCompareCheckbox = false,
  isSelectedForComparison = false,
  onCompareToggle 
}) => {
  const {
    id,
    name,
    role,
    department,
    email,
    phone,
    location,
    skills,
    availability,
    currentProjects,
    hourlyRate,
    utilization,
    status
  } = resource;

  const getStatusValue = (status: string): 'active' | 'inactive' | 'pending' => {
    if (status.toLowerCase() === 'available') return 'active';
    if (status.toLowerCase() === 'busy') return 'pending';
    return 'inactive';
  };

  const getPerformanceIndicator = () => {
    if (utilization >= 90) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (utilization >= 70) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name.substring(0, 2).toUpperCase();
  };

  const getAvailabilityColor = (availability: number) => {
    if (availability >= 80) return 'text-green-600';
    if (availability >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(resource)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showCompareCheckbox && (
              <Checkbox
                checked={isSelectedForComparison}
                onCheckedChange={(checked) => 
                  onCompareToggle?.(resource.id, checked as boolean)
                }
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <CardTitle className="text-lg font-semibold">{name || 'Unknown'}</CardTitle>
          </div>
          <StatusBadge status={getStatusValue(status)} />
        </div>
        <CardDescription>{role} • {department}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="" alt={name || 'User'} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{name || 'Unknown'}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Availability:</span>
            <span className={`text-sm ${getAvailabilityColor(availability)}`}>
              {availability}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Utilization:</span>
            <span className={`text-sm ${getUtilizationColor(utilization)}`}>
              {utilization}%
            </span>
            {getPerformanceIndicator()}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Rate:</span>
            <span className="text-sm text-muted-foreground">{hourlyRate}</span>
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {skills.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{skills.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {currentProjects.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Current Projects</p>
            <div className="flex flex-wrap gap-1">
              {currentProjects.slice(0, 2).map((project, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {project}
                </Badge>
              ))}
              {currentProjects.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{currentProjects.length - 2} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
