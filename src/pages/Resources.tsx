
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Users, BarChart3, Grid, List } from 'lucide-react';
import { useResources } from '@/contexts/ResourceContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import ResourceForm from '@/components/ResourceForm';
import ResourceGrid from '@/components/ResourceGrid';
import ResourceListView from '@/components/ResourceListView';
import ViewToggle from '@/components/ViewToggle';
import ResourceQuickInsights from '@/components/resources/ResourceQuickInsights';

const Resources = () => {
  const { resources, loading } = useResources();
  const { currentWorkspace } = useWorkspace();
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  const [filterConfig, setFilterConfig] = useState({
    departments: [] as string[],
    skills: [] as string[],
    availability: 'all' as 'all' | 'available' | 'busy' | 'overallocated',
    utilization: { min: 0, max: 100 }
  });

  // Get unique departments and skills for filters
  const uniqueDepartments = useMemo(() => 
    [...new Set(resources.map(r => r.department).filter(Boolean))], 
    [resources]
  );

  const uniqueSkills = useMemo(() => 
    [...new Set(resources.flatMap(r => r.skills || []))], 
    [resources]
  );

  // Filter resources based on search and filters
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      // Search filter
      const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.email.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment = filterConfig.departments.length === 0 || 
                               filterConfig.departments.includes(resource.department);

      // Skills filter
      const matchesSkills = filterConfig.skills.length === 0 || 
                           filterConfig.skills.some(skill => resource.skills?.includes(skill));

      // Availability filter
      const matchesAvailability = filterConfig.availability === 'all' || 
                                 resource.status.toLowerCase() === filterConfig.availability;

      // Utilization filter
      const matchesUtilization = resource.utilization >= filterConfig.utilization.min && 
                                resource.utilization <= filterConfig.utilization.max;

      return matchesSearch && matchesDepartment && matchesSkills && matchesAvailability && matchesUtilization;
    });
  }, [resources, searchTerm, filterConfig]);

  const handleCompareToggle = (resourceId: string, selected: boolean) => {
    const newSelected = new Set(selectedForComparison);
    if (selected) {
      newSelected.add(resourceId);
    } else {
      newSelected.delete(resourceId);
    }
    setSelectedForComparison(newSelected);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading resources...</div>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Workspace Selected</h2>
          <p className="text-muted-foreground">Please select a workspace to view resources.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Resources</h1>
            <p className="text-muted-foreground mt-2">
              Manage your team members and their assignments
            </p>
          </div>
          <TabsList className="grid w-auto grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <ResourceQuickInsights />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Resource Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uniqueDepartments.map(dept => {
                    const deptResources = resources.filter(r => r.department === dept);
                    const percentage = (deptResources.length / resources.length) * 100;
                    
                    return (
                      <div key={dept}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">{dept}</span>
                          <Badge variant="secondary">{deptResources.length}</Badge>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilization Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {resources.filter(r => r.utilization < 70).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Available</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {resources.filter(r => r.utilization >= 70 && r.utilization <= 100).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Optimal</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {resources.filter(r => r.utilization > 100).length}
                      </div>
                      <div className="text-xs text-muted-foreground">Overloaded</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Resource Management Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-muted' : ''}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <ViewToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              <Button onClick={() => setShowResourceForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Resource
              </Button>
            </div>
          </div>

          {/* Resources Display */}
          {viewMode === 'grid' ? (
            <ResourceGrid
              resources={filteredResources}
            />
          ) : (
            <ResourceListView
              resources={filteredResources}
            />
          )}

          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchTerm || Object.values(filterConfig).some(v => 
                    Array.isArray(v) ? v.length > 0 : v !== 'all'
                  ) 
                    ? 'Try adjusting your search terms or filters.' 
                    : 'Get started by adding your first team member.'}
                </p>
                {!searchTerm && !Object.values(filterConfig).some(v => 
                  Array.isArray(v) ? v.length > 0 : v !== 'all'
                ) && (
                  <Button onClick={() => setShowResourceForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Resource
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resource Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Detailed resource analytics and insights coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resource Form Modal */}
      {showResourceForm && (
        <ResourceForm onClose={() => setShowResourceForm(false)} />
      )}
    </div>
  );
};

export default Resources;
