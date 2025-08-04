import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar, Users, DollarSign, Target, Clock, AlertTriangle,
  CheckCircle, TrendingUp, FileText, MessageSquare, Settings
} from 'lucide-react';
import { ProjectDetailsModalData } from '@/types/project-modal';
import { supabase } from '@/integrations/supabase/client';

interface ProjectDetailsModalProps {
  project: ProjectDetailsModalData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (project: ProjectDetailsModalData) => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [extendedProject, setExtendedProject] = useState<ProjectDetailsModalData | null>(null);

  useEffect(() => {
    if (project && isOpen) {
      loadExtendedProjectData(project);
    }
  }, [project, isOpen]);

  const loadExtendedProjectData = async (baseProject: ProjectDetailsModalData) => {
    setLoading(true);
    try {
      // Fetch project data
      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', baseProject.id)
        .single();

      // Fetch tasks for progress calculation
      const { data: tasksData } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', baseProject.id);

      // Fetch resource assignments for team members
      const { data: assignmentsData } = await supabase
        .from('project_assignments')
        .select('*')
        .eq('project_id', baseProject.id);

      // Fetch resources data for team member details
      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*');

      // Fetch milestones
      const { data: milestonesData } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', baseProject.id);

      // Fetch project budgets
      const { data: budgetData } = await supabase
        .from('project_budgets')
        .select('*')
        .eq('project_id', baseProject.id);

      // Fetch project issues for risks
      const { data: issuesData } = await supabase
        .from('project_issues')
        .select('*')
        .eq('project_id', baseProject.id);

      // Calculate real-time progress from tasks
      const tasks = tasksData || [];
      const completedTasks = tasks.filter(task => task.status === 'Completed');
      const realTimeProgress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

      // Calculate budget from project_budgets table
      const totalBudget = budgetData?.reduce((sum, budget) => sum + Number(budget.allocated_amount || 0), 0) || 0;
      const totalSpent = budgetData?.reduce((sum, budget) => sum + Number(budget.spent_amount || 0), 0) || 0;

      // Transform team members from resource assignments
      const team = assignmentsData?.map(assignment => {
        const resource = resourcesData?.find(r => r.id === assignment.resource_id);
        return {
          id: assignment.id,
          name: resource?.name || 'Unknown',
          role: assignment.role || resource?.role || 'Team Member',
          avatar: undefined
        };
      }) || [];

      // Transform milestones
      const milestones = milestonesData?.map(milestone => ({
        id: milestone.id,
        name: milestone.name,
        date: milestone.due_date,
        completed: milestone.status === 'completed'
      })) || [];

      // Transform issues to risks with proper type safety
      const risks = issuesData?.map(issue => {
        const impact = ['Low', 'Medium', 'High'].includes(issue.severity) ? issue.severity as 'Low' | 'Medium' | 'High' : 'Medium';
        const probability = ['Low', 'Medium', 'High'].includes(issue.priority) ? issue.priority as 'Low' | 'Medium' | 'High' : 'Medium';
        return {
          id: issue.id,
          description: issue.title || issue.description || 'Unknown Risk',
          impact,
          probability
        };
      }) || [];

      // Create updated project with real-time data
      const updatedProject: ProjectDetailsModalData = {
        ...baseProject,
        name: projectData?.name || baseProject.name,
        description: projectData?.description || baseProject.description,
        progress: realTimeProgress,
        spent: totalSpent,
        budget: totalBudget || Number(projectData?.budget) || 0,
        team,
        milestones,
        risks,
        startDate: projectData?.start_date || baseProject.startDate,
        endDate: projectData?.end_date || baseProject.endDate,
        health: baseProject.health
      };

      setExtendedProject(updatedProject);
    } catch (error) {
      console.error('Error loading extended project data:', error);
      setExtendedProject(baseProject);
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  const currentProject = extendedProject || project;

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'outline';
      case 'On Hold': return 'secondary';
      case 'Cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (priority) {
      case 'Critical': 
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  const getHealthVariant = (health: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (health) {
      case 'green': return 'success';
      case 'yellow': return 'warning';
      case 'red': return 'error';
      default: return 'default';
    }
  };

  const getRiskVariant = (level: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (level) {
      case 'High': return 'destructive';
      case 'Medium': return 'secondary';
      case 'Low': return 'default';
      default: return 'default';
    }
  };

  // Safe number formatting with fallbacks
  const formatCurrency = (amount: number | undefined): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0';
    }
    return amount.toLocaleString();
  };

