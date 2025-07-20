
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Upload, FolderPlus, Download, Trash2, FileText, Image, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProjectDocument {
  id: string;
  file_name: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  folder_name?: string;
  created_at: string;
  uploaded_by?: string;
}

interface DocumentFolder {
  id: string;
  name: string;
  parent_folder_id?: string;
  created_at: string;
}

interface ProjectDocumentationProps {
  projectId: string;
}

const ProjectDocumentation: React.FC<ProjectDocumentationProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchDocuments();
    fetchFolders();
  }, [projectId, currentFolder]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .eq('folder_name', currentFolder || '')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    }
  };

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('document_folders')
        .select('*')
        .eq('project_id', projectId)
        .eq('parent_folder_id', currentFolder || '')
        .order('name');

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    try {
      const { error } = await supabase
        .from('document_folders')
        .insert({
          name: folderName,
          project_id: projectId,
          parent_folder_id: currentFolder
        });

      if (error) throw error;
      
      toast.success('Folder created successfully');
      setFolderName('');
      setShowFolderDialog(false);
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        // Check file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File type ${file.type} not allowed. Only PDF, JPEG, and PNG files are supported.`);
          return;
        }

        // Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `${projectId}/${currentFolder || 'root'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save document record to database
        const { error: dbError } = await supabase
          .from('project_documents')
          .insert({
            project_id: projectId,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            folder_name: currentFolder || null
          });

        if (dbError) throw dbError;

        return true;
      } catch (error) {
        console.error('Error uploading file:', file.name, error);
        toast.error(`Failed to upload ${file.name}`);
        return false;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successCount = results.filter(Boolean).length;
    
    if (successCount > 0) {
      toast.success(`${successCount} file(s) uploaded successfully`);
      fetchDocuments();
    }

    setUploading(false);
    setSelectedFiles(null);
    setShowUploadDialog(false);
  };

  const handleDownload = async (document: ProjectDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('project-files')
        .download(document.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (document: ProjectDocument) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

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
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="h-8 w-8" />;
    
    if (fileType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (fileType.includes('image')) return <Image className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return <div>Loading documentation...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Documentation</h2>
        <div className="flex gap-2">
          <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
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
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter folder name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateFolder}>Create</Button>
                  <Button variant="outline" onClick={() => setShowFolderDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Documents</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  className="hidden"
                />
                <div
                  className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
                    isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports PDF, JPEG, PNG files</p>
                </div>
                {selectedFiles && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Selected Files:</h4>
                    {Array.from(selectedFiles).map((file, index) => (
                      <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                        {file.name} ({formatFileSize(file.size)})
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={() => selectedFiles && handleFileUpload(selectedFiles)}
                    disabled={!selectedFiles || uploading}
                  >
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Folders Grid */}
      {folders.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Folders</h3>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {folders.map((folder) => (
              <Card
                key={folder.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setCurrentFolder(folder.id)}
              >
                <CardContent className="p-4 text-center">
                  <FolderPlus className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm font-medium truncate">{folder.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Documents</h3>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No documents uploaded yet
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4">
            {documents.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="text-center mb-3">
                    {getFileIcon(document.file_type)}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium truncate" title={document.file_name}>
                      {document.file_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(document.file_size)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(document.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(document)}
                        className="flex-1"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(document)}
                        className="flex-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Back button for nested folders */}
      {currentFolder && (
        <Button
          variant="outline"
          onClick={() => setCurrentFolder(null)}
          className="fixed bottom-4 right-4"
        >
          Back to Root
        </Button>
      )}
    </div>
  );
};

export default ProjectDocumentation;
