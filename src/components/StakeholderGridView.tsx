
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Mail, Phone, Edit, Trash2, MessageSquare } from 'lucide-react';
import type { Stakeholder } from '@/types/stakeholder';

interface StakeholderGridViewProps {
  stakeholders: Stakeholder[];
  onEdit: (stakeholder: Stakeholder) => void;
  onDelete: (stakeholderId: string) => void;
  onContact: (stakeholder: Stakeholder) => void;
  onShowStakeholderForm: () => void;
}

const StakeholderGridView: React.FC<StakeholderGridViewProps> = ({
  stakeholders,
  onEdit,
  onDelete,
  onContact,
  onShowStakeholderForm
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getInfluenceColor = (influence: string) => {
    switch (influence?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'N/A';
    return name.substring(0, 2).toUpperCase();
  };

  const handleDelete = async (stakeholderId: string) => {
    setDeletingId(stakeholderId);
    try {
      await onDelete(stakeholderId);
    } finally {
      setDeletingId(null);
    }
  };

  if (stakeholders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No stakeholders found matching your search.</p>
        <Button onClick={onShowStakeholderForm}>Add New Stakeholder</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {stakeholders.map((stakeholder) => (
        <Card key={stakeholder.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-semibold">{stakeholder.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={getStatusColor(stakeholder.status)}>
                  {stakeholder.status || 'Active'}
                </Badge>
              </div>
            </div>
            <CardDescription>{stakeholder.role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>{getInitials(stakeholder.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{stakeholder.name}</p>
                <p className="text-sm text-muted-foreground">{stakeholder.department}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{stakeholder.email}</p>
              </div>
              {stakeholder.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{stakeholder.phone}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Influence Level:</span>
                <Badge variant="secondary" className={getInfluenceColor(stakeholder.influence)}>
                  {stakeholder.influence || 'Medium'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Communication:</span>
                <Badge variant="outline">
                  {stakeholder.communicationPreference || 'Email'}
                </Badge>
              </div>
            </div>

            {stakeholder.projects && stakeholder.projects.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Projects</p>
                <div className="flex flex-wrap gap-1">
                  {stakeholder.projects.slice(0, 2).map((project, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {project}
                    </Badge>
                  ))}
                  {stakeholder.projects.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{stakeholder.projects.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => onContact(stakeholder)} 
                className="flex-1"
                size="sm"
                variant="outline"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(stakeholder)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={deletingId === stakeholder.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Stakeholder</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {stakeholder.name}? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(stakeholder.id)}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={deletingId === stakeholder.id}
                    >
                      {deletingId === stakeholder.id ? 'Deleting...' : 'Delete Stakeholder'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StakeholderGridView;
