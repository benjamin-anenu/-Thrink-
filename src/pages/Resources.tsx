import React, { useState } from 'react';
import Header from '@/components/Header';
import MiloAssistant from '@/components/MiloAssistant';
import ResourceForm from '@/components/ResourceForm';
import SkillsMatrix from '@/components/SkillsMatrix';
import AssignmentModal from '@/components/AssignmentModal';
import ResourceFilters from '@/components/ResourceFilters';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Mail, Phone, MapPin, Clock, UserPlus, Target } from 'lucide-react';

const Resources = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ id: string; name: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const resources = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Senior Frontend Developer',
      department: 'Engineering',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      skills: ['React', 'TypeScript', 'CSS', 'UI/UX'],
      availability: 75,
      currentProjects: ['E-commerce Redesign', 'Mobile App'],
      hourlyRate: '$85/hr',
      utilization: 85,
      status: 'Available'
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Backend Developer',
      department: 'Engineering',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
      availability: 40,
      currentProjects: ['Infrastructure Upgrade', 'Mobile App API'],
      hourlyRate: '$90/hr',
      utilization: 95,
      status: 'Busy'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      department: 'Design',
      email: 'emily.rodriguez@company.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      availability: 90,
      currentProjects: ['E-commerce Redesign'],
      hourlyRate: '$75/hr',
      utilization: 60,
      status: 'Available'
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Project Manager',
      department: 'Operations',
      email: 'david.kim@company.com',
      phone: '+1 (555) 456-7890',
      location: 'Seattle, WA',
      skills: ['Agile', 'Scrum', 'Risk Management', 'Stakeholder Management'],
      availability: 60,
      currentProjects: ['Marketing Campaign', 'Infrastructure Upgrade'],
      hourlyRate: '$70/hr',
      utilization: 80,
      status: 'Available'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      role: 'Marketing Specialist',
      department: 'Marketing',
      email: 'lisa.thompson@company.com',
      phone: '+1 (555) 567-8901',
      location: 'Chicago, IL',
      skills: ['Content Marketing', 'SEO', 'Social Media', 'Analytics'],
      availability: 100,
      currentProjects: ['Marketing Campaign Q2'],
      hourlyRate: '$55/hr',
      utilization: 70,
      status: 'Available'
    },
    {
      id: '6',
      name: 'James Wilson',
      role: 'DevOps Engineer',
      department: 'Engineering',
      email: 'james.wilson@company.com',
      phone: '+1 (555) 678-9012',
      location: 'Denver, CO',
      skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      availability: 20,
      currentProjects: ['Infrastructure Upgrade', 'Security Audit'],
      hourlyRate: '$95/hr',
      utilization: 100,
      status: 'Overallocated'
    }
  ];

  const filteredResources = resources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-500';
      case 'Busy': return 'bg-yellow-500';
      case 'Overallocated': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-500';
    if (utilization >= 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  const handleResourceSave = (resource: any) => {
    console.log('Saving resource:', resource);
    // Handle resource save logic here
  };

  const handleAssignTask = (resourceId: string, resourceName: string) => {
    setSelectedResource({ id: resourceId, name: resourceName });
    setShowAssignmentModal(true);
  };

  const handleFiltersChange = (filters: any) => {
    console.log('Filters changed:', filters);
    // Apply filters to resources
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Resources</h1>
            <p className="text-muted-foreground">Manage team members, skills, and availability</p>
          </div>
          <Button onClick={() => setShowResourceForm(true)} className="flex items-center gap-2">
            <Plus size={16} />
            Add Resource
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Team Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, role, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ResourceFilters
                onFiltersChange={handleFiltersChange}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
              />
            </div>

            {showFilters && (
              <ResourceFilters
                onFiltersChange={handleFiltersChange}
                isOpen={true}
                onToggle={() => setShowFilters(false)}
              />
            )}

            {/* Resource Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">Total Resources</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-500">18</div>
                  <p className="text-xs text-muted-foreground">Available</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-500">4</div>
                  <p className="text-xs text-muted-foreground">Busy</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-500">2</div>
                  <p className="text-xs text-muted-foreground">Overallocated</p>
                </CardContent>
              </Card>
            </div>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{resource.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{resource.name}</CardTitle>
                          <CardDescription>{resource.role}</CardDescription>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(resource.status)} text-white`}>
                        {resource.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Contact Information */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{resource.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{resource.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{resource.location}</span>
                      </div>
                    </div>

                    {/* Utilization */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Utilization</span>
                        <span className={getUtilizationColor(resource.utilization)}>
                          {resource.utilization}%
                        </span>
                      </div>
                      <Progress value={resource.utilization} className="h-2" />
                    </div>

                    {/* Availability */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Availability</span>
                        <span>{resource.availability}%</span>
                      </div>
                      <Progress value={resource.availability} className="h-2" />
                    </div>

                    {/* Skills */}
                    <div>
                      <p className="text-sm font-medium mb-2">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Current Projects */}
                    <div>
                      <p className="text-sm font-medium mb-2">Current Projects</p>
                      <div className="space-y-1">
                        {resource.currentProjects.map((project, index) => (
                          <p key={index} className="text-xs text-muted-foreground">• {project}</p>
                        ))}
                      </div>
                    </div>

                    {/* Rate */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rate: {resource.hourlyRate}</span>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <UserPlus size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAssignTask(resource.id, resource.name)}
                      >
                        <Target size={14} className="mr-1" />
                        Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No resources found matching your search.</p>
                <Button onClick={() => setShowResourceForm(true)}>Add New Resource</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills">
            <SkillsMatrix />
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Management</CardTitle>
                <CardDescription>
                  Manage task assignments and workload distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Assignment management interface coming soon...
                  </p>
                  <Button onClick={() => setShowAssignmentModal(true)}>
                    Create New Assignment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ResourceForm
        isOpen={showResourceForm}
        onClose={() => setShowResourceForm(false)}
        onSave={handleResourceSave}
      />

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        resourceId={selectedResource?.id}
        resourceName={selectedResource?.name}
      />

      <MiloAssistant />
    </div>
  );
};

export default Resources;
