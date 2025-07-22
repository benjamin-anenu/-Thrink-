
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
  Eye,
  Brain,
  Clock,
  Target
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Resource } from '@/contexts/ResourceContext';
import { TaskUtilizationMetrics } from '@/types/enhanced-resource';

interface EnhancedResourceCardProps {
  resource: Resource;
  utilizationMetrics?: TaskUtilizationMetrics;
  onViewDetails: (resource: Resource) => void;
  showCompareCheckbox?: boolean;
  isSelectedForComparison?: boolean;
  onCompareToggle?: (resourceId: string, selected: boolean) => void;
}

const EnhancedResourceCard: React.FC<EnhancedResourceCardProps> = ({ 
  resource, 
  utilizationMetrics,
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

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBottleneckRiskColor = (risk: number) => {
    if (risk >= 7) return 'text-red-600';
    if (risk >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="relative overflow-hidden">
      {/* AI Enhancement Indicator */}
      {utilizationMetrics && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI Enhanced
          </Badge>
        </div>
      )}

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

        {/* Enhanced Utilization Metrics */}
        {utilizationMetrics && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Target className="h-3 w-3" />
                Task Utilization
              </span>
              <Badge variant="outline" className={getUtilizationColor(utilizationMetrics.utilization_percentage)}>
                {utilizationMetrics.utilization_percentage}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Tasks: {utilizationMetrics.task_count}/{utilizationMetrics.task_capacity}</span>
                <span className="font-medium">{utilizationMetrics.status}</span>
              </div>
              <Progress value={utilizationMetrics.utilization_percentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Weighted: {Math.round(utilizationMetrics.weighted_utilization)}%</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className={`h-3 w-3 ${getBottleneckRiskColor(utilizationMetrics.bottleneck_risk)}`} />
                <span>Risk: {utilizationMetrics.bottleneck_risk}/10</span>
              </div>
            </div>
          </div>
        )}

        {/* Traditional Metrics */}
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
          View AI Insights
        </Button>
      </CardContent>
    </Card>
  );
};

export default EnhancedResourceCard;
