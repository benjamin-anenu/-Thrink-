
import React, { useState } from 'react';
import { useStakeholders } from '@/contexts/StakeholderContext';
import Layout from '@/components/Layout';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderListView from '@/components/StakeholderListView';
import StakeholderEscalationMatrix from '@/components/StakeholderEscalationMatrix';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import type { Stakeholder as TypeStakeholder } from '@/types/stakeholder';

const Stakeholders: React.FC = () => {
  const { stakeholders, updateStakeholder } = useStakeholders();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleStakeholderAdded = () => {
    setIsFormOpen(false);
  };

  const handleEdit = (stakeholder: TypeStakeholder) => {
    console.log('Edit stakeholder:', stakeholder.id);
  };

  const handleDelete = (stakeholder: TypeStakeholder) => {
    console.log('Delete stakeholder:', stakeholder.id);
  };

  const handleContact = (stakeholder: TypeStakeholder) => {
    updateStakeholder(stakeholder.id, { lastContact: new Date().toISOString().split('T')[0] });
  };

  // Transform context stakeholders to match type interface
  const transformedStakeholders: TypeStakeholder[] = stakeholders.map(stakeholder => ({
    id: stakeholder.id,
    workspace_id: stakeholder.workspaceId,
    name: stakeholder.name,
    email: stakeholder.email,
    role: stakeholder.role,
    department: stakeholder.department || '',
    phone: stakeholder.phone || '',
    communicationPreference: stakeholder.communicationPreference,
    projects: stakeholder.projects || [],
    influence: stakeholder.influence as 'low' | 'medium' | 'high' | 'critical',
    interest: stakeholder.interest as 'low' | 'medium' | 'high' | 'critical',
    status: stakeholder.status as 'active' | 'inactive' | 'pending',
    notes: '',
    created_at: stakeholder.createdAt || new Date().toISOString(),
    updated_at: stakeholder.updatedAt || new Date().toISOString()
  }));

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Stakeholder Management</h1>
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Stakeholder
          </Button>
        </div>

        <Tabs defaultValue="stakeholders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="escalation">Escalation Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="stakeholders" className="space-y-6">
            <StakeholderListView 
              stakeholders={transformedStakeholders} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onContact={handleContact}
            />
          </TabsContent>

          <TabsContent value="escalation" className="space-y-6">
            <StakeholderEscalationMatrix />
          </TabsContent>
        </Tabs>

        {isFormOpen && (
          <StakeholderForm
            open={isFormOpen}
            onClose={() => setIsFormOpen(false)}
          />
        )}
      </div>
    </Layout>
  );
};

export default Stakeholders;
