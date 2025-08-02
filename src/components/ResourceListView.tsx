
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Trash2, Edit } from 'lucide-react';
import { Resource } from '@/contexts/ResourceContext';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';

interface ResourceListViewProps {
  resources: Resource[];
  showCompareMode?: boolean;
  selectedForComparison?: Set<string>;
  onCompareToggle?: (resourceId: string, selected: boolean) => void;
}

const ResourceListView: React.FC<ResourceListViewProps> = ({ 
  resources, 
  showCompareMode = false,
  selectedForComparison = new Set(),
  onCompareToggle
}) => {
  const { deleteResource } = useEnhancedResources();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'overallocated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name.substring(0, 2).toUpperCase();
  };

  const handleDelete = async (resourceId: string) => {
    await deleteResource(resourceId);
  };

  if (resources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No resources found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(resource.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{resource.name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{resource.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">{resource.role}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{resource.department}</p>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(resource.status)}>
                  {resource.status || 'Available'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-blue-500" 
                      style={{ width: `${Math.min(resource.utilization || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{resource.utilization || 0}%</span>
                </div>
              </TableCell>
              <TableCell>
                <p className="font-medium">{resource.hourlyRate || 'N/A'}</p>
              </TableCell>
              <TableCell>
                <p className="text-sm">{resource.phone || 'N/A'}</p>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
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
                          onClick={() => handleDelete(resource.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete Resource
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResourceListView;
