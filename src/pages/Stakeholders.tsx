import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderCard from '@/components/StakeholderCard';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { useStakeholders, Stakeholder } from '@/hooks/useStakeholders';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Users, Building, Mail, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Stakeholders = () => {
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stakeholderToDelete, setStakeholderToDelete] = useState<Stakeholder | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dependencies, setDependencies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [influenceFilter, setInfluenceFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { stakeholders, loading } = useStakeholders();
  const { toast } = useToast();

  const handleStakeholderSave = (stakeholder: Stakeholder) => {
    console.log('Saving stakeholder:', stakeholder);
    // addStakeholder(stakeholder); // Assuming you have an addStakeholder function
    setShowStakeholderForm(false);
  };

  const handleEditStakeholder = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setShowStakeholderForm(true);
  };

  const handleCancelEdit = () => {
    setSelectedStakeholder(null);
    setShowStakeholderForm(false);
  };

  const checkStakeholderDependencies = async (stakeholderId: string) => {
    try {
      // Check for active project assignments
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, name')
        .contains('stakeholder_ids', [stakeholderId])
        .eq('deleted_at', null);

      if (projectsError) throw projectsError;

      const deps: any[] = [];
      if (projects && projects.length > 0) {
        deps.push({
          dependency_type: 'projects',
          dependency_count: projects.length,
          details: `Assigned to ${projects.length} active project(s)`
        });
      }

      return deps;
    } catch (error) {
      console.error('Error checking stakeholder dependencies:', error);
      return [];
    }
  };

  const handleDeleteStakeholder = async (stakeholder: Stakeholder) => {
    setStakeholderToDelete(stakeholder);
    
    const deps = await checkStakeholderDependencies(stakeholder.id);
    setDependencies(deps);
    
    setShowDeleteDialog(true);
  };

  const confirmDeleteStakeholder = async () => {
    if (!stakeholderToDelete) return;
    
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', stakeholderToDelete.id);

      if (error) throw error;

      // Log the deletion
      await supabase.from('audit_logs').insert({
        action: 'stakeholder_deleted',
        resource_type: 'stakeholder',
        resource_id: stakeholderToDelete.id,
        metadata: { stakeholder_name: stakeholderToDelete.name }
      });

      toast({
        title: 'Success',
        description: 'Stakeholder deleted successfully'
      });

      setShowDeleteDialog(false);
      setStakeholderToDelete(null);
      setDependencies([]);
      
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete stakeholder',
        variant: 'destructive'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (stakeholder.email && stakeholder.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (stakeholder.organization && stakeholder.organization.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || stakeholder.role === roleFilter;
    const matchesInfluence = influenceFilter === 'all' || stakeholder.influence_level === influenceFilter;

    return matchesSearch && matchesRole && matchesInfluence;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Stakeholders</h1>
            <p className="text-muted-foreground">Manage project stakeholders and their engagement</p>
          </div>
          <Button onClick={() => setShowStakeholderForm(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Stakeholder
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Stakeholder Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stakeholders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="Sponsor">Sponsor</SelectItem>
                      <SelectItem value="User">User</SelectItem>
                      <SelectItem value="Vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={influenceFilter} onValueChange={setInfluenceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Influence Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Influence Levels</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stakeholders</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stakeholders.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Influence</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stakeholders.filter(s => s.influence_level === 'High').length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Set(stakeholders.filter(s => s.organization).map(s => s.organization)).size}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">With Email</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stakeholders.filter(s => s.email).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stakeholder Cards */}
            {filteredStakeholders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Users className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Stakeholders Found</h3>
                  <p>Add your first stakeholder to get started.</p>
                </div>
                <Button onClick={() => setShowStakeholderForm(true)}>Add Stakeholder</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStakeholders.map(stakeholder => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onEdit={(stakeholder) => {
                      setSelectedStakeholder(stakeholder);
                      setShowStakeholderForm(true);
                    }}
                    onDelete={handleDeleteStakeholder}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Stakeholder analytics will be available soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <StakeholderForm
        open={showStakeholderForm}
        onClose={() => {
          setShowStakeholderForm(false);
          setSelectedStakeholder(null);
        }}
        stakeholder={selectedStakeholder}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setStakeholderToDelete(null);
          setDependencies([]);
        }}
        onConfirm={confirmDeleteStakeholder}
        itemName={stakeholderToDelete?.name || ''}
        itemType="stakeholder"
        dependencies={dependencies}
        isLoading={deleteLoading}
      />

      <TinkAssistant />
    </div>
  );
};

export default Stakeholders;
