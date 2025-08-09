
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, MessageSquare, Mail, Phone } from 'lucide-react';
import type { Stakeholder } from '@/types/stakeholder';

interface StakeholderListViewProps {
  stakeholders: Stakeholder[];
  onEdit: (stakeholder: Stakeholder) => void;
  onDelete: (stakeholderId: string) => void;
  onContact: (stakeholder: Stakeholder) => void;
}

const StakeholderListView: React.FC<StakeholderListViewProps> = ({
  stakeholders,
  onEdit,
  onDelete,
  onContact
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getInfluenceColor = (influence: string) => {
    switch (influence?.toLowerCase()) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-warning/10 text-warning border-warning/20';
      case 'medium': return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'low': return 'bg-secondary/10 text-secondary-foreground border-secondary/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': return 'bg-muted/10 text-muted-foreground border-muted/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
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
        <p className="text-muted-foreground mb-4">No stakeholders found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-sm py-2 px-3">Stakeholder</TableHead>
            <TableHead className="text-sm py-2 px-3 hidden md:table-cell">Role</TableHead>
            <TableHead className="text-sm py-2 px-3 hidden md:table-cell">Department</TableHead>
            <TableHead className="text-sm py-2 px-3 hidden lg:table-cell">Projects</TableHead>
            <TableHead className="text-sm py-2 px-3">Status</TableHead>
            <TableHead className="text-sm py-2 px-3 hidden sm:table-cell">Influence</TableHead>
            <TableHead className="text-sm py-2 px-3 hidden lg:table-cell">Communication</TableHead>
            <TableHead className="text-sm py-2 px-3 hidden xl:table-cell">Quick Contact</TableHead>
            <TableHead className="text-sm py-2 px-3">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stakeholders.map((stakeholder) => (
            <TableRow key={stakeholder.id}>
              <TableCell className="text-sm py-2 px-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-medium">
                      {getInitials(stakeholder.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{stakeholder.name}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{stakeholder.role}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">{stakeholder.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm py-2 px-3 hidden md:table-cell">
                <span className="font-medium">{stakeholder.role}</span>
              </TableCell>
              <TableCell className="text-sm py-2 px-3 hidden md:table-cell">
                <span className="text-muted-foreground">{stakeholder.department}</span>
              </TableCell>
              <TableCell className="text-sm py-2 px-3 hidden lg:table-cell">
                <Badge variant="outline" className="text-xs">
                  {stakeholder.projects?.length || 0} {stakeholder.projects?.length === 1 ? 'Project' : 'Projects'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm py-2 px-3">
                <Badge variant="outline" className={`text-xs ${getStatusColor(stakeholder.status)}`}>
                  {stakeholder.status || 'Active'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm py-2 px-3 hidden sm:table-cell">
                <Badge variant="outline" className={`text-xs ${getInfluenceColor(stakeholder.influence)}`}>
                  {stakeholder.influence || 'Medium'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm py-2 px-3 hidden lg:table-cell">
                <Badge variant="outline" className="text-xs">
                  {stakeholder.communicationPreference || 'Email'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm py-2 px-3 hidden xl:table-cell">
                <div className="flex items-center gap-1">
                  {stakeholder.email && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(`mailto:${stakeholder.email}`)}
                      title={`Email ${stakeholder.name}`}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                  )}
                  {stakeholder.phone && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => window.open(`tel:${stakeholder.phone}`)}
                      title={`Call ${stakeholder.name}`}
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm py-2 px-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onContact(stakeholder)}
                    className="h-6 w-6 p-0"
                    title="Contact"
                  >
                    <MessageSquare className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(stakeholder)}
                    className="h-6 w-6 p-0"
                    title="Edit"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        disabled={deletingId === stakeholder.id}
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
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
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deletingId === stakeholder.id}
                        >
                          {deletingId === stakeholder.id ? 'Deleting...' : 'Delete Stakeholder'}
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

export default StakeholderListView;
