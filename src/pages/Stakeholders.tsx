
import React, { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import Layout from '@/components/Layout';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderListView from '@/components/StakeholderListView';
import StakeholderGridView from '@/components/StakeholderGridView';
import StakeholderEscalationMatrix from '@/components/StakeholderEscalationMatrix';
import ViewToggle from '@/components/ViewToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';
import type { Stakeholder } from '@/types/stakeholder';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';

const Stakeholders: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();
  const { stakeholders, updateStakeholder, deleteStakeholder } = useStakeholders();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');

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

  const handleShowStakeholderForm = () => {
    setIsFormOpen(true);
  };

  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="container mx-auto px-3 md:px-4 py-4 md:py-8 max-w-7xl">
            <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
              <h1 className="text-xl md:text-3xl font-bold text-foreground">Stakeholder Management</h1>
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-4">
                <ViewToggle
                  view={currentView}
                  onViewChange={setCurrentView}
                />
                <Button onClick={() => setIsFormOpen(true)} className="flex items-center justify-center gap-2 h-11 md:h-9">
                  <Plus className="h-4 w-4" />
                  Add Stakeholder
                </Button>
              </div>
            </div>

            <Tabs defaultValue="stakeholders" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stakeholders" className="text-sm md:text-base">Stakeholders</TabsTrigger>
                <TabsTrigger value="escalation" className="text-sm md:text-base">Escalation Matrix</TabsTrigger>
              </TabsList>

              <TabsContent value="stakeholders" className="space-y-6">
                {currentView === 'list' ? (
                  <StakeholderListView 
                    stakeholders={stakeholders}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onContact={handleContact}
                  />
                ) : (
                  <StakeholderGridView
                    stakeholders={stakeholders}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onContact={handleContact}
                    onShowStakeholderForm={handleShowStakeholderForm}
                  />
                )}
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
      )}
    </AppInitializationLoader>
  );
};

export default Stakeholders;
