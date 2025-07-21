
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Clock, Target, RefreshCw } from 'lucide-react';
import { ProjectTask } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CriticalPathAnalysisProps {
  projectId: string;
  tasks: ProjectTask[];
}

interface CriticalPathData {
  id: string;
  critical_path_tasks: string[];
  total_duration_days: number;
  slack_days: number;
  analysis_date: string;
  analysis_data: any;
}

const CriticalPathAnalysis: React.FC<CriticalPathAnalysisProps> = ({ projectId, tasks }) => {
  const [criticalPath, setCriticalPath] = useState<CriticalPathData | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const loadCriticalPath = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('critical_path_analysis')
        .select('*')
        .eq('project_id', projectId)
        .order('analysis_date', { ascending: false })
        .limit(1);

      if (error) throw error;
      setCriticalPath(data?.[0] || null);
    } catch (error) {
      console.error('Error loading critical path:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCriticalPath = async () => {
    try {
      setAnalyzing(true);
      
      // Simple critical path calculation
      const sortedTasks = [...tasks].sort((a, b) => {
        const aEnd = new Date(a.endDate).getTime();
        const bEnd = new Date(b.endDate).getTime();
        return bEnd - aEnd;
      });

      const criticalTasks = sortedTasks
        .filter(task => task.priority === 'High' || task.priority === 'Critical')
        .slice(0, 5)
        .map(task => task.id);

      const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
      const avgSlack = Math.floor(totalDuration * 0.1); // 10% buffer

      const analysisData = {
        total_tasks: tasks.length,
        critical_tasks_count: criticalTasks.length,
        avg_task_duration: Math.round(totalDuration / tasks.length),
        risk_level: criticalTasks.length > 3 ? 'high' : 'medium'
      };

      const { data, error } = await supabase
        .from('critical_path_analysis')
        .insert([{
          project_id: projectId,
          critical_path_tasks: criticalTasks,
          total_duration_days: totalDuration,
          slack_days: avgSlack,
          analysis_data: analysisData,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select();

      if (error) throw error;
      setCriticalPath(data[0]);
      toast.success('Critical path analysis updated');
    } catch (error) {
      console.error('Error analyzing critical path:', error);
      toast.error('Failed to analyze critical path');
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    loadCriticalPath();
  }, [projectId]);

  const criticalTasks = tasks.filter(task => 
    criticalPath?.critical_path_tasks.includes(task.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Critical Path Analysis
          </CardTitle>
          <Button
            onClick={analyzeCriticalPath}
            disabled={analyzing}
            variant="outline"
            size="sm"
          >
            {analyzing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Target className="h-4 w-4 mr-2" />
            )}
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading analysis...
          </div>
        ) : criticalPath ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {criticalPath.total_duration_days}
                </div>
                <div className="text-sm text-muted-foreground">Total Duration (Days)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {criticalPath.slack_days}
                </div>
                <div className="text-sm text-muted-foreground">Slack Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {criticalPath.critical_path_tasks.length}
                </div>
                <div className="text-sm text-muted-foreground">Critical Tasks</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Critical Path Tasks
              </h4>
              <div className="space-y-2">
                {criticalTasks.length > 0 ? (
                  criticalTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{task.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={task.priority === 'Critical' ? 'destructive' : 'secondary'}>
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {task.duration}d
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No critical tasks identified</p>
                )}
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Last analyzed: {new Date(criticalPath.analysis_date).toLocaleDateString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No critical path analysis available
            </p>
            <Button onClick={analyzeCriticalPath} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalPathAnalysis;
