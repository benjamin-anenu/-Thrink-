import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderIcon, FileIcon, Plus, Search, Grid, List } from 'lucide-react';
import { toast } from 'sonner';
import DocumentationGrid from './documentation/DocumentationGrid';
import FileUploadZone from './documentation/FileUploadZone';
import FolderCreationDialog from './documentation/FolderCreationDialog';

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

const ProjectDocumentation = () => {
  const { id: projectId } = useParams();
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchFoldersAndDocuments();
    }
  }, [projectId]);

  const fetchFoldersAndDocuments = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // Fetch folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('document_folders')
        .select('*')
        .eq('project_id', projectId)
        .order('name');

      if (foldersError) throw foldersError;
      
      // Fetch documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('project_documents')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (documentsError) throw documentsError;

      setFolders(foldersData || []);
      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Error fetching documentation:', error);
      toast.error('Failed to load documentation');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (name: string, description?: string) => {
    if (!projectId) return;

    try {
      const { data, error } = await supabase
        .from('document_folders')
        .insert({
          name,
          description,
          project_id: projectId,
          parent_folder_id: selectedFolder,
          color: 'hsl(var(--primary))'
        })
        .select()
        .single();

      if (error) throw error;

      setFolders(prev => [...prev, data]);
      toast.success('Folder created successfully');
      setShowCreateFolder(false);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!projectId) return;

    for (const file of files) {
      try {
        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${projectId}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('project-files')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Save document record
        const { error: dbError } = await supabase
          .from('project_documents')
          .insert({
            file_name: file.name,
            file_path: fileName,
            file_type: file.type,
            file_size: file.size,
            folder_id: selectedFolder,
            project_id: projectId
          });

        if (dbError) throw dbError;

      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    await fetchFoldersAndDocuments();
    toast.success('Files uploaded successfully');
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc =>
    doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const currentFolderDocuments = selectedFolder
    ? filteredDocuments.filter(doc => doc.folder_id === selectedFolder)
    : filteredDocuments.filter(doc => !doc.folder_id);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Documentation</h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage project files and folders
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="h-11 md:h-9 md:w-auto"
          >
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            <span className="ml-2 md:hidden">{viewMode === 'grid' ? 'List View' : 'Grid View'}</span>
          </Button>
          <Button onClick={() => setShowCreateFolder(true)} className="h-11 md:h-9">
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </div>

      {/* Search and Navigation */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files and folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 md:h-9"
          />
        </div>
      </div>

      {/* File Upload Zone */}
      <FileUploadZone onFileUpload={handleFileUpload} />

      {/* Breadcrumb Navigation */}
      {selectedFolder && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button 
            onClick={() => setSelectedFolder(null)}
            className="hover:text-foreground"
          >
            Root
          </button>
          <span>/</span>
          <span className="text-foreground">
            {folders.find(f => f.id === selectedFolder)?.name}
          </span>
        </div>
      )}

      {/* Documentation Grid */}
      <DocumentationGrid
        folders={filteredFolders.filter(f => f.parent_folder_id === selectedFolder)}
        documents={currentFolderDocuments}
        viewMode={viewMode}
        onFolderClick={setSelectedFolder}
        onRefresh={fetchFoldersAndDocuments}
      />

      {/* Create Folder Dialog */}
      <FolderCreationDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

export default ProjectDocumentation;