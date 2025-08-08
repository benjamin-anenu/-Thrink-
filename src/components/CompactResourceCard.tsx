
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Trash2, Edit, Mail, Phone, MapPin } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { Resource } from '@/types/resource';
import { TaskUtilizationMetrics } from '@/types/enhanced-resource';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';

interface CompactResourceCardProps {
  resource: Resource;
  utilizationMetrics?: TaskUtilizationMetrics;
  onViewDetails: (resource: Resource) => void;
  onEditResource: (resource: Resource) => void;
}

const CompactResourceCard: React.FC<CompactResourceCardProps> = ({ 
  resource, 
  utilizationMetrics,
  onViewDetails,
  onEditResource
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteResource } = useEnhancedResources();

  const getStatusValue = (status: string): 'active' | 'inactive' | 'pending' => {
    if (status?.toLowerCase() === 'available') return 'active';
    if (status?.toLowerCase() === 'busy') return 'pending';
    return 'inactive';
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

  const currentUtilization = utilizationMetrics?.utilization_percentage || resource.utilization || 0;
  const currentStatus = utilizationMetrics?.status || resource.status || 'Available';

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold truncate">{resource.name || 'Unknown'}</CardTitle>
          <div className="flex items-center gap-2">
            <StatusBadge status={getStatusValue(currentStatus)} />
            {(currentUtilization >= 100 || (utilizationMetrics?.status?.includes('Overloaded'))) && (
              <Badge 
                variant="destructive" 
                className="cursor-pointer"
                onClick={() => onViewDetails(resource)}
              >
                Overloaded
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{getInitials(resource.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{resource.role}</p>
            <p className="text-xs text-muted-foreground truncate">{resource.department}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground truncate">{resource.email}</p>
          </div>
          
          {resource.phone && (
            <div className="flex items-center space-x-2">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">{resource.phone}</p>
            </div>
          )}
          
          {resource.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">{resource.location}</p>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Availability</span>
            <span className="text-xs text-muted-foreground">{Math.max(0, 100 - currentUtilization)}%</span>
          </div>
          <Progress value={Math.max(0, 100 - currentUtilization)} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Utilization</span>
            <span className="text-xs text-muted-foreground">{currentUtilization}%</span>
          </div>
          <Progress value={currentUtilization} className="h-2" />
        </div>

        <div className="flex gap-1 pt-2">
          <Button 
            onClick={() => onViewDetails(resource)}
            className="flex-1"
            size="sm"
            variant="outline"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditResource(resource)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Resource</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {resource.name}? This action cannot be undone.
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

export default CompactResourceCard;
