import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Folder, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentFolder {
  id: string;
  name: string;
  description?: string;
  color?: string;
  parent_folder_id?: string;
  project_id: string;
  created_at: string;
  created_by?: string;
}

interface FolderCardProps {
  folder: DocumentFolder;
  onClick: () => void;
  onRefresh: () => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, onRefresh }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('document_folders')
        .delete()
        .eq('id', folder.id);

      if (error) throw error;

      toast.success('Folder deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 relative"
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div className="relative">
          <Folder 
            className="h-12 w-12 mx-auto mb-2 text-primary" 
            fill="hsl(var(--primary))"
            style={{ color: 'hsl(var(--primary))' }}
          />
          
          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h4 className="font-medium text-sm truncate" title={folder.name}>
          {folder.name}
        </h4>
        
        {folder.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={folder.description}>
            {folder.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default FolderCard;