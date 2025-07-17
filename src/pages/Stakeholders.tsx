
import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import StakeholderCard from '@/components/StakeholderCard';
import StakeholderForm from '@/components/StakeholderForm';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Users, Grid3x3, Table as TableIcon, Eye, Edit, Trash2 } from 'lucide-react';
import { useStakeholders } from '@/contexts/StakeholderContext';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const Stakeholders = () => {
  const { stakeholders, addStakeholder, updateStakeholder, deleteStakeholder, loading } = useStakeholders();
  const { projects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeView, setActiveView] = useState<'grid' | 'table'>('grid');

  // Filter stakeholders based on search term
  const filteredStakeholders = stakeholders.filter(stakeholder =>
    stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stakeholder.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stakeholder.organization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (stakeholder.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group stakeholders by role
  const stakeholdersByRole = filteredStakeholders.reduce((acc, stakeholder) => {
    const role = stakeholder.role || 'Other';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(stakeholder);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate metrics
  const totalStakeholders = stakeholders.length;
  const keyStakeholders = stakeholders.filter(s => s.influence_level === 'High').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const stakeholdersByProject = projects.length > 0 
    ? Math.round(stakeholders.length / projects.length) 
    : 0;

  const handleAddNew = () => {
    setSelectedStakeholder(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (stakeholder: any) => {
    setSelectedStakeholder(stakeholder);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleViewDetails = (stakeholder: any) => {
    setSelectedStakeholder(stakeholder);
    // You could open a details modal here
  };

  const handleDelete = (stakeholder: any) => {
    setSelectedStakeholder(stakeholder);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedStakeholder) return;
    
    setDeleteLoading(true);
    try {
      await deleteStakeholder(selectedStakeholder.id);
      setShowDeleteDialog(false);
      setSelectedStakeholder(null);
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (isEditing && selectedStakeholder) {
        await updateStakeholder(selectedStakeholder.id, formData);
      } else {
        await addStakeholder({
          ...formData,
          workspace_id: currentWorkspace?.id
        });
      }
      setShowForm(false);
      setSelectedStakeholder(null);
    } catch (error) {
      console.error('Error saving stakeholder:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading stakeholders...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Stakeholders</h1>
            <p className="text-muted-foreground">
              {currentWorkspace ? `${currentWorkspace.name} - ` : ''}
              Manage project stakeholders and communication
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={handleAddNew}
          >
            <Plus size={16} />
            Add Stakeholder
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalStakeholders}</div>
              <p className="text-xs text-muted-foreground">Total Stakeholders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-500">{keyStakeholders}</div>
              <p className="text-xs text-muted-foreground">Key Stakeholders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-500">{activeProjects}</div>
              <p className="text-xs text-muted-foreground">Active Projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{stakeholdersByProject}</div>
              <p className="text-xs text-muted-foreground">Avg per Project</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search stakeholders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            Filter
          </Button>
        </div>

        {/* View Toggle */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'grid' | 'table')} className="mb-6">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            {Object.keys(stakeholdersByRole).length > 0 ? (
              <div className="space-y-8">
                {Object.entries(stakeholdersByRole).map(([role, roleStakeholders]) => (
                  <div key={role}>
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-lg font-semibold">{role}</h3>
                      <Badge variant="secondary">{roleStakeholders.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {roleStakeholders.map((stakeholder) => (
                        <StakeholderCard
                          key={stakeholder.id}
                          stakeholder={stakeholder}
                          onEdit={handleEdit}
                          onViewDetails={handleViewDetails}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">No stakeholders found</p>
                <Button onClick={handleAddNew}>Add First Stakeholder</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="table" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Organization</th>
                        <th className="p-4 font-medium">Contact</th>
                        <th className="p-4 font-medium">Influence</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStakeholders.map((stakeholder) => (
                        <tr key={stakeholder.id} className="border-b hover:bg-muted/30">
                          <td className="p-4">
                            <div>
                              <p className="font-medium">{stakeholder.name}</p>
                              <p className="text-sm text-muted-foreground">{stakeholder.email}</p>
                            </div>
                          </td>
                          <td className="p-4">{stakeholder.role || 'Not specified'}</td>
                          <td className="p-4">{stakeholder.organization || 'Not specified'}</td>
                          <td className="p-4">
                            {stakeholder.email && (
                              <div className="text-sm">
                                <p>{stakeholder.email}</p>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <Badge 
                              variant={
                                stakeholder.influence_level === 'High' ? 'destructive' :
                                stakeholder.influence_level === 'Medium' ? 'default' : 'secondary'
                              }
                            >
                              {stakeholder.influence_level || 'Medium'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(stakeholder)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleEdit(stakeholder)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(stakeholder)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <TinkAssistant />

      {/* Stakeholder Form Modal */}
      {showForm && (
        <StakeholderForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedStakeholder(null);
          }}
          stakeholder={selectedStakeholder}
          onSave={handleFormSubmit}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setSelectedStakeholder(null);
        }}
        onConfirm={confirmDelete}
        itemName={selectedStakeholder?.name || ''}
        itemType="stakeholder"
        dependencies={[]}
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default Stakeholders;
