import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import ResourceForm from '@/components/ResourceForm';
import SkillsMatrix from '@/components/SkillsMatrix';
import AssignmentModal from '@/components/AssignmentModal';
import ResourceOverview from '@/components/ResourceOverview';
import AssignmentsTab from '@/components/AssignmentsTab';
import ResourceDetailsModal from '@/components/ResourceDetailsModal';
import { useResources } from '@/hooks/useResources';
import type { Resource } from '@/types/resource';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

const Resources = () => {
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showResourceDetailsModal, setShowResourceDetailsModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ id: string; name: string } | null>(null);
  const [selectedResourceForDetails, setSelectedResourceForDetails] = useState<Resource | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { resources, createResource } = useResources();

  const handleResourceSave = async (resource: any) => {
    console.log('Saving resource:', resource);
    await createResource(resource);
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

      <TinkAssistant />
    </div>
  );
};

export default Resources;
