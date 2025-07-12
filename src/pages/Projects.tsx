
import React, { useState } from 'react';
import Header from '@/components/Header';
import MiloAssistant from '@/components/MiloAssistant';
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
import { Plus, Search, Filter, Calendar, Users, Target, BarChart3, Upload, Grid3x3, List, Eye, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');

  const projects = [
    {
      id: '1',
      name: 'E-commerce Platform Redesign',
      description: 'Complete overhaul of the user interface and user experience for our main e-commerce platform.',
      status: 'In Progress',
      priority: 'High',
      progress: 85,
      health: { status: 'green' as const, score: 92 },
      startDate: '2024-01-15',
      endDate: '2024-03-30',
      teamSize: 8,
      budget: '$125,000',
      tags: ['Frontend', 'UX/UI', 'E-commerce']
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms with core functionality.',
      status: 'In Progress',
      priority: 'High',
      progress: 60,
      health: { status: 'yellow' as const, score: 68 },
      startDate: '2024-02-01',
      endDate: '2024-05-15',
      teamSize: 6,
      budget: '$200,000',
      tags: ['Mobile', 'iOS', 'Android']
    },
    {
      id: '3',
      name: 'Marketing Campaign Q2',
      description: 'Comprehensive marketing strategy and execution for Q2 product launches.',
      status: 'In Progress',
      priority: 'Medium',
      progress: 92,
      health: { status: 'green' as const, score: 95 },
      startDate: '2024-03-01',
      endDate: '2024-06-30',
      teamSize: 4,
      budget: '$75,000',
      tags: ['Marketing', 'Strategy', 'Content']
    },
    {
      id: '4',
      name: 'Infrastructure Upgrade',
      description: 'Server infrastructure modernization and cloud migration project.',
      status: 'Planning',
      priority: 'Medium',
      progress: 25,
      health: { status: 'green' as const, score: 88 },
      startDate: '2024-04-01',
      endDate: '2024-07-31',
      teamSize: 5,
      budget: '$150,000',
      tags: ['Infrastructure', 'Cloud', 'DevOps']
    }
  ];

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

  const handleProjectCreated = (project: any) => {
    console.log('New project created:', project);
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">Manage and track all your projects in one place</p>
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
            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${getPriorityColor(project.priority)} text-white`}>
                          {project.priority}
                        </Badge>
                        <HealthIndicator 
                          health={project.health.status} 
                          score={project.health.score}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Project Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Timeline</p>
                          <p className="text-muted-foreground text-xs">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Team</p>
                          <p className="text-muted-foreground text-xs">{project.teamSize} members</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Budget</p>
                          <p className="text-muted-foreground text-xs">{project.budget}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{project.status}</Badge>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 flex items-center gap-2"
                        onClick={() => handleViewDetails(project)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 flex items-center gap-2"
                        onClick={() => handleOpenProject(project.id)}
                      >
                        <ArrowRight className="h-4 w-4" />
                        Open Project
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
                          <div className="flex gap-2">
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

      <MiloAssistant />

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
