
import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import StakeholderCard from '@/components/StakeholderCard';
import StakeholderForm from '@/components/StakeholderForm';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Users, TrendingUp, AlertTriangle, Building } from 'lucide-react';
import { useStakeholder } from '@/contexts/StakeholderContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Stakeholders = () => {
  const { stakeholders, loading } = useStakeholder();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterInfluence, setFilterInfluence] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<any>(undefined);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stakeholderToDelete, setStakeholderToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dependencies, setDependencies] = useState<any[]>([]);

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || stakeholder.organization === filterDepartment;
    const matchesInfluence = filterInfluence === 'all' || stakeholder.influence_level === filterInfluence;

    return matchesSearch && matchesDepartment && matchesInfluence;
  });

  const handleAddStakeholder = () => {
    setEditingStakeholder(undefined);
    setShowForm(true);
  };

  const handleEditStakeholder = (stakeholder: any) => {
    setEditingStakeholder(stakeholder);
    setShowForm(true);
  };

  const handleViewDetails = (stakeholder: any) => {
    // For now, just edit - could open a detailed modal later
    handleEditStakeholder(stakeholder);
  };

  const checkStakeholderDependencies = async (stakeholderId: string) => {
    try {
      // Check if stakeholder is assigned to any active projects
      const { data: projects, error } = await supabase
        .from('projects')
        .select('id, name, status')
        .contains('stakeholder_ids', [stakeholderId])
        .is('deleted_at', null);

      if (error) throw error;

      const activeProjects = projects?.filter(p => p.status !== 'Completed') || [];
      
      const deps: any[] = [];
      if (activeProjects.length > 0) {
        deps.push({
          dependency_type: 'projects',
          dependency_count: activeProjects.length,
          details: 'Active project assignments'
        });
      }

      return deps;
    } catch (error) {
      console.error('Error checking stakeholder dependencies:', error);
      return [];
    }
  };

  const handleDeleteStakeholder = async (stakeholder: any) => {
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
      
      // Refresh the page
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

  // Get unique organizations for filter
  const organizations = Array.from(new Set(stakeholders.map(s => s.organization).filter(Boolean)));

  // Calculate statistics
  const stats = {
    total: stakeholders.length,
    highInfluence: stakeholders.filter(s => s.influence_level === 'High').length,
    mediumInfluence: stakeholders.filter(s => s.influence_level === 'Medium').length,
    lowInfluence: stakeholders.filter(s => s.influence_level === 'Low').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading stakeholders...</p>
            </div>
          </div>
        </main>
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
            <p className="text-muted-foreground">Manage project stakeholders and their involvement levels</p>
          </div>
          <Button onClick={handleAddStakeholder} className="flex items-center gap-2">
            <Plus size={16} />
            Add Stakeholder
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Stakeholders</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">High Influence</CardTitle>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.highInfluence}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Medium Influence</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.mediumInfluence}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Organizations</CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{organizations.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search stakeholders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map(org => (
                    <SelectItem key={org} value={org}>{org}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterInfluence} onValueChange={setFilterInfluence}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by influence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Influence Levels</SelectItem>
                  <SelectItem value="High">High Influence</SelectItem>
                  <SelectItem value="Medium">Medium Influence</SelectItem>
                  <SelectItem value="Low">Low Influence</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stakeholders Grid */}
            {filteredStakeholders.length === 0 ? (
              <div className="text-center py-12">
                {stakeholders.length === 0 ? (
                  <div className="text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Stakeholders Yet</h3>
                    <p className="mb-4">Start by adding your first stakeholder to track project involvement.</p>
                    <Button onClick={handleAddStakeholder}>Add Stakeholder</Button>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    <p className="mb-4">No stakeholders match your search criteria.</p>
                    <Button variant="outline" onClick={() => {
                      setSearchTerm('');
                      setFilterDepartment('all');
                      setFilterInfluence('all');
                    }}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStakeholders.map((stakeholder) => (
                  <StakeholderCard
                    key={stakeholder.id}
                    stakeholder={stakeholder}
                    onEdit={handleEditStakeholder}
                    onViewDetails={handleViewDetails}
                    onDelete={handleDeleteStakeholder}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
              <p>Detailed stakeholder analytics and insights will be available here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <TinkAssistant />

      <StakeholderForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingStakeholder(undefined);
        }}
        stakeholder={editingStakeholder}
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
    </div>
  );
};

export default Stakeholders;
