
import React, { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import Layout from '@/components/Layout';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderListView from '@/components/StakeholderListView';
import StakeholderGridView from '@/components/StakeholderGridView';
import StakeholderEscalationMatrix from '@/components/StakeholderEscalationMatrix';
import StakeholderContactModal from '@/components/StakeholderContactModal';
import ViewToggle from '@/components/ViewToggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Shield } from 'lucide-react';
import type { Stakeholder } from '@/types/stakeholder';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useMobileComplexity } from '@/hooks/useMobileComplexity';
import { DesktopRecommendation } from '@/components/ui/desktop-recommendation';

const Stakeholders: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();
  const { stakeholders, createStakeholder, updateStakeholder, deleteStakeholder } = useStakeholders();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stakeholders'>('dashboard');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactingStakeholder, setContactingStakeholder] = useState<Stakeholder | null>(null);
  
  const { isMobile } = useMobileComplexity();

  const handleStakeholderSaved = async (stakeholderData: any) => {
    try {
      setIsFormOpen(false);
      setEditingStakeholder(null);
    } catch (error) {
      console.error('Failed to save stakeholder:', error);
    }
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setIsFormOpen(true);
  };

  const handleDelete = (stakeholderId: string) => {
    deleteStakeholder(stakeholderId);
  };

  const handleContact = (stakeholder: Stakeholder) => {
    setContactingStakeholder(stakeholder);
    setIsContactModalOpen(true);
  };

  const handleContactComplete = (stakeholder: Stakeholder, contactType: string, message?: string) => {
    // Update last contact date and log the interaction
    updateStakeholder(stakeholder.id, {
      ...stakeholder,
      updated_at: new Date().toISOString()
    });
    setIsContactModalOpen(false);
    setContactingStakeholder(null);
  };

  const handleShowStakeholderForm = () => {
    setEditingStakeholder(null);
    setIsFormOpen(true);
  };

  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Stakeholder Management</h1>
                  <p className="text-muted-foreground">
                    Manage project stakeholders and escalation processes
                  </p>
                </div>
                <Button onClick={handleShowStakeholderForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stakeholder
                </Button>
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'dashboard' | 'stakeholders')}>
                <TabsList>
                  <TabsTrigger value="dashboard" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Escalation Matrix
                  </TabsTrigger>
                  <TabsTrigger value="stakeholders" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    View Stakeholders
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                  {isMobile ? (
                    <DesktopRecommendation
                      title="Escalation Matrix - Better on Desktop"
                      description="The escalation matrix with detailed configuration is optimized for desktop viewing."
                    />
                  ) : (
                    <StakeholderEscalationMatrix />
                  )}
                </TabsContent>

                <TabsContent value="stakeholders" className="space-y-6">
                  {!isMobile && (
                    <div className="flex justify-between items-center">
                      <ViewToggle 
                        view={currentView} 
                        onViewChange={setCurrentView}
                      />
                    </div>
                  )}

                  {isMobile || currentView === 'list' ? (
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
              </Tabs>

              {isFormOpen && (
                <StakeholderForm
                  open={isFormOpen}
                  onClose={() => setIsFormOpen(false)}
                  stakeholder={editingStakeholder}
                  onSave={async (stakeholderData) => {
                    if (editingStakeholder) {
                      await updateStakeholder(editingStakeholder.id, stakeholderData);
                    } else {
                      await createStakeholder(stakeholderData);
                    }
                    handleStakeholderSaved(stakeholderData);
                  }}
                />
              )}

              <StakeholderContactModal
                open={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                stakeholder={contactingStakeholder}
                onContact={handleContactComplete}
              />
            </div>
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default Stakeholders;
