
import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderCard from '@/components/StakeholderCard';
import StakeholderListView from '@/components/StakeholderListView';
import EscalationMatrixTab from '@/components/EscalationMatrixTab';
import RecycleBin from '@/components/RecycleBin';
import ViewToggle from '@/components/ViewToggle';
import { useStakeholders } from '@/hooks/useStakeholders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';

const Stakeholders = () => {
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('stakeholders');
  
  const { stakeholders, createStakeholder } = useStakeholders();

  const handleStakeholderSave = async (stakeholder: any) => {
    console.log('Saving stakeholder:', stakeholder);
    await createStakeholder(stakeholder);
    setShowStakeholderForm(false);
  };

  const filteredStakeholders = stakeholders.filter(stakeholder =>
    stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stakeholder.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stakeholder.organization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Stakeholder Management</h1>
            <p className="text-muted-foreground">Manage project stakeholders and escalation matrix</p>
          </div>
          {activeTab === 'stakeholders' && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowRecycleBin(true)} className="flex items-center gap-2">
                <Trash2 size={16} />
                Recycle Bin
              </Button>
              <Button onClick={() => setShowStakeholderForm(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Add Stakeholder
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="escalation">Escalation Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="stakeholders">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search stakeholders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter size={16} />
                    Filter
                  </Button>
                  <ViewToggle view={viewMode} onViewChange={setViewMode} />
                </div>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredStakeholders.map((stakeholder) => (
                    <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} />
                  ))}
                </div>
              ) : (
                <StakeholderListView stakeholders={filteredStakeholders} />
              )}

              {filteredStakeholders.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No stakeholders found matching your search.</p>
                  <Button onClick={() => setShowStakeholderForm(true)}>Add New Stakeholder</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="escalation">
            <EscalationMatrixTab />
          </TabsContent>
        </Tabs>
      </main>

      <StakeholderForm
        isOpen={showStakeholderForm}
        onClose={() => setShowStakeholderForm(false)}
        onSave={handleStakeholderSave}
      />

      <RecycleBin
        isOpen={showRecycleBin}
        onClose={() => setShowRecycleBin(false)}
      />

      <TinkAssistant />
    </div>
  );
};

export default Stakeholders;
