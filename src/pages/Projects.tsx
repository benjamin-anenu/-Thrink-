
import React, { useState } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import HealthIndicator from '@/components/HealthIndicator';
import ProjectCreationWizard from '@/components/ProjectCreationWizard';
import BulkImportModal from '@/components/BulkImportModal';
import ProjectDetailsModal from '@/components/ProjectDetailsModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Filter, Calendar, Users, Target, BarChart3, Upload, Grid3x3, List, Eye, ArrowRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Projects = () => {
  const navigate = useNavigate();
  const { projects, addProject, refreshProjects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [deletingProject, setDeletingProject] = useState<string | null>(null);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const handleProjectCreated = (projectData: any) => {
    console.log('Creating new project:', projectData);
    
    // Transform wizard data to ProjectData format
    const newProject = {
      name: projectData.name || 'New Project',
      description: projectData.description || '',
      status: 'Planning' as const,
      priority: 'Medium' as const,
      progress: 0,
      health: { status: 'green' as const, score: 100 },
      startDate: projectData.resources?.timeline?.start || new Date().toISOString().split('T')[0],
      endDate: projectData.resources?.timeline?.end || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      teamSize: projectData.resources?.teamMembers?.length || 1,
      budget: projectData.resources?.budget || '$0',
      tags: projectData.tags || ['New'],
      workspaceId: currentWorkspace?.id || 'ws-1',
      resources: projectData.resources?.teamMembers?.map((m: any) => m.id) || [],
      stakeholders: projectData.stakeholders?.map((s: any) => s.id) || [],
      milestones: projectData.milestones || [],
      tasks: []
    };

    addProject(newProject);
    setShowCreationWizard(false);
  };

  const handleBulkImport = (data: any) => {
    console.log('Bulk import data:', data);
    setShowBulkImport(false);
  };

  const handleViewDetails = (project: any) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleOpenProject = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const handleDeleteProject = async (project: any) => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action can be undone from the recycle bin.`)) {
      return;
    }

    setDeletingProject(project.id);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', project.id);

      if (error) throw error;

      toast.success(`${project.name} has been moved to recycle bin`);
      refreshProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setDeletingProject(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">
              {currentWorkspace ? `${currentWorkspace.name} - ` : ''}
              Manage and track all your projects in one place
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowBulkImport(true)}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              Bulk Import
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowCreationWizard(true)}
            >
              <Plus size={16} />
              New Project
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
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

        {/* View Tabs */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'grid' | 'list')} className="mb-6">
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Grid3x3 className="h-4 w-4" />
              Grid View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            {/* Projects Grid - Changed to 4 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base mb-1 line-clamp-1">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">{project.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Badge variant="outline" className={`${getPriorityColor(project.priority)} text-white text-xs`}>
                          {project.priority}
                        </Badge>
                        <HealthIndicator 
                          health={project.health.status} 
                          score={project.health.score}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-1" />
                    </div>

                    {/* Project Details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">Timeline</p>
                          <p className="text-muted-foreground truncate">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Team</p>
                          <p className="text-muted-foreground">{project.teamSize} members</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">Budget</p>
                          <p className="text-muted-foreground truncate">{project.budget}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge variant="secondary" className="text-xs">{project.status}</Badge>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {project.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 flex items-center gap-1 text-xs"
                        onClick={() => handleViewDetails(project)}
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 flex items-center gap-1 text-xs"
                        onClick={() => handleOpenProject(project.id)}
                      >
                        <ArrowRight className="h-3 w-3" />
                        Open
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex items-center gap-1 text-xs"
                        onClick={() => handleDeleteProject(project)}
                        disabled={deletingProject === project.id}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No projects found matching your search.</p>
                <Button onClick={() => setShowCreationWizard(true)}>Create New Project</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            {/* Projects List */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Team Size</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div>
                            <p className="font-medium">{project.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{project.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${getPriorityColor(project.priority)} text-white`}>
                            {project.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="h-2 w-16" />
                            <span className="text-sm">{project.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{project.teamSize}</TableCell>
                        <TableCell>{project.budget}</TableCell>
                        <TableCell>
                          <HealthIndicator 
                            health={project.health.status} 
                            score={project.health.score}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDetails(project)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleOpenProject(project.id)}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteProject(project)}
                              disabled={deletingProject === project.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No projects found matching your search.</p>
                <Button onClick={() => setShowCreationWizard(true)}>Create New Project</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <TinkAssistant />

      {showCreationWizard && (
        <ProjectCreationWizard
          isOpen={showCreationWizard}
          onClose={() => setShowCreationWizard(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {showBulkImport && (
        <BulkImportModal
          isOpen={showBulkImport}
          onClose={() => setShowBulkImport(false)}
          onImport={handleBulkImport}
        />
      )}

      {showProjectDetails && selectedProject && (
        <ProjectDetailsModal
          isOpen={showProjectDetails}
          onClose={() => setShowProjectDetails(false)}
          project={selectedProject}
        />
      )}
    </div>
  );
};

export default Projects;
