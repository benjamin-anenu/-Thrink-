
import React, { useState } from 'react';
import { useStakeholders } from '@/hooks/useStakeholders';
import StakeholderCard from '@/components/StakeholderCard';
import StakeholderListView from '@/components/StakeholderListView';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderEscalationMatrix from '@/components/StakeholderEscalationMatrix';
import ViewToggle from '@/components/ViewToggle';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Stakeholders = () => {
  const { stakeholders, loading, addStakeholder } = useStakeholders();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stakeholders</h1>
          <p className="text-muted-foreground">
            Manage project stakeholders and communication
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ViewToggle 
            viewMode={viewMode} 
            onViewModeChange={setViewMode} 
          />
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stakeholder
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stakeholders" className="w-full">
        <TabsList>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Matrix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stakeholders" className="space-y-4">
          {/* Stakeholders Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stakeholders.map((stakeholder) => (
                <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} />
              ))}
            </div>
          ) : (
            <StakeholderListView stakeholders={stakeholders} />
          )}
        </TabsContent>
        
        <TabsContent value="escalation">
          <StakeholderEscalationMatrix stakeholders={stakeholders} />
        </TabsContent>
      </Tabs>

      {/* Add Stakeholder Form */}
      {showForm && (
        <StakeholderForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={(data) => {
            addStakeholder(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
};

export default Stakeholders;
