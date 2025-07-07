
import React, { useState } from 'react';
import Header from '@/components/Header';
import MiloAssistant from '@/components/MiloAssistant';
import StakeholderCard from '@/components/StakeholderCard';
import StakeholderForm from '@/components/StakeholderForm';
import EscalationMatrix from '@/components/EscalationMatrix';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Filter, UserCheck, AlertTriangle, MessageSquare } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  communicationPreference: 'email' | 'phone' | 'slack' | 'teams';
  escalationLevel: number;
  influence: 'high' | 'medium' | 'low';
  interest: 'high' | 'medium' | 'low';
  projects: string[];
  notes?: string;
}

const mockStakeholders: Stakeholder[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Project Manager',
    department: 'Engineering',
    email: 'sarah.johnson@company.com',
    phone: '+1 (555) 123-4567',
    communicationPreference: 'email',
    escalationLevel: 1,
    influence: 'high',
    interest: 'high',
    projects: ['E-commerce Redesign', 'Mobile App', 'API Integration'],
    notes: 'Primary PM for web projects. Prefers detailed status updates.'
  },
  {
    id: '2',
    name: 'David Wilson',
    role: 'Engineering Manager',
    department: 'Engineering',
    email: 'david.wilson@company.com',
    phone: '+1 (555) 234-5678',
    communicationPreference: 'slack',
    escalationLevel: 2,
    influence: 'high',
    interest: 'medium',
    projects: ['Mobile App', 'Infrastructure'],
    notes: 'Technical escalation point. Available on Slack during business hours.'
  },
  {
    id: '3',
    name: 'Lisa Park',
    role: 'Product Manager',
    department: 'Product',
    email: 'lisa.park@company.com',
    phone: '+1 (555) 345-6789',
    communicationPreference: 'teams',
    escalationLevel: 2,
    influence: 'high',
    interest: 'high',
    projects: ['E-commerce Redesign', 'Customer Portal'],
    notes: 'Focuses on user experience and product strategy.'
  },
  {
    id: '4',
    name: 'Mike Chen',
    role: 'Tech Lead',
    department: 'Engineering',
    email: 'mike.chen@company.com',
    phone: '+1 (555) 456-7890',
    communicationPreference: 'email',
    escalationLevel: 1,
    influence: 'medium',
    interest: 'high',
    projects: ['API Integration', 'Security Audit'],
    notes: 'Subject matter expert for backend systems.'
  },
  {
    id: '5',
    name: 'Anna Kim',
    role: 'Director of Product',
    department: 'Product',
    email: 'anna.kim@company.com',
    phone: '+1 (555) 567-8901',
    communicationPreference: 'phone',
    escalationLevel: 3,
    influence: 'high',
    interest: 'medium',
    projects: ['Strategic Initiative', 'Market Research'],
    notes: 'High-level strategic decisions. Prefers concise updates.'
  }
];

const Stakeholders = () => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(mockStakeholders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterInfluence, setFilterInfluence] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | undefined>();

  const filteredStakeholders = stakeholders.filter(stakeholder => {
    const matchesSearch = stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stakeholder.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || stakeholder.department === filterDepartment;
    const matchesInfluence = filterInfluence === 'all' || stakeholder.influence === filterInfluence;
    
    return matchesSearch && matchesDepartment && matchesInfluence;
  });

  const handleSaveStakeholder = (stakeholder: Stakeholder) => {
    if (editingStakeholder) {
      setStakeholders(prev => prev.map(s => s.id === stakeholder.id ? stakeholder : s));
    } else {
      setStakeholders(prev => [...prev, stakeholder]);
    }
    setEditingStakeholder(undefined);
  };

  const handleEditStakeholder = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setShowForm(true);
  };

  const departments = [...new Set(stakeholders.map(s => s.department))];

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
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
                      <p className="text-sm font-medium text-muted-foreground">Departments</p>
                      <p className="text-2xl font-bold">{departments.length}</p>
                    </div>
                    <Badge className="h-8 w-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                      <p className="text-2xl font-bold">{[...new Set(stakeholders.flatMap(s => s.projects))].length}</p>
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
                  stakeholder={stakeholder}
                  onEdit={handleEditStakeholder}
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
                          {stakeholders.filter(s => s.communicationPreference === 'email').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Prefer Email</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold mb-2">
                          {stakeholders.filter(s => s.communicationPreference === 'slack').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Prefer Slack</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold mb-2">
                          {stakeholders.filter(s => s.communicationPreference === 'teams').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Prefer Teams</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold mb-2">
                          {stakeholders.filter(s => s.communicationPreference === 'phone').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Prefer Phone</div>
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

      <MiloAssistant />
    </div>
  );
};

export default Stakeholders;
