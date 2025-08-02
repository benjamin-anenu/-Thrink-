
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
        <p className="text-muted-foreground mb-4">No stakeholders found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Stakeholder</TableHead>
            <TableHead>Role & Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Influence</TableHead>
            <TableHead>Communication</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stakeholders.map((stakeholder) => (
            <TableRow key={stakeholder.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(stakeholder.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{stakeholder.name}</p>
                    <p className="text-sm text-muted-foreground">{stakeholder.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{stakeholder.role}</p>
                  <p className="text-sm text-muted-foreground">{stakeholder.department}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(stakeholder.status)}>
                  {stakeholder.status || 'Active'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getInfluenceColor(stakeholder.influence)}>
                  {stakeholder.influence || 'Medium'}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {stakeholder.communicationPreference || 'Email'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {stakeholder.email && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Mail className="h-3 w-3" />
                    </Button>
                  )}
                  {stakeholder.phone && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Phone className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onContact(stakeholder)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(stakeholder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StakeholderListView;