  const calculateBudgetPercentage = (spent: number | undefined, budget: number | undefined): number => {
    if (!spent || !budget || budget === 0) return 0;
    return Math.round((spent / budget) * 100);
  };

  // Safe array access helpers
  const safeTeam = currentProject.team || [];
  const safeMilestones = currentProject.milestones || [];
  const safeRisks = currentProject.risks || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{currentProject.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{currentProject.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(currentProject.status)}>
                {currentProject.status}
              </Badge>
              <Badge variant={getPriorityVariant(currentProject.priority)}>
                {currentProject.priority}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto">
            <TabsContent value="overview" className="space-y-6">
              {/* Project Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{currentProject.progress || 0}%</div>
                    <Progress value={currentProject.progress || 0} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Budget</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${formatCurrency(currentProject.spent)}</div>
                    <p className="text-xs text-muted-foreground">
                      of ${formatCurrency(currentProject.budget)} ({calculateBudgetPercentage(currentProject.spent, currentProject.budget)}%)
                    </p>
                    <Progress value={calculateBudgetPercentage(currentProject.spent, currentProject.budget)} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">
                      {currentProject.startDate ? new Date(currentProject.startDate).toLocaleDateString() : 'Not set'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      to {currentProject.endDate ? new Date(currentProject.endDate).toLocaleDateString() : 'Not set'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading team data...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeTeam.length > 0 ? safeTeam.map(member => (
                    <Card key={member.id}>
                      <CardContent className="flex items-center space-x-4 p-4">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No team members found</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading milestones...</div>
              ) : (
                <>
                  {safeMilestones.length > 0 ? safeMilestones.map(milestone => (
                    <Card key={milestone.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          {milestone.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">{milestone.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {milestone.date ? new Date(milestone.date).toLocaleDateString() : 'No date set'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={milestone.completed ? 'default' : 'secondary'}>
                          {milestone.completed ? 'Completed' : 'Pending'}
                        </Badge>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No milestones found</p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              {safeRisks.length > 0 ? safeRisks.map(risk => (
                <Card key={risk.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{risk.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">Impact:</span>
                          <Badge variant={getRiskVariant(risk.impact)}>
                            {risk.impact}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Probability:</span>
                          <Badge variant={getRiskVariant(risk.probability)}>
                            {risk.probability}
                          </Badge>
                        </div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No risks identified</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="outline" className={
                      currentProject.health.overall === 'green' ? 'border-green-500 text-green-700' :
                      currentProject.health.overall === 'yellow' ? 'border-yellow-500 text-yellow-700' :
                      'border-red-500 text-red-700'
                    }>
                      {currentProject.health.overall?.toUpperCase() || 'GREEN'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Detailed Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Schedule</span>
                      <Badge variant="outline" className={
                        currentProject.health.schedule === 'green' ? 'border-green-500 text-green-700' :
                        currentProject.health.schedule === 'yellow' ? 'border-yellow-500 text-yellow-700' :
                        'border-red-500 text-red-700'
                      }>
                        {currentProject.health.schedule || 'green'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Budget</span>
                      <Badge variant="outline" className={
                        currentProject.health.budget === 'green' ? 'border-green-500 text-green-700' :
                        currentProject.health.budget === 'yellow' ? 'border-yellow-500 text-yellow-700' :
                        'border-red-500 text-red-700'
                      }>
                        {currentProject.health.budget || 'green'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Scope</span>
                      <Badge variant="outline" className={
                        currentProject.health.scope === 'green' ? 'border-green-500 text-green-700' :
                        currentProject.health.scope === 'yellow' ? 'border-yellow-500 text-yellow-700' :
                        'border-red-500 text-red-700'
                      }>
                        {currentProject.health.scope || 'green'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Quality</span>
                      <Badge variant="outline" className={
                        currentProject.health.quality === 'green' ? 'border-green-500 text-green-700' :
                        currentProject.health.quality === 'yellow' ? 'border-yellow-500 text-yellow-700' :
                        'border-red-500 text-red-700'
                      }>
                        {currentProject.health.quality || 'green'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(currentProject)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsModal;