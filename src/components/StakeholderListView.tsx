
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
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/40">
            <TableHead className="font-semibold text-foreground">Stakeholder</TableHead>
            <TableHead className="font-semibold text-foreground hidden md:table-cell">Role & Department</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
            <TableHead className="font-semibold text-foreground hidden sm:table-cell">Influence</TableHead>
            <TableHead className="font-semibold text-foreground hidden lg:table-cell">Communication</TableHead>
            <TableHead className="font-semibold text-foreground hidden lg:table-cell">Quick Contact</TableHead>
            <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stakeholders.map((stakeholder) => (
            <TableRow key={stakeholder.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-border/20">
                    <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                      {getInitials(stakeholder.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="font-semibold text-sm text-foreground">{stakeholder.name}</p>
                    <p className="text-xs text-muted-foreground md:hidden">{stakeholder.role}</p>
                    <p className="text-xs text-muted-foreground hidden md:block">{stakeholder.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell py-4">
                <div className="space-y-1">
                  <p className="font-medium text-sm text-foreground">{stakeholder.role}</p>
                  <p className="text-xs text-muted-foreground">{stakeholder.department}</p>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className={`text-xs font-medium ${getStatusColor(stakeholder.status)}`}>
                  {stakeholder.status || 'Active'}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell py-4">
                <Badge variant="outline" className={`text-xs font-medium ${getInfluenceColor(stakeholder.influence)}`}>
                  {stakeholder.influence || 'Medium'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell py-4">
                <Badge variant="outline" className="text-xs bg-accent/10 text-accent-foreground border-accent/20">
                  {stakeholder.communicationPreference || 'Email'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell py-4">
                <div className="flex items-center gap-1">
                  {stakeholder.email && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-accent/50"
                      onClick={() => window.open(`mailto:${stakeholder.email}`)}
                      title={`Email ${stakeholder.name}`}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  {stakeholder.phone && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-accent/50"
                      onClick={() => window.open(`tel:${stakeholder.phone}`)}
                      title={`Call ${stakeholder.name}`}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right py-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onContact(stakeholder)}
                    className="h-9 px-3 text-xs font-medium hover:bg-accent/50"
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span className="hidden lg:inline">Contact</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(stakeholder)}
                    className="h-9 px-3 text-xs font-medium hover:bg-accent/50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="hidden lg:inline">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 px-3 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingId === stakeholder.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden lg:inline">Delete</span>
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
