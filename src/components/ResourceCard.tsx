
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  onViewDetails: (resource: Resource) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onViewDetails }) => {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{name || 'Unknown'}</CardTitle>
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
            <p className="text-sm text-muted-foreground">Utilization: {utilization}%</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Availability</p>
          <div className="flex items-center space-x-2">
            <Progress value={availability} />
            <p className="text-sm text-muted-foreground">{availability}%</p>
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
