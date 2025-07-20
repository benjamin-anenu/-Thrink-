
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useProjects } from '@/hooks/useProjects';
import { Label } from '@/components/ui/label';

const Stakeholders = () => {
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterDepartments, setFilterDepartments] = useState<string[]>([]);
  const [filterInfluences, setFilterInfluences] = useState<string[]>([]);
  const [filterProjects, setFilterProjects] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Add temp state for modal filters
  const [tempFilterDepartments, setTempFilterDepartments] = useState<string[]>([]);
  const [tempFilterInfluences, setTempFilterInfluences] = useState<string[]>([]);
  const [tempFilterProjects, setTempFilterProjects] = useState<string[]>([]);

  // When opening modal, sync temp state with main filter state
  const openFilterModal = () => {
    setTempFilterDepartments(filterDepartments);
    setTempFilterInfluences(filterInfluences);
    setTempFilterProjects(filterProjects);
    setShowFilterModal(true);
  };

  const { currentWorkspace } = useWorkspace();
  const { stakeholders, loading, createStakeholder, updateStakeholder, deleteStakeholder } = useStakeholders(currentWorkspace?.id);
  const { projects } = useProjects();

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

  // Filtering logic
  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const name = stakeholder.name?.toLowerCase() ?? '';
    const role = stakeholder.role?.toLowerCase() ?? '';
    const department = (stakeholder.department?.toLowerCase?.() ?? '');
    const influence = (stakeholder.influence?.toLowerCase?.() ?? '');

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      role.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartments.length === 0 || filterDepartments.some(dept => department === dept.toLowerCase());
    const matchesInfluence = filterInfluences.length === 0 || filterInfluences.some(inf => influence === inf.toLowerCase());
    const matchesProjects = filterProjects.length === 0 || (Array.isArray(stakeholder.projects) && stakeholder.projects.some(proj => filterProjects.includes(proj)));

    return matchesSearch && matchesDepartment && matchesInfluence && matchesProjects;
  });

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
              <div className="flex flex-1 items-center gap-2 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search stakeholders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={openFilterModal}
                  className="flex items-center gap-2 z-50 relative"
                  type="button"
                >
                  <Filter size={16} /> Filters
                  {(filterDepartments.length > 0 || filterInfluences.length > 0 || filterProjects.length > 0) && (
                    <Badge variant="secondary" className="ml-1">Active</Badge>
                  )}
                </Button>
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
                        onDelete={(stakeholder) => handleDeleteStakeholder(stakeholder.id)}
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

      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Filter Stakeholders</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Departments */}
            <div>
              <h4 className="font-medium mb-2">Department</h4>
              <div className="flex flex-wrap gap-2">
                {[...new Set(stakeholders.map(s => s.department).filter(Boolean))].map(dept => (
                  <label key={dept} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={tempFilterDepartments.includes(dept)}
                      onCheckedChange={checked => {
                        setTempFilterDepartments(checked
                          ? [...tempFilterDepartments, dept]
                          : tempFilterDepartments.filter(d => d !== dept));
                      }}
                    />
                    <span className="text-sm">{dept}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Influence */}
            <div>
              <h4 className="font-medium mb-2">Influence</h4>
              <div className="flex flex-wrap gap-2">
                {['high', 'medium', 'low', 'critical'].map(influence => (
                  <label key={influence} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={tempFilterInfluences.includes(influence)}
                      onCheckedChange={checked => {
                        setTempFilterInfluences(checked
                          ? [...tempFilterInfluences, influence]
                          : tempFilterInfluences.filter(i => i !== influence));
                      }}
                    />
                    <span className="text-sm">{influence.charAt(0).toUpperCase() + influence.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Projects */}
            <div>
              <h4 className="font-medium mb-2">Projects</h4>
              <div className="flex flex-wrap gap-2">
                {projects.map(project => (
                  <label key={project.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={tempFilterProjects.includes(project.name)}
                      onCheckedChange={checked => {
                        setTempFilterProjects(checked
                          ? [...tempFilterProjects, project.name]
                          : tempFilterProjects.filter(p => p !== project.name));
                      }}
                    />
                    <span className="text-sm">{project.name}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* Active Filter Badges */}
            {(tempFilterDepartments.length > 0 || tempFilterInfluences.length > 0 || tempFilterProjects.length > 0) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {tempFilterDepartments.map(dept => (
                  <Badge key={dept} variant="secondary">{dept}</Badge>
                ))}
                {tempFilterInfluences.map(inf => (
                  <Badge key={inf} variant="secondary">{inf.charAt(0).toUpperCase() + inf.slice(1)}</Badge>
                ))}
                {tempFilterProjects.map(proj => (
                  <Badge key={proj} variant="secondary">{proj}</Badge>
                ))}
              </div>
            )}
            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => {
                  setFilterDepartments([]);
                  setFilterInfluences([]);
                  setFilterProjects([]);
                  setTempFilterDepartments([]);
                  setTempFilterInfluences([]);
                  setTempFilterProjects([]);
                  setShowFilterModal(false);
                }}
              >
                Clear All
              </Button>
              <Button
                onClick={() => {
                  setFilterDepartments(tempFilterDepartments);
                  setFilterInfluences(tempFilterInfluences);
                  setFilterProjects(tempFilterProjects);
                  setShowFilterModal(false);
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stakeholders;
