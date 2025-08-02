
import React, { useState } from 'react';
import { useStakeholders } from '@/contexts/StakeholderContext';
import Layout from '@/components/Layout';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderListView from '@/components/StakeholderListView';
import StakeholderEscalationMatrix from '@/components/StakeholderEscalationMatrix';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

const Stakeholders: React.FC = () => {
  const { stakeholders, updateStakeholder } = useStakeholders();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleStakeholderAdded = () => {
    setIsFormOpen(false);
  };

  const handleEdit = (stakeholderId: string) => {
    console.log('Edit stakeholder:', stakeholderId);
  };

  const handleDelete = (stakeholderId: string) => {
    console.log('Delete stakeholder:', stakeholderId);
  };

  const handleContact = (stakeholderId: string) => {
    updateStakeholder(stakeholderId, { lastContact: new Date().toISOString().split('T')[0] });
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
            onStakeholderAdded={handleStakeholderAdded}
          />
        )}
      </div>
    </Layout>
  );
};

export default Stakeholders;
