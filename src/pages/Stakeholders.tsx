
import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import StakeholderCard from '@/components/StakeholderCard';
import StakeholderForm from '@/components/StakeholderForm';
import EscalationMatrix from '@/components/EscalationMatrix';
import { useStakeholders } from '@/hooks/useStakeholders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Filter, UserCheck, AlertTriangle, MessageSquare } from 'lucide-react';

const Stakeholders = () => {
  const { stakeholders, createStakeholder, updateStakeholder, deleteStakeholder, loading, refreshStakeholders } = useStakeholders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterInfluence, setFilterInfluence] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<any>(undefined);

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all'; // Remove department filter since it's not in DB
    const matchesInfluence = filterInfluence === 'all' || stakeholder.influence?.toLowerCase() === filterInfluence;
    return matchesSearch && matchesDepartment && matchesInfluence;
  });

  const handleSaveStakeholder = async (stakeholder: any) => {
    // Map form data to database structure
    const dbStakeholder = {
      ...stakeholder,
      workspace_id: 'default-workspace', // You may want to get this from context
      influence: stakeholder.influence?.toLowerCase(),
    };

    if (editingStakeholder) {
      await updateStakeholder(stakeholder.id, dbStakeholder);
    } else {
      await createStakeholder(dbStakeholder);
    }
    setEditingStakeholder(undefined);
    setShowForm(false);
  };

  const handleEditStakeholder = (stakeholder: any) => {
    // Map database structure to form structure
    const formStakeholder = {
      ...stakeholder,
      department: stakeholder.role || '',
      phone: '',
      communicationPreference: 'Email' as const,
      influence: (stakeholder.influence?.charAt(0).toUpperCase() + stakeholder.influence?.slice(1)) as 'High' | 'Medium' | 'Low',
      interest: 'Medium' as 'High' | 'Medium' | 'Low',
      projects: [],
      status: 'Active' as const,
      lastContact: new Date().toISOString().split('T')[0]
    };
    setEditingStakeholder(formStakeholder);
    setShowForm(true);
  };

  const handleDeleteStakeholder = async (stakeholder: any) => {
    if (window.confirm(`Are you sure you want to delete ${stakeholder.name}? This action cannot be undone.`)) {
      await deleteStakeholder(stakeholder.id);
      await refreshStakeholders();
    }
  };

  // Get unique roles since we don't have organization field
  const roles = [...new Set(stakeholders.map(s => s.role).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
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
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Stakeholder Management</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your project stakeholders, communication preferences, and escalation matrix.
          </p>
        </div>

        <Tabs defaultValue="stakeholders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stakeholders" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Stakeholders</span>
            </TabsTrigger>
            <TabsTrigger value="escalation" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Escalation Matrix</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Communication Plan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stakeholders" className="space-y-6">
            {/* Stakeholder Management Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search stakeholders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterInfluence} onValueChange={setFilterInfluence}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Influence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Stakeholder</span>
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Stakeholders</p>
                      <p className="text-2xl font-bold">{stakeholders.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">High Influence</p>
                      <p className="text-2xl font-bold">{stakeholders.filter(s => s.influence === 'high').length}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Roles</p>
                      <p className="text-2xl font-bold">{roles.length}</p>
                    </div>
                    <Badge className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Status</p>
                      <p className="text-2xl font-bold">{stakeholders.filter(s => s.status === 'active').length}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stakeholder Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStakeholders.map((stakeholder) => (
                <StakeholderCard
                  key={stakeholder.id}
                  stakeholder={{
                    ...stakeholder,
                    // Map database fields to component expected fields
                    department: stakeholder.role || '',
                    phone: '',
                    avatar: '',
                    communicationPreference: 'Email' as 'Email' | 'Phone' | 'Slack' | 'In-person',
                    projects: [],
                    escalationLevel: undefined,
                    influence: (stakeholder.influence?.charAt(0).toUpperCase() + stakeholder.influence?.slice(1)) as 'High' | 'Medium' | 'Low',
                    interest: 'Medium' as 'High' | 'Medium' | 'Low',
                  }}
                  onEdit={handleEditStakeholder}
                  onDelete={handleDeleteStakeholder}
                />
              ))}
            </div>

            {filteredStakeholders.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No stakeholders found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterDepartment !== 'all' || filterInfluence !== 'all'
                      ? 'Try adjusting your filters or search terms.'
                      : 'Get started by adding your first stakeholder.'}
                  </p>
                  <Button onClick={() => setShowForm(true)}>Add Stakeholder</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="escalation">
            <EscalationMatrix />
          </TabsContent>

          <TabsContent value="communication">
            <Card>
              <CardHeader>
                <CardTitle>Communication Plan</CardTitle>
                <CardDescription>
                  Manage communication preferences and frequency for all stakeholders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold mb-2">
                          {stakeholders.filter(s => s.email).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Email Available</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold mb-2">
                          {stakeholders.filter(s => s.role).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Role Defined</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold mb-2">
                          {stakeholders.filter(s => s.influence).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Influence Set</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold mb-2">
                          {stakeholders.length}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Stakeholders</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Communication Templates</h3>
                    <p className="text-muted-foreground mb-4">
                      Automated communication templates and scheduling coming soon.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <StakeholderForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingStakeholder(undefined);
          }}
          stakeholder={editingStakeholder}
          onSave={handleSaveStakeholder}
        />
      </main>

      <TinkAssistant />
    </div>
  );
};

export default Stakeholders;
