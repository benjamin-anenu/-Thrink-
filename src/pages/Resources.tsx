
import React, { useState } from 'react';
import Header from '@/components/Header';
import MiloAssistant from '@/components/MiloAssistant';
import ResourceForm from '@/components/ResourceForm';
import SkillsMatrix from '@/components/SkillsMatrix';
import AssignmentModal from '@/components/AssignmentModal';
import ResourceOverview from '@/components/ResourceOverview';
import AssignmentsTab from '@/components/AssignmentsTab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

const Resources = () => {
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ id: string; name: string } | null>(null);
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

  const handleResourceSave = (resource: any) => {
    console.log('Saving resource:', resource);
    // Handle resource save logic here
  };

  const handleAssignTask = (resourceId: string, resourceName: string) => {
    setSelectedResource({ id: resourceId, name: resourceName });
    setShowAssignmentModal(true);
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

          <TabsContent value="overview">
            <ResourceOverview
              resources={resources}
              onAssignTask={handleAssignTask}
              onShowResourceForm={() => setShowResourceForm(true)}
            />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsMatrix />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentsTab onShowAssignmentModal={() => setShowAssignmentModal(true)} />
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
