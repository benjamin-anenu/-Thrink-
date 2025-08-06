
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
    <div className="border rounded-lg mobile-table-container">
      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs md:text-sm">Stakeholder</TableHead>
            <TableHead className="text-xs md:text-sm hidden md:table-cell">Role & Department</TableHead>
            <TableHead className="text-xs md:text-sm">Status</TableHead>
            <TableHead className="text-xs md:text-sm hidden sm:table-cell">Influence</TableHead>
            <TableHead className="text-xs md:text-sm hidden lg:table-cell">Communication</TableHead>
            <TableHead className="text-xs md:text-sm hidden lg:table-cell">Contact</TableHead>
            <TableHead className="text-right text-xs md:text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stakeholders.map((stakeholder) => (
            <TableRow key={stakeholder.id} className="hover:bg-muted/50">
              <TableCell className="p-2 md:p-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <Avatar className="h-6 w-6 md:h-8 md:w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(stakeholder.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs md:text-sm truncate">{stakeholder.name}</p>
                    <p className="text-xs text-muted-foreground truncate md:hidden">{stakeholder.role}</p>
                    <p className="text-xs text-muted-foreground truncate hidden md:block">{stakeholder.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell p-2 md:p-4">
                <div>
                  <p className="font-medium text-xs md:text-sm">{stakeholder.role}</p>
                  <p className="text-xs text-muted-foreground">{stakeholder.department}</p>
                </div>
              </TableCell>
              <TableCell className="p-2 md:p-4">
                <Badge variant="secondary" className={`text-xs ${getStatusColor(stakeholder.status)}`}>
                  {stakeholder.status || 'Active'}
                </Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell p-2 md:p-4">
                <Badge variant="secondary" className={`text-xs ${getInfluenceColor(stakeholder.influence)}`}>
                  {stakeholder.influence || 'Medium'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell p-2 md:p-4">
                <Badge variant="outline" className="text-xs">
                  {stakeholder.communicationPreference || 'Email'}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell p-2 md:p-4">
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
              <TableCell className="text-right p-2 md:p-4">
                <div className="flex items-center justify-end gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onContact(stakeholder)}
                    className="h-8 w-8 p-0 lg:h-9 lg:w-auto lg:px-3"
                  >
                    <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden lg:inline ml-2">Contact</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(stakeholder)}
                    className="h-8 w-8 p-0 lg:h-9 lg:w-auto lg:px-3"
                  >
                    <Edit className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden lg:inline ml-2">Edit</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 h-8 w-8 p-0 lg:h-9 lg:w-auto lg:px-3"
                        disabled={deletingId === stakeholder.id}
                      >
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="hidden lg:inline ml-2">Delete</span>
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
