
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';

interface Milestone {
  id: string;
  name: string;
  due_date?: string;
  status?: string;
  progress?: number;
  description?: string;
}

interface ProjectTimelineProps {
  projectId: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const { getProject } = useProject();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  
  const project = getProject(projectId);

  useEffect(() => {
    loadMilestones();
  }, [projectId]);

  const loadMilestones = async () => {
    try {
      setLoading(true);

      // Load milestones
      const { data: milestonesData, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date');

      if (milestonesError) throw milestonesError;

      setMilestones(milestonesData || []);
    } catch (error) {
      console.error('Error loading project timeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in progress': return 'bg-blue-500 text-white';
      case 'upcoming': return 'bg-gray-500 text-white';
      case 'delayed': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const isDelayed = (milestone: Milestone) => {
    if (!milestone.due_date) return false;
    return new Date(milestone.due_date) < new Date() && milestone.status !== 'Completed';
  };

  // Calculate metrics
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const inProgressMilestones = milestones.filter(m => m.status === 'In Progress').length;
  const upcomingMilestones = milestones.filter(m => m.status === 'Upcoming' || (!m.status && m.due_date && new Date(m.due_date) > new Date())).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Milestone Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="font-semibold">{completedMilestones}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="font-semibold">{inProgressMilestones}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="font-semibold">{upcomingMilestones}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Milestones</p>
                <p className="font-semibold">{totalMilestones}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Project Milestones Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading milestones...</p>
            </div>
          ) : milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No milestones found for this project</p>
            </div>
          ) : (
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-lg">{milestone.name}</h4>
                    <div className="flex items-center gap-2">
                      {isDelayed(milestone) && (
                        <Badge variant="destructive" className="text-xs">
                          Delayed
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-xs ${getStatusColor(milestone.status || 'Upcoming')}`}>
                        {milestone.status || 'Upcoming'}
                      </Badge>
                    </div>
                  </div>
                  
                  {milestone.description && (
                    <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Due Date:</span> {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'Not set'}
                    </div>
                    
                    {milestone.progress !== undefined && milestone.progress > 0 && (
                      <div className="flex items-center gap-2 min-w-[200px]">
                        <Progress value={milestone.progress} className="flex-1" />
                        <span className="text-sm text-muted-foreground">{milestone.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Critical Path Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Path Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Critical path analysis will be available once task dependencies are configured</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimeline;
