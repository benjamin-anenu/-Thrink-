
import React, { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import Layout from '@/components/Layout';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderListView from '@/components/StakeholderListView';
import StakeholderEscalationMatrix from '@/components/StakeholderEscalationMatrix';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import type { Stakeholder } from '@/types/stakeholder';

const Stakeholders: React.FC = () => {
  const { stakeholders, updateStakeholder, deleteStakeholder } = useStakeholders();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleStakeholderSaved = () => {
    setIsFormOpen(false);
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    console.log('Edit stakeholder:', stakeholder.id);
  };

  const handleDelete = (stakeholderId: string) => {
    deleteStakeholder(stakeholderId);
  };

  const handleContact = (stakeholder: Stakeholder) => {
    // Update the stakeholder with current contact date if updateStakeholder accepts partial updates
    console.log('Contact stakeholder:', stakeholder.id);
  };

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
              stakeholders={stakeholders}
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
            onSave={handleStakeholderSaved}
          />
        )}
      </div>
    </Layout>
  );
};

export default Stakeholders;
