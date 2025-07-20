
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Briefcase,
  Building2,
  Star
} from 'lucide-react';
import { useSkillMatching, ResourceSkillMatch } from '@/hooks/useSkillMatching';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EnhancedAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId?: string;
  resourceName?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Task {
  id: string;
  name: string;
  description: string;
  required_skills: string[];
  assigned_resources: string[];
  status: string;
  priority: string;
}

const EnhancedAssignmentModal: React.FC<EnhancedAssignmentModalProps> = ({
  isOpen,
  onClose,
  resourceId,
  resourceName
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [skillMatches, setSkillMatches] = useState<ResourceSkillMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const { getResourceSkillMatches } = useSkillMatching();

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedProjectId) {
      loadTasks();
      loadSkillMatches();
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedTaskId && selectedProjectId) {
      loadSkillMatches();
    }
  }, [selectedTaskId]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, description')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const loadTasks = async () => {
    if (!selectedProjectId) return;

    try {
      const { data, error } = await supabase
        .from('project_tasks')
        .select('id, name, description, required_skills, assigned_resources, status, priority')
        .eq('project_id', selectedProjectId)
        .order('name');

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const loadSkillMatches = async () => {
    if (!selectedProjectId) return;

    setLoading(true);
    const matches = await getResourceSkillMatches(selectedProjectId, selectedTaskId);
    setSkillMatches(matches);
    setLoading(false);
  };

  const assignResourceToTask = async (resourceId: string, taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const updatedResources = [...(task.assigned_resources || []), resourceId];

      const { error } = await supabase
        .from('project_tasks')
        .update({ assigned_resources: updatedResources })
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Resource assigned successfully');
      loadTasks();
      loadSkillMatches();
    } catch (error) {
      console.error('Error assigning resource:', error);
      toast.error('Failed to assign resource');
    }
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMatchIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="h-4 w-4" />;
    if (percentage >= 60) return <AlertCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Resource Assignment & Skill Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Project</label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProjectId && (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Project Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks & Requirements</TabsTrigger>
                <TabsTrigger value="analysis">Skill Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>Project:</strong> {projects.find(p => p.id === selectedProjectId)?.name}</p>
                      <p><strong>Description:</strong> {projects.find(p => p.id === selectedProjectId)?.description}</p>
                      <p><strong>Total Tasks:</strong> {tasks.length}</p>
                      <p><strong>Available Resources:</strong> {skillMatches.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.map((task) => (
                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedTaskId(selectedTaskId === task.id ? '' : task.id)}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{task.name}</CardTitle>
                            <CardDescription>{task.description}</CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>
                              {task.priority}
                            </Badge>
                            <Badge variant={task.status === 'Completed' ? 'default' : 'outline'}>
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            <strong>Assigned Resources:</strong> {task.assigned_resources?.length || 0}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Required Skills:</strong> {task.required_skills?.length || 0}
                          </p>
                          {selectedTaskId === task.id && task.required_skills?.length > 0 && (
                            <div className="mt-2 pt-2 border-t">
                              <p className="text-sm font-medium mb-2">Required Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {task.required_skills.map((skillId, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    Skill {skillId}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Analyzing skill matches...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {skillMatches.map((match) => (
                      <Card key={match.resource.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src="" alt={match.resource.name} />
                                <AvatarFallback>
                                  {match.resource.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-base">{match.resource.name}</CardTitle>
                                <CardDescription>{match.resource.role}</CardDescription>
                              </div>
                            </div>
                            <Badge className={getMatchColor(match.matchPercentage)}>
                              {getMatchIcon(match.matchPercentage)}
                              {match.matchPercentage}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Skill Match</span>
                              <span>{match.matchPercentage}%</span>
                            </div>
                            <Progress value={match.matchPercentage} />
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{match.resource.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{match.resource.department}</span>
                            </div>
                          </div>

                          {match.skills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2">Matching Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {match.skills.map((skill) => (
                                  <Badge key={skill.id} variant="secondary" className="text-xs">
                                    {skill.name}
                                    <Star className="h-3 w-3 ml-1" />
                                    {skill.proficiency}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {match.missingSkills.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-2 text-red-600">Missing Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {match.missingSkills.map((skill, index) => (
                                  <Badge key={index} variant="outline" className="text-xs text-red-600">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedTaskId && (
                            <Button
                              onClick={() => assignResourceToTask(match.resource.id, selectedTaskId)}
                              className="w-full"
                              disabled={tasks.find(t => t.id === selectedTaskId)?.assigned_resources?.includes(match.resource.id)}
                            >
                              {tasks.find(t => t.id === selectedTaskId)?.assigned_resources?.includes(match.resource.id) 
                                ? 'Already Assigned' 
                                : 'Assign to Selected Task'
                              }
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAssignmentModal;
