
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Mail, DollarSign, Eye, UserPlus } from 'lucide-react';
import { Resource } from '@/contexts/ResourceContext';

interface ResourceListViewProps {
  resources: Resource[];
  onViewDetails: (resource: Resource) => void;
  onAssignTask?: (resourceId: string, resourceName: string) => void;
}

const ResourceListView: React.FC<ResourceListViewProps> = ({
  resources,
  onViewDetails,
  onAssignTask
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overallocated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-3">
      {resources.map((resource) => (
        <Card key={resource.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getInitials(resource.name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{resource.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(resource.status)}
                    >
                      {resource.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{resource.role}</p>
                  
                  <div className="flex items-center space-x-6 mb-3">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Mail size={14} />
                      <span>{resource.email}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <DollarSign size={14} />
                      <span>{resource.hourlyRate}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Availability</span>
                        <span className="text-xs font-medium">{resource.availability}%</span>
                      </div>
                      <Progress value={resource.availability} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Utilization</span>
                        <span className="text-xs font-medium">{resource.utilization}%</span>
                      </div>
                      <Progress value={resource.utilization} className="h-2" />
                    </div>
                  </div>
                  
                  {resource.skills && resource.skills.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {resource.skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {resource.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails(resource)}
                  title="View details"
                >
                  <Eye size={16} />
                </Button>
                {onAssignTask && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssignTask(resource.id, resource.name)}
                    title="Assign task"
                  >
                    <UserPlus size={16} />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResourceListView;
