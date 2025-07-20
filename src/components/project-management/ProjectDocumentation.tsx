
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, FolderPlus, File, Folder, Download, Trash2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentFolder {
  id: string;
  name: string;
  parent_folder_id?: string;
  project_id: string;
  created_at: string;
}

interface ProjectDocument {
  id: string;
  project_id: string;
  folder_name?: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
}

interface ProjectDocumentationProps {
  projectId: string;
}

const ProjectDocumentation: React.FC<ProjectDocumentationProps> = ({ projectId }) => {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [foldersResult, documentsResult] = await Promise.all([
        supabase.from('document_folders').select('*').eq('project_id', projectId),
        supabase.from('project_documents').select('*').eq('project_id', projectId)
      ]);

      if (foldersResult.error) throw foldersResult.error;
      if (documentsResult.error) throw documentsResult.error;

      setFolders(foldersResult.data || []);
      setDocuments(documentsResult.data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const { error } = await supabase
        .from('document_folders')
        .insert([{
          project_id: projectId,
          name: newFolderName.trim(),
          parent_folder_id: currentFolder
        }]);

      if (error) throw error;

      toast.success('Folder created successfully');
      setNewFolderName('');
      setShowFolderDialog(false);
      loadData();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      for (const file of acceptedFiles) {
        // Check file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File type ${file.type} not allowed. Only PDF, JPEG, and PNG files are supported.`);
          continue;
        }

        // Generate unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save document metadata
        const { error: dbError } = await supabase
          .from('project_documents')
          .insert([{
            project_id: projectId,
            folder_name: currentFolder,
            file_name: file.name,
            file_path: uploadData.path,
            file_type: file.type,
            file_size: file.size
          }]);

        if (dbError) throw dbError;
      }

      toast.success('Files uploaded successfully');
      loadData();
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
    }
  }, [projectId, currentFolder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: true
  });

  const deleteDocument = async (document: ProjectDocument) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([document.file_path]);

      if (storageError) console.warn('Storage deletion failed:', storageError);

      // Delete from database
      const { error: dbError } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast.success('Document deleted successfully');
      loadData();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const downloadDocument = async (document: ProjectDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(document.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const getCurrentFolderDocuments = () => {
    return documents.filter(doc => doc.folder_name === currentFolder);
  };

  const getCurrentSubfolders = () => {
    return folders.filter(folder => folder.parent_folder_id === currentFolder);
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Project Documentation</span>
            <div className="flex gap-2">
              <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Folder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Folder Name</Label>
                      <Input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Enter folder name"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                        Create Folder
                      </Button>
                      <Button variant="outline" onClick={() => setShowFolderDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Breadcrumb */}
          {currentFolder && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentFolder(null)}
              >
                ← Back to Root
              </Button>
            </div>
          )}

          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            {uploading ? (
              <p>Uploading files...</p>
            ) : isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium">Drop files here or click to upload</p>
                <p className="text-sm text-muted-foreground">
                  Supports PDF, JPEG, and PNG files
                </p>
              </div>
            )}
          </div>

          {/* Folders */}
          {getCurrentSubfolders().length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Folders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentSubfolders().map((folder) => (
                  <Card 
                    key={folder.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setCurrentFolder(folder.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-3">
                      <Folder className="h-8 w-8 text-blue-500" />
                      <span className="font-medium">{folder.name}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {getCurrentFolderDocuments().length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Documents</h3>
              <div className="space-y-2">
                {getCurrentFolderDocuments().map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{document.file_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {document.file_size && `${Math.round(document.file_size / 1024)} KB`} •{' '}
                          {new Date(document.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadDocument(document)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(document)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {getCurrentSubfolders().length === 0 && getCurrentFolderDocuments().length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No folders or documents in this location
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDocumentation;
