
import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import StakeholderCard from '@/components/StakeholderCard';
import StakeholderForm from '@/components/StakeholderForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Users, Star, TrendingUp, BarChart3 } from 'lucide-react';
import { useStakeholders, Stakeholder } from '@/contexts/StakeholderContext';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const Stakeholders = () => {
  const { stakeholders, addStakeholder, updateStakeholder, deleteStakeholder } = useStakeholders();
  const { projects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');
  const [influenceFilter, setInfluenceFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  // Filter stakeholders based on search and filters
  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInfluence = influenceFilter === 'all' || stakeholder.influence_level === influenceFilter;
    const matchesProject = projectFilter === 'all' || stakeholder.project_id === projectFilter;
    
    return matchesSearch && matchesInfluence && matchesProject;
  });

  // Group stakeholders by influence level
  const stakeholdersByInfluence = {
    High: filteredStakeholders.filter(s => s.influence_level === 'High'),
    Medium: filteredStakeholders.filter(s => s.influence_level === 'Medium'),
    Low: filteredStakeholders.filter(s => s.influence_level === 'Low')
  };

  // Calculate metrics
  const totalStakeholders = stakeholders.length;
  const highInfluenceCount = stakeholders.filter(s => s.influence_level === 'High').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const avgEngagement = Math.round(
    stakeholders.reduce((acc, s) => acc + (s.escalation_level || 0), 0) / Math.max(stakeholders.length, 1)
  );

  const handleStakeholderSave = async (stakeholderData: any) => {
    try {
      if (selectedStakeholder) {
        await updateStakeholder(selectedStakeholder.id, stakeholderData);
      } else {
        await addStakeholder({
          ...stakeholderData,
          workspace_id: currentWorkspace?.id || ''
        });
      }
      setShowStakeholderForm(false);
      setSelectedStakeholder(null);
    } catch (error) {
      console.error('Error saving stakeholder:', error);
    }
  };

  const handleEditStakeholder = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setShowStakeholderForm(true);
  };

  const handleDeleteStakeholder = async (stakeholder: Stakeholder) => {
    if (window.confirm(`Are you sure you want to delete ${stakeholder.name}?`)) {
      try {
        await deleteStakeholder(stakeholder.id);
      } catch (error) {
        console.error('Error deleting stakeholder:', error);
      }
    }
  };

  const handleViewDetails = (stakeholder: Stakeholder) => {
    // Handle view details - could open a modal or navigate to detail page
    console.log('View details for:', stakeholder);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Stakeholders</h1>
            <p className="text-muted-foreground">
              {currentWorkspace ? `${currentWorkspace.name} - ` : ''}
              Manage relationships and communication with project stakeholders
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => {
              setSelectedStakeholder(null);
              setShowStakeholderForm(true);
            }}
          >
            <Plus size={16} />
            Add Stakeholder
          </Button>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Stakeholders</p>
                  <p className="text-2xl font-bold">{totalStakeholders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">High Influence</p>
                  <p className="text-2xl font-bold">{highInfluenceCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{activeProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Engagement</p>
                  <p className="text-2xl font-bold">{avgEngagement}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
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
          
          <Select value={influenceFilter} onValueChange={setInfluenceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by influence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Influence Levels</SelectItem>
              <SelectItem value="High">High Influence</SelectItem>
              <SelectItem value="Medium">Medium Influence</SelectItem>
              <SelectItem value="Low">Low Influence</SelectItem>
            </SelectContent>
          </Select>

          <Select value={projectFilter} onValueChange={setProjectFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            More Filters
          </Button>
        </div>

        {/* Stakeholder Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="influence">By Influence</TabsTrigger>
            <TabsTrigger value="projects">By Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStakeholders.map((stakeholder) => (
                <StakeholderCard
                  key={stakeholder.id}
                  stakeholder={stakeholder}
                  onEdit={handleEditStakeholder}
                  onDelete={handleDeleteStakeholder}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {filteredStakeholders.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No stakeholders found matching your criteria.</p>
                <Button onClick={() => setShowStakeholderForm(true)}>Add First Stakeholder</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="influence">
            <div className="space-y-8">
              {Object.entries(stakeholdersByInfluence).map(([level, stakeholderList]) => (
                <div key={level}>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-lg font-semibold">{level} Influence</h3>
                    <Badge variant="secondary">{stakeholderList.length}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stakeholderList.map((stakeholder) => (
                      <StakeholderCard
                        key={stakeholder.id}
                        stakeholder={stakeholder}
                        onEdit={handleEditStakeholder}
                        onDelete={handleDeleteStakeholder}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <div className="space-y-8">
              {projects.map((project) => {
                const projectStakeholders = filteredStakeholders.filter(s => s.project_id === project.id);
                if (projectStakeholders.length === 0) return null;

                return (
                  <div key={project.id}>
                    <div className="flex items-center gap-2 mb-4">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <Badge variant="secondary">{projectStakeholders.length}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {projectStakeholders.map((stakeholder) => (
                        <StakeholderCard
                          key={stakeholder.id}
                          stakeholder={stakeholder}
                          onEdit={handleEditStakeholder}
                          onDelete={handleDeleteStakeholder}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Stakeholder Form Modal */}
      <StakeholderForm
        open={showStakeholderForm}
        onClose={() => {
          setShowStakeholderForm(false);
          setSelectedStakeholder(null);
        }}
        onSave={handleStakeholderSave}
        stakeholder={selectedStakeholder}
      />

      <TinkAssistant />
    </div>
  );
};

export default Stakeholders;
