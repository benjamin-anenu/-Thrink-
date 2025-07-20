import React from 'react';
import FolderCard from './FolderCard';
import FileCard from './FileCard';
import { Folder, FileText } from 'lucide-react';

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

interface DocumentationGridProps {
  folders: DocumentFolder[];
  documents: ProjectDocument[];
  viewMode: 'grid' | 'list';
  onFolderClick: (folderId: string) => void;
  onRefresh: () => void;
}

const DocumentationGrid: React.FC<DocumentationGridProps> = ({
  folders,
  documents,
  viewMode,
  onFolderClick,
  onRefresh
}) => {
  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {/* Folders */}
        {folders.map(folder => (
          <div
            key={folder.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={() => onFolderClick(folder.id)}
          >
            <Folder className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-medium">{folder.name}</p>
              {folder.description && (
                <p className="text-sm text-muted-foreground">{folder.description}</p>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(folder.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
        
        {/* Documents */}
        {documents.map(document => (
          <div
            key={document.id}
            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">{document.file_name}</p>
              {document.description && (
                <p className="text-sm text-muted-foreground">{document.description}</p>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {document.file_size && (
                <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB • </span>
              )}
              {new Date(document.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
      {/* Folders */}
      {folders.map(folder => (
        <FolderCard
          key={folder.id}
          folder={folder}
          onClick={() => onFolderClick(folder.id)}
          onRefresh={onRefresh}
        />
      ))}
      
      {/* Documents */}
      {documents.map(document => (
        <FileCard
          key={document.id}
          document={document}
          onRefresh={onRefresh}
        />
      ))}
      
      {/* Empty State */}
      {folders.length === 0 && documents.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No files or folders</h3>
          <p className="text-muted-foreground">
            Start by creating a folder or uploading files to organize your project documentation.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentationGrid;