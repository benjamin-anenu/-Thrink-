
import React, { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderCard from '@/components/StakeholderCard';
import StakeholderListView from '@/components/StakeholderListView';
import ViewToggle from '@/components/ViewToggle';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Stakeholders = () => {
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { currentWorkspace } = useWorkspace();
  const { stakeholders, loading, createStakeholder, updateStakeholder, deleteStakeholder } = useStakeholders(currentWorkspace?.id);

  const handleSaveStakeholder = async (stakeholderData: any) => {
    console.log('Saving stakeholder:', stakeholderData);
    
    const stakeholderToSave = {
      ...stakeholderData,
      workspace_id: currentWorkspace?.id || ''
    };

    if (selectedStakeholder) {
      await updateStakeholder(selectedStakeholder.id, stakeholderToSave);
    } else {
      await createStakeholder(stakeholderToSave);
    }
    
    setShowStakeholderForm(false);
    setSelectedStakeholder(null);
  };

  const handleEditStakeholder = (stakeholder: any) => {
    setSelectedStakeholder(stakeholder);
    setShowStakeholderForm(true);
  };

  const handleDeleteStakeholder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this stakeholder?')) {
      await deleteStakeholder(id);
    }
  };

  const handleContactStakeholder = (stakeholder: any) => {
    toast.info(`Opening contact for ${stakeholder.name}`);
    // TODO: Implement contact functionality
  };

  const filteredStakeholders = stakeholders.filter(stakeholder =>
    stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stakeholder.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stakeholder.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Analytics calculations
  const totalStakeholders = stakeholders.length;
  const highInfluenceCount = stakeholders.filter(s => s.influence === 'high' || s.influence === 'critical').length;
  const activeStakeholders = stakeholders.filter(s => s.status === 'active').length;
  const recentlyAddedCount = stakeholders.filter(s => {
    const createdDate = new Date(s.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate > weekAgo;
  }).length;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Stakeholder Management</h1>
            <p className="text-muted-foreground">Manage project stakeholders, track engagement, and communication</p>
          </div>
          <Button onClick={() => setShowStakeholderForm(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Stakeholder
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Search stakeholders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ViewToggle view={viewMode} onViewChange={setViewMode} />
            </div>

            {loading ? (
              <div className="text-center py-8">Loading stakeholders...</div>
            ) : filteredStakeholders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'No stakeholders match your search.' : 'No stakeholders found.'}
                  </p>
                  <Button onClick={() => setShowStakeholderForm(true)}>
                    <Plus size={16} className="mr-2" />
                    Add First Stakeholder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStakeholders.map((stakeholder) => (
                      <StakeholderCard
                        key={stakeholder.id}
                        stakeholder={stakeholder}
                        onEdit={handleEditStakeholder}
                        onDelete={handleDeleteStakeholder}
                        onContact={handleContactStakeholder}
                      />
                    ))}
                  </div>
                ) : (
                  <StakeholderListView
                    stakeholders={filteredStakeholders}
                    onEdit={handleEditStakeholder}
                    onDelete={handleDeleteStakeholder}
                    onContact={handleContactStakeholder}
                  />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{totalStakeholders}</div>
                  <p className="text-sm text-muted-foreground">Total Stakeholders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{highInfluenceCount}</div>
                  <p className="text-sm text-muted-foreground">High Influence</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{activeStakeholders}</div>
                  <p className="text-sm text-muted-foreground">Active Stakeholders</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{recentlyAddedCount}</div>
                  <p className="text-sm text-muted-foreground">Added This Week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Stakeholder Influence Distribution</CardTitle>
                <CardDescription>
                  Breakdown of stakeholders by influence level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['critical', 'high', 'medium', 'low'].map((level) => {
                    const count = stakeholders.filter(s => s.influence === level).length;
                    const percentage = totalStakeholders > 0 ? (count / totalStakeholders) * 100 : 0;
                    return (
                      <div key={level} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {level}
                          </Badge>
                          <span className="text-sm">{count} stakeholders</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stakeholder Engagement</CardTitle>
                <CardDescription>
                  Track communication frequency and project involvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Engagement tracking features will be available soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <StakeholderForm
        open={showStakeholderForm}
        onClose={() => {
          setShowStakeholderForm(false);
          setSelectedStakeholder(null);
        }}
        stakeholder={selectedStakeholder}
        onSave={handleSaveStakeholder}
      />

      <TinkAssistant />
    </div>
  );
};

export default Stakeholders;
