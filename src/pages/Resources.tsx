
import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import ResourceForm from '@/components/ResourceForm';
import SkillsMatrix from '@/components/SkillsMatrix';
import AssignmentModal from '@/components/AssignmentModal';
import ResourceOverview from '@/components/ResourceOverview';
import AssignmentsTab from '@/components/AssignmentsTab';
import ResourceDetailsModal from '@/components/ResourceDetailsModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { useResources, Resource } from '@/contexts/ResourceContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Resources = () => {
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showResourceDetailsModal, setShowResourceDetailsModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ id: string; name: string } | null>(null);
  const [selectedResourceForDetails, setSelectedResourceForDetails] = useState<Resource | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { resources, addResource } = useResources();
  const { toast } = useToast();

  const handleResourceSave = (resource: any) => {
    console.log('Saving resource:', resource);
    addResource(resource);
    setShowResourceForm(false);
  };

  const handleAssignTask = (resourceId: string, resourceName: string) => {
    setSelectedResource({ id: resourceId, name: resourceName });
    setShowAssignmentModal(true);
  };

  const handleViewDetails = (resource: Resource) => {
    setSelectedResourceForDetails(resource);
    setShowResourceDetailsModal(true);
  };

  const handleAssignTaskFromDetails = (resourceId: string, resourceName: string) => {
    setShowResourceDetailsModal(false);
    handleAssignTask(resourceId, resourceName);
  };

  const checkResourceDependencies = async (resourceId: string) => {
    try {
      // Check for active assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('resource_assignments')
        .select('task_id, project_tasks(name, status)')
        .eq('resource_id', resourceId);

      if (assignmentsError) throw assignmentsError;

      const activeTasks = assignments?.filter(
        (assignment: any) => assignment.project_tasks?.status !== 'Completed'
      ) || [];

      const deps: any[] = [];
      if (activeTasks.length > 0) {
        deps.push({
          dependency_type: 'tasks',
          dependency_count: activeTasks.length,
          details: 'Active task assignments'
        });
      }

      return deps;
    } catch (error) {
      console.error('Error checking resource dependencies:', error);
      return [];
    }
  };

  const handleDeleteResource = async (resource: Resource) => {
    setResourceToDelete(resource);
    
    const deps = await checkResourceDependencies(resource.id);
    setDependencies(deps);
    
    setShowDeleteDialog(true);
  };

  const confirmDeleteResource = async () => {
    if (!resourceToDelete) return;
    
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceToDelete.id);

      if (error) throw error;

      // Log the deletion
      await supabase.from('audit_logs').insert({
        action: 'resource_deleted',
        resource_type: 'resource',
        resource_id: resourceToDelete.id,
        metadata: { resource_name: resourceToDelete.name }
      });

      toast({
        title: 'Success',
        description: 'Resource deleted successfully'
      });

      setShowDeleteDialog(false);
      setResourceToDelete(null);
      setDependencies([]);
      
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Resources</h1>
            <p className="text-muted-foreground">Manage team members, skills, and availability</p>
          </div>
          <Button onClick={() => setShowResourceForm(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Resource
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Team Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ResourceOverview
              resources={resources}
              onViewDetails={handleViewDetails}
              onShowResourceForm={() => setShowResourceForm(true)}
              onDeleteResource={handleDeleteResource}
            />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsMatrix />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentsTab onShowAssignmentModal={() => setShowAssignmentModal(true)} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ResourceForm
        isOpen={showResourceForm}
        onClose={() => setShowResourceForm(false)}
        onSave={handleResourceSave}
      />

      <ResourceDetailsModal
        isOpen={showResourceDetailsModal}
        onClose={() => setShowResourceDetailsModal(false)}
        resource={selectedResourceForDetails}
        onAssignTask={handleAssignTaskFromDetails}
      />

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        resourceId={selectedResource?.id}
        resourceName={selectedResource?.name}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setResourceToDelete(null);
          setDependencies([]);
        }}
        onConfirm={confirmDeleteResource}
        itemName={resourceToDelete?.name || ''}
        itemType="resource"
        dependencies={dependencies}
        isLoading={deleteLoading}
      />

      <TinkAssistant />
    </div>
  );
};

export default Resources;
