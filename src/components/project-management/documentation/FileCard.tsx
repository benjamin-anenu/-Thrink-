import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  File, 
  MoreHorizontal, 
  Download, 
  Trash2,
  Eye 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  folder_id?: string;
  project_id: string;
  uploaded_by?: string;
  created_at: string;
  description?: string;
  tags?: string[];
}

interface FileCardProps {
  document: ProjectDocument;
  onRefresh: () => void;
}

const FileCard: React.FC<FileCardProps> = ({ document, onRefresh }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return File;
    
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType.startsWith('video/')) return FileVideo;
    if (fileType.startsWith('audio/')) return FileAudio;
    if (fileType.includes('pdf') || fileType.includes('document')) return FileText;
    
    return File;
  };

  const getFileTypeColor = (fileType?: string) => {
    if (!fileType) return 'text-muted-foreground';
    
    if (fileType.startsWith('image/')) return 'text-green-500';
    if (fileType.startsWith('video/')) return 'text-red-500';
    if (fileType.startsWith('audio/')) return 'text-purple-500';
    if (fileType.includes('pdf')) return 'text-red-600';
    if (fileType.includes('document')) return 'text-blue-600';
    
    return 'text-muted-foreground';
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = globalThis.document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      globalThis.document.body.appendChild(a);
      a.click();
      globalThis.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast.success('File deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data } = await supabase.storage
        .from('project-files')
        .getPublicUrl(document.file_path);

      if (data.publicUrl) {
        window.open(data.publicUrl, '_blank');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      toast.error('Failed to view file');
    }
  };

  const FileIcon = getFileIcon(document.file_type);
  const iconColor = getFileTypeColor(document.file_type);

  return (
    <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105 relative">
      <CardContent className="p-4 text-center">
        <div className="relative">
          <FileIcon className={`h-12 w-12 mx-auto mb-2 ${iconColor}`} />
          
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
              <DropdownMenuItem onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? 'Downloading...' : 'Download'}
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
        
        <h4 className="font-medium text-sm truncate" title={document.file_name}>
          {document.file_name}
        </h4>
        
        <div className="text-xs text-muted-foreground mt-1">
          {document.file_size && (
            <p>{(document.file_size / 1024 / 1024).toFixed(2)} MB</p>
          )}
          <p>{new Date(document.created_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileCard;