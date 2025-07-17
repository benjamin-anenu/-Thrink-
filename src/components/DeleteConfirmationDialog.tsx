
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

interface Dependency {
  dependency_type: string;
  dependency_count: number;
  details: string;
}

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName: string;
  itemType: 'project' | 'resource' | 'stakeholder';
  dependencies?: Dependency[];
  isLoading?: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType,
  dependencies = [],
  isLoading = false
}) => {
  const getDefaultTitle = () => {
    switch (itemType) {
      case 'project':
        return 'Delete Project';
      case 'resource':
        return 'Delete Resource';
      case 'stakeholder':
        return 'Delete Stakeholder';
      default:
        return 'Delete Item';
    }
  };

  const getDefaultDescription = () => {
    switch (itemType) {
      case 'project':
        return `Are you sure you want to delete "${itemName}"? This project will be moved to the recycle bin for 48 hours before being permanently deleted.`;
      case 'resource':
        return `Are you sure you want to delete the resource "${itemName}"? This action cannot be undone.`;
      case 'stakeholder':
        return `Are you sure you want to delete the stakeholder "${itemName}"? This action cannot be undone.`;
      default:
        return `Are you sure you want to delete "${itemName}"?`;
    }
  };

  const hasDependencies = dependencies.length > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title || getDefaultTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>{description || getDefaultDescription()}</p>
            
            {hasDependencies && (
              <div className="space-y-2">
                <p className="font-medium text-destructive">
                  Warning: This {itemType} has active dependencies:
                </p>
                <div className="space-y-1">
                  {dependencies.map((dep, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{dep.details}</span>
                      <Badge variant="outline">{dep.dependency_count}</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Please remove these dependencies before deleting this {itemType}.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={hasDependencies || isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : `Delete ${itemType === 'project' ? 'Project' : itemType === 'resource' ? 'Resource' : 'Stakeholder'}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmationDialog;
