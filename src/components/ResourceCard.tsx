
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
import { Resource } from '@/types/resource';

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
    hourly_rate,
    utilization,
    status
  } = resource;

  // For backwards compatibility, create derived values
  const currentProjects: string[] = [];
  const hourlyRate = hourly_rate || 0;

  const getStatusValue = (status?: string): 'active' | 'inactive' | 'pending' => {
    if (!status) return 'inactive';
    if (status.toLowerCase() === 'available' || status.toLowerCase() === 'active') return 'active';
    if (status.toLowerCase() === 'busy' || status.toLowerCase() === 'pending') return 'pending';
    return 'inactive';
  };

  const getPerformanceIndicator = () => {
    const utilizationNum = utilization || 0;
    if (utilizationNum >= 90) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (utilizationNum >= 70) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Convert availability to number for Progress component
  const availabilityPercent = typeof availability === 'string' ? 
    parseInt(availability.replace('%', '')) || 0 : 
    availability || 0;

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card>
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
            <Mail className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{phone}</p>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Rate: {hourlyRate}</p>
          </div>
          <div className="flex items-center space-x-2">
            {getPerformanceIndicator()}
            <p className="text-sm text-muted-foreground">Utilization: {utilization || 0}%</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Availability</p>
          <div className="flex items-center space-x-2">
            <Progress value={availabilityPercent} />
            <p className="text-sm text-muted-foreground">{availability}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Skills</p>
          <div className="flex flex-wrap gap-1">
            {skills?.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Current Projects</p>
          <div className="flex flex-wrap gap-1">
            {currentProjects?.map((project, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {project}
              </Badge>
            ))}
          </div>
        </div>

        <Button 
          onClick={() => onViewDetails(resource)} 
          className="w-full"
          size="sm"
          variant="outline"
        >
          <Eye className="h-4 w-4 mr-2" />
          View More Details
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
