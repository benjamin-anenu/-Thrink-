
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
  CheckCircle
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';

interface ResourceCardProps {
  name: string;
  email: string;
  phone: string;
  location: string;
  availability: string;
  hourlyRate: number;
  performance: 'up' | 'down' | 'stable';
  status: 'active' | 'inactive' | 'pending';
  tasksCompleted: number;
  totalTasks: number;
  imageUrl?: string;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  name,
  email,
  phone,
  location,
  availability,
  hourlyRate,
  performance,
  status,
  tasksCompleted,
  totalTasks,
  imageUrl
}) => {
  const getPerformanceIndicator = () => {
    switch (performance) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{name}</p>
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
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Available: {availability}</p>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Hourly Rate: ${hourlyRate}</p>
          </div>
          {performance && (
            <div className="flex items-center space-x-2">
              {getPerformanceIndicator()}
              <p className="text-sm text-muted-foreground">Performance: {performance}</p>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">Task Completion</p>
          <div className="flex items-center space-x-2">
            <Progress value={(tasksCompleted / totalTasks) * 100} />
            <p className="text-sm text-muted-foreground">
              {tasksCompleted}/{totalTasks}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
