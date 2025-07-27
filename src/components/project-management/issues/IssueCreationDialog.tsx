
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProjectIssue } from '@/types/issue';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Lightbulb, User, Calendar } from 'lucide-react';

interface IssueCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateIssue: (issue: Partial<ProjectIssue>) => Promise<any>;
  generateAIInsights: (issue: ProjectIssue) => Promise<any>;
  getTaskDetails: (taskId: string) => Promise<any>;
  projectId: string;
}

export const IssueCreationDialog = ({ 
  open, 
  onOpenChange, 
  onCreateIssue, 
  generateAIInsights,
  getTaskDetails,
  projectId 
}: IssueCreationDialogProps) => {
  const [formData, setFormData] = useState<Partial<ProjectIssue>>({
    title: '',
    description: '',
    category: 'Technical',
    severity: 'Medium',
    priority: 'Medium',
    status: 'Open',
    date_identified: new Date().toISOString().split('T')[0],
    tags: [],
    estimated_delay_days: 0
  });
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      fetchProjectData();
    }
  }, [open, projectId]);

  const fetchProjectData = async () => {
    try {
      const [tasksRes, milestonesRes, resourcesRes] = await Promise.all([
        supabase.from('project_tasks').select('id, name, milestone_id').eq('project_id', projectId),
        supabase.from('milestones').select('id, name').eq('project_id', projectId),
        supabase.from('resources').select('id, name')
      ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      if (milestonesRes.data) setMilestones(milestonesRes.data);
      if (resourcesRes.data) setResources(resourcesRes.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const handleTaskChange = async (taskId: string) => {
    updateFormData('linked_task_id', taskId);
    
    if (taskId && taskId !== 'none') {
      try {
        const taskDetails = await getTaskDetails(taskId);
        if (taskDetails?.milestone_id) {
          updateFormData('linked_milestone_id', taskDetails.milestone_id);
        } else {
          updateFormData('linked_milestone_id', 'none');
        }
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    } else {
      updateFormData('linked_milestone_id', 'none');
    }
  };

  const handleGenerateInsights = async () => {
    if (!formData.title) return;
    
    setLoading(true);
    try {
      const tempIssue = { ...formData, id: 'temp', project_id: projectId } as ProjectIssue;
      const insights = await generateAIInsights(tempIssue);
      setAiInsights(insights);
      setFormData(prev => ({ ...prev, ...insights }));
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onCreateIssue(formData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Technical',
      severity: 'Medium',
      priority: 'Medium',
      status: 'Open',
      date_identified: new Date().toISOString().split('T')[0],
      tags: [],
      estimated_delay_days: 0
    });
    setAiInsights(null);
  };

  const updateFormData = (field: keyof ProjectIssue, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Issue</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Detailed description of the issue"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Technical', 'Process', 'Client', 'Resource', 'Scope', 'Communication', 'Quality'].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="source">Source</Label>
                  <Input
                    id="source"
                    value={formData.source || ''}
                    onChange={(e) => updateFormData('source', e.target.value)}
                    placeholder="How was this identified?"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={formData.severity} onValueChange={(value) => updateFormData('severity', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Low', 'Medium', 'High', 'Critical'].map(sev => (
                        <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => updateFormData('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Low', 'Medium', 'High', 'Urgent'].map(pri => (
                        <SelectItem key={pri} value={pri}>{pri}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateIdentified">Date Identified</Label>
                  <Input
                    id="dateIdentified"
                    type="date"
                    value={formData.date_identified}
                    onChange={(e) => updateFormData('date_identified', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.due_date || ''}
                    onChange={(e) => updateFormData('due_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Assignments & AI */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Select value={formData.assignee_id || undefined} onValueChange={(value) => updateFormData('assignee_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {resources.map(resource => (
                      <SelectItem key={resource.id} value={resource.id}>{resource.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="linkedTask">Linked Task</Label>
                <Select value={formData.linked_task_id || undefined} onValueChange={handleTaskChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No linked task</SelectItem>
                    {tasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>{task.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="linkedMilestone">Linked Milestone</Label>
                <Select value={formData.linked_milestone_id || undefined} onValueChange={(value) => updateFormData('linked_milestone_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select milestone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No linked milestone</SelectItem>
                    {milestones.map(milestone => (
                      <SelectItem key={milestone.id} value={milestone.id}>{milestone.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* AI Insights Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    AI Insights
                  </CardTitle>
                  <CardDescription>
                    Get smart recommendations for this issue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateInsights}
                    disabled={!formData.title || loading}
                    className="w-full mb-4"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Generate AI Insights
                  </Button>

                  {aiInsights && (
                    <div className="space-y-3 text-sm">
                      <div>
                        <Label className="text-xs font-medium">Impact Summary</Label>
                        <p className="text-muted-foreground">{aiInsights.impact_summary}</p>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Suggested Resolver</Label>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          <span>{aiInsights.suggested_resolver}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs font-medium">Suggested Action</Label>
                        <p className="text-muted-foreground">{aiInsights.suggested_action}</p>
                      </div>
                      {aiInsights.estimated_delay_days > 0 && (
                        <div>
                          <Label className="text-xs font-medium">Estimated Delay</Label>
                          <Badge variant="outline" className="flex items-center gap-1 w-fit">
                            <Calendar className="h-3 w-3" />
                            +{aiInsights.estimated_delay_days} days
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title}>
              {loading ? 'Creating...' : 'Create Issue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
