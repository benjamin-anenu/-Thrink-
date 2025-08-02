import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  Trash2,
  Edit
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Resource } from '@/contexts/ResourceContext';
import { TaskUtilizationMetrics } from '@/types/enhanced-resource';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';

interface EnhancedResourceCardProps {
  resource: Resource;
  utilizationMetrics?: TaskUtilizationMetrics;
  onViewDetails: (resource: Resource) => void;
  onEditResource: (resource: Resource) => void;
  showCompareCheckbox?: boolean;
  isSelectedForComparison?: boolean;
  onCompareToggle?: (resourceId: string, selected: boolean) => void;
}

const EnhancedResourceCard: React.FC<EnhancedResourceCardProps> = ({ 
  resource, 
  utilizationMetrics,
  onViewDetails,
  onEditResource,
  showCompareCheckbox = false,
  isSelectedForComparison = false,
  onCompareToggle 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteResource } = useEnhancedResources();

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
    if (status?.toLowerCase() === 'available') return 'active';
    if (status?.toLowerCase() === 'busy') return 'pending';
    return 'inactive';
  };

  const getPerformanceIndicator = () => {
    const utilizationPct = utilizationMetrics?.utilization_percentage || utilization || 0;
    if (utilizationPct >= 90) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (utilizationPct >= 70) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name.substring(0, 2).toUpperCase();
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteResource(resource.id);
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = () => {
    onViewDetails(resource);
  };

  const currentUtilization = utilizationMetrics?.utilization_percentage || utilization || 0;
  const currentStatus = utilizationMetrics?.status || status || 'Available';

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
          <div className="flex items-center gap-2">
            <StatusBadge status={getStatusValue(currentStatus)} />
            {utilizationMetrics?.bottleneck_risk && utilizationMetrics.bottleneck_risk > 7 && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
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
          {phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{phone}</p>
            </div>
          )}
          {location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{location}</p>
            </div>
          )}
          {hourlyRate && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Rate: {hourlyRate}</p>
            </div>
          )}
          <div className="flex items-center space-x-2">
            {getPerformanceIndicator()}
            <p className="text-sm text-muted-foreground">
              Utilization: {currentUtilization}%
            </p>
          </div>
        </div>

        {/* Enhanced Metrics */}
        {utilizationMetrics && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span>Tasks:</span>
              <span>{utilizationMetrics.task_count}/{utilizationMetrics.task_capacity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <Badge variant={
                utilizationMetrics.status === 'Overloaded' ? 'destructive' :
                utilizationMetrics.status === 'Well Utilized' ? 'default' : 'secondary'
              }>
                {utilizationMetrics.status}
              </Badge>
            </div>
            {utilizationMetrics.bottleneck_risk > 0 && (
              <div className="flex justify-between text-sm">
                <span>Risk Level:</span>
                <Badge variant={utilizationMetrics.bottleneck_risk > 7 ? 'destructive' : 'outline'}>
                  {utilizationMetrics.bottleneck_risk}/10
                </Badge>
              </div>
            )}
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-2">Availability</p>
          <div className="flex items-center space-x-2">
            <Progress value={availability} />
            <p className="text-sm text-muted-foreground">{availability}%</p>
          </div>
        </div>

        {skills && skills.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Skills</p>
            <div className="flex flex-wrap gap-1">
              {skills?.slice(0, 3).map((skill, index) => (
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

        {currentProjects && currentProjects.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Current Projects</p>
            <div className="flex flex-wrap gap-1">
              {currentProjects?.slice(0, 2).map((project, index) => (
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

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleViewDetails}
            className="flex-1"
            size="sm"
            variant="outline"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditResource(resource)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {name}? This action cannot be undone and will remove all associated data including skills, profiles, and assignments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Resource'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedResourceCard;
