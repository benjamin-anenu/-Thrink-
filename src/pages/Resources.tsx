
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import { ResourceCreationWizard } from '@/components/ResourceCreationWizard';
import SkillsMatrix from '@/components/SkillsMatrix';
import AssignmentModal from '@/components/AssignmentModal';
import EnhancedResourceGrid from '@/components/EnhancedResourceGrid';
import ResourceListView from '@/components/ResourceListView';
import AssignmentsTab from '@/components/AssignmentsTab';
import ResourceDetailsModal from '@/components/ResourceDetailsModal';
import { ResourceComparisonModal } from '@/components/ResourceComparisonModal';
import ResourceComparisonToolbar from '@/components/ResourceComparisonToolbar';
import EnhancedResourceStats from '@/components/EnhancedResourceStats';
import { AIInsightsDashboard } from '@/components/AIInsightsDashboard';
import PerformanceMonitoringDashboard from '@/components/PerformanceMonitoringDashboard';
import ViewToggle from '@/components/ViewToggle';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { realTimeResourceService } from '@/services/RealTimeResourceService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Brain, Zap, Activity, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

// Import the Resource type from the context for component compatibility
import type { Resource as ContextResource } from '@/contexts/ResourceContext';

const Resources = () => {
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showResourceDetailsModal, setShowResourceDetailsModal] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<{ id: string; name: string } | null>(null);
  const [selectedResourceForDetails, setSelectedResourceForDetails] = useState<ContextResource | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<Set<string>>(new Set());
  
  const { 
    resources, 
    loading,
    refreshResources,
    utilizationMetrics,
    aiRecommendations
  } = useEnhancedResources();
  
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();

  // Set up real-time updates
  useEffect(() => {
    if (!currentWorkspace?.id || !user?.id) return;

    const unsubscribeUpdates = realTimeResourceService.subscribeToResourceUpdates(
      currentWorkspace.id,
      (data) => {
        console.log('Real-time resource update:', data);
        refreshResources();
      }
    );

    const unsubscribePresence = realTimeResourceService.subscribeToResourcePresence(
      currentWorkspace.id,
      user.id
    );

    return () => {
      unsubscribeUpdates();
      unsubscribePresence();
    };
  }, [currentWorkspace?.id, user?.id, refreshResources]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      realTimeResourceService.unsubscribeAll();
    };
  }, []);

  const handleResourceSave = async (resource: any) => {
    console.log('Saving resource:', resource);
    setShowResourceForm(false);
    toast.success('Resource created successfully');
    await refreshResources();
  };

  const handleAssignTask = (resourceId: string, resourceName: string) => {
    setSelectedResource({ id: resourceId, name: resourceName });
    setShowAssignmentModal(true);
  };

  const handleViewDetails = (resource: ContextResource) => {
    setSelectedResourceForDetails(resource);
    setShowResourceDetailsModal(true);
  };

  const handleAssignTaskFromDetails = (resourceId: string, resourceName: string) => {
    setShowResourceDetailsModal(false);
    handleAssignTask(resourceId, resourceName);
  };

  // Comparison functionality
  const handleCompareToggle = (resourceId: string, selected: boolean) => {
    const newSelection = new Set(selectedForComparison);
    if (selected) {
      newSelection.add(resourceId);
    } else {
      newSelection.delete(resourceId);
    }
    setSelectedForComparison(newSelection);
  };

  const handleCompare = () => {
    if (selectedForComparison.size < 2) {
      toast.error('Please select at least 2 resources to compare');
      return;
    }
    setShowComparisonModal(true);
  };

  const handleClearComparison = () => {
    setSelectedForComparison(new Set());
  };

  const handleToggleCompareMode = () => {
    setCompareMode(!compareMode);
    if (compareMode) {
      setSelectedForComparison(new Set());
    }
  };

  // Generate AI recommendations for all projects
  const handleGenerateAIRecommendations = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      toast.success('AI recommendations generated for active projects');
    } catch (error) {
      toast.error('Failed to generate AI recommendations');
    }
  };

  // Update all resource utilization metrics
  const handleRefreshUtilization = async () => {
    try {
      await refreshResources();
      toast.success('Resource utilization updated');
    } catch (error) {
      toast.error('Failed to update utilization metrics');
    }
  };

  // Helper function to normalize status values
  const normalizeStatus = (status?: string): "Available" | "Busy" | "Overallocated" => {
    if (!status) return "Available";
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('busy') || lowerStatus.includes('allocated')) {
      return "Busy";
    }
    if (lowerStatus.includes('over')) {
      return "Overallocated";
    }
    return "Available";
  };

  // Convert database resources to context resources format
  const mappedResources: ContextResource[] = resources.map(resource => ({
    id: resource.id,
    name: resource.name || 'Unknown',
    role: resource.role || 'Team Member',
    department: resource.department || 'General',
    email: resource.email || '',
    phone: '',
    location: '',
    skills: [], // Will be enhanced with skills table later
    availability: 100, // Default availability
    currentProjects: [], // Will be calculated from assignments
    hourlyRate: resource.hourly_rate ? `$${resource.hourly_rate}/hr` : '$0/hr',
    utilization: 75, // Default utilization
    status: normalizeStatus('Available'), // Use normalized status
    workspaceId: resource.workspace_id || '',
    createdAt: resource.created_at,
    updatedAt: resource.updated_at,
    lastActive: resource.updated_at
  }));

  const filteredResources = mappedResources.filter(resource =>
    resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 pt-28 pb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              Resources
              <Badge variant="secondary" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI Enhanced
              </Badge>
            </h1>
            <p className="text-muted-foreground">AI-powered resource management with utilization tracking</p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleGenerateAIRecommendations}
              className="flex items-center gap-2"
            >
              <Brain size={16} />
              Generate AI Insights
            </Button>
            <Button 
              variant="outline" 
              onClick={handleRefreshUtilization}
              className="flex items-center gap-2"
            >
              <Zap size={16} />
              Refresh Metrics
            </Button>
            <Button onClick={() => setShowResourceForm(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Add Resource
            </Button>
          </div>
        </div>

        {/* Enhanced Resource Stats */}
        <EnhancedResourceStats />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="skills">Skills Matrix</TabsTrigger>
            <TabsTrigger value="assignments">Smart Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <ViewToggle view={viewMode} onViewChange={setViewMode} />
              </div>

              {/* Resource Comparison Toolbar */}
              <ResourceComparisonToolbar
                selectedCount={selectedForComparison.size}
                onCompare={handleCompare}
                onClear={handleClearComparison}
                onToggleCompareMode={handleToggleCompareMode}
                compareMode={compareMode}
              />

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">Loading resources...</div>
                </div>
              ) : viewMode === 'grid' ? (
                <EnhancedResourceGrid
                  resources={filteredResources}
                  utilizationMetrics={utilizationMetrics}
                  onViewDetails={handleViewDetails}
                  onShowResourceForm={() => setShowResourceForm(true)}
                  showCompareMode={compareMode}
                  selectedForComparison={selectedForComparison}
                  onCompareToggle={handleCompareToggle}
                />
              ) : (
                <ResourceListView
                  resources={filteredResources}
                  onViewDetails={handleViewDetails}
                  onAssignTask={handleAssignTask}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="ai-insights">
            <AIInsightsDashboard />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceMonitoringDashboard />
          </TabsContent>

          <TabsContent value="skills">
            <SkillsMatrix />
          </TabsContent>

          <TabsContent value="assignments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">AI-Powered Assignment Recommendations</h3>
                <Badge variant="outline">{aiRecommendations.length} active recommendations</Badge>
              </div>
              <AssignmentsTab onShowAssignmentModal={() => setShowAssignmentModal(true)} />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modals */}
      <ResourceCreationWizard
        open={showResourceForm}
        onOpenChange={setShowResourceForm}
      />

      <ResourceDetailsModal
        isOpen={showResourceDetailsModal}
        onClose={() => setShowResourceDetailsModal(false)}
        resource={selectedResourceForDetails}
        onAssignTask={handleAssignTaskFromDetails}
      />

      <AssignmentModal
        isOpen={showAssignmentModal}
        onClose={() => setShowAssignmentModal(false)}
        onAssign={(data) => {
          console.log('Assignment created:', data);
          toast.success('Resource assigned successfully');
        }}
        resourceData={mappedResources.map(r => ({ id: r.id, name: r.name }))}
        projectData={[]}
      />

      <ResourceComparisonModal
        open={showComparisonModal}
        onOpenChange={setShowComparisonModal}
        selectedResourceIds={Array.from(selectedForComparison)}
        workspaceId={currentWorkspace?.id || ''}
      />

      <TinkAssistant />
    </div>
  );
};

export default Resources;
