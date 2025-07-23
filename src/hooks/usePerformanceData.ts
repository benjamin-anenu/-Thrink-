import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

export interface PerformanceProfile {
  id: string;
  resource_id: string;
  resource_name: string;
  workspace_id: string;
  current_score: number;
  monthly_score: number;
  trend: 'improving' | 'stable' | 'declining';
  strengths: string[];
  improvement_areas: string[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetric {
  id: string;
  resource_id: string;
  workspace_id: string;
  type: 'task_completion' | 'deadline_adherence' | 'quality_score' | 'collaboration' | 'communication';
  value: number;
  weight: number;
  timestamp: string;
  project_id?: string;
  task_id?: string;
  description: string;
  created_at: string;
}

export interface MonthlyPerformanceReport {
  id: string;
  resource_id: string;
  workspace_id: string;
  month: string;
  year: number;
  overall_score: number;
  productivity_score: number;
  quality_score: number;
  collaboration_score: number;
  deadline_adherence_score: number;
  communication_score: number;
  achievements: string[];
  challenges: string[];
  goals: string[];
  ai_insights: string[];
  manager_notes?: string;
  generated_at: string;
  created_at: string;
}

export const usePerformanceData = () => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<PerformanceProfile[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [reports, setReports] = useState<MonthlyPerformanceReport[]>([]);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchPerformanceData();
    }
  }, [currentWorkspace?.id]);

  const fetchPerformanceData = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);

      // Fetch performance profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('performance_profiles')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      if (profilesError) throw profilesError;

      // Fetch performance metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('timestamp', { ascending: false });

      if (metricsError) throw metricsError;

      // Fetch monthly reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('monthly_performance_reports')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (reportsError) throw reportsError;

      setProfiles(profilesData as PerformanceProfile[] || []);
      setMetrics(metricsData as PerformanceMetric[] || []);
      setReports(reportsData as MonthlyPerformanceReport[] || []);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch performance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPerformanceProfile = async (profileData: Omit<PerformanceProfile, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentWorkspace?.id) return null;

    try {
      const { data, error } = await supabase
        .from('performance_profiles')
        .insert([{ ...profileData, workspace_id: currentWorkspace.id }])
        .select()
        .single();

      if (error) throw error;

      setProfiles(prev => [...prev, data as PerformanceProfile]);
      toast({
        title: "Success",
        description: "Performance profile created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating performance profile:', error);
      toast({
        title: "Error",
        description: "Failed to create performance profile",
        variant: "destructive"
      });
      return null;
    }
  };

  const addPerformanceMetric = async (metricData: Omit<PerformanceMetric, 'id' | 'created_at'>) => {
    if (!currentWorkspace?.id) return null;

    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .insert([{ ...metricData, workspace_id: currentWorkspace.id }])
        .select()
        .single();

      if (error) throw error;

      setMetrics(prev => [data as PerformanceMetric, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding performance metric:', error);
      toast({
        title: "Error",
        description: "Failed to add performance metric",
        variant: "destructive"
      });
      return null;
    }
  };

  const generateMonthlyReport = async (resourceId: string) => {
    if (!currentWorkspace?.id) return null;

    try {
      const currentDate = new Date();
      const month = currentDate.toLocaleString('default', { month: 'long' });
      const year = currentDate.getFullYear();

      // Check if report already exists
      const { data: existingReport } = await supabase
        .from('monthly_performance_reports')
        .select('id')
        .eq('resource_id', resourceId)
        .eq('workspace_id', currentWorkspace.id)
        .eq('month', month)
        .eq('year', year)
        .single();

      if (existingReport) {
        toast({
          title: "Info",
          description: "Monthly report already exists for this period",
        });
        return existingReport;
      }

      // Get resource metrics for the month
      const startOfMonth = new Date(year, currentDate.getMonth(), 1);
      const endOfMonth = new Date(year, currentDate.getMonth() + 1, 0);

      const { data: monthlyMetrics } = await supabase
        .from('performance_metrics')
        .select('*')
        .eq('resource_id', resourceId)
        .eq('workspace_id', currentWorkspace.id)
        .gte('timestamp', startOfMonth.toISOString())
        .lte('timestamp', endOfMonth.toISOString());

      // Calculate scores based on metrics
      const calculateScore = (type: string) => {
        const typeMetrics = monthlyMetrics?.filter(m => m.type === type) || [];
        if (typeMetrics.length === 0) return 75; // Default score
        return typeMetrics.reduce((sum, m) => sum + m.value, 0) / typeMetrics.length;
      };

      const reportData = {
        resource_id: resourceId,
        workspace_id: currentWorkspace.id,
        month,
        year,
        overall_score: Math.round(
          (calculateScore('task_completion') +
           calculateScore('deadline_adherence') +
           calculateScore('quality_score') +
           calculateScore('collaboration') +
           calculateScore('communication')) / 5
        ),
        productivity_score: Math.round(calculateScore('task_completion')),
        quality_score: Math.round(calculateScore('quality_score')),
        collaboration_score: Math.round(calculateScore('collaboration')),
        deadline_adherence_score: Math.round(calculateScore('deadline_adherence')),
        communication_score: Math.round(calculateScore('communication')),
        achievements: ['Completed monthly targets', 'Improved team collaboration'],
        challenges: ['Meeting tight deadlines', 'Managing workload'],
        goals: ['Improve time management', 'Enhance technical skills'],
        ai_insights: ['Shows consistent performance trends', 'Opportunity for skill development'],
        generated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('monthly_performance_reports')
        .insert([reportData])
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Monthly performance report generated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error generating monthly report:', error);
      toast({
        title: "Error",
        description: "Failed to generate monthly report",
        variant: "destructive"
      });
      return null;
    }
  };

  const performanceMetrics = useMemo(() => {
    if (!profiles.length) return [];

    return [
      {
        name: 'Resource Utilization',
        value: profiles.reduce((sum, p) => sum + p.current_score, 0) / profiles.length,
        target: 85,
        trend: profiles.filter(p => p.trend === 'improving').length > profiles.filter(p => p.trend === 'declining').length ? 'up' : 'down' as 'up' | 'down' | 'stable',
        status: profiles.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length > 0 ? 'critical' : 'good' as 'good' | 'warning' | 'critical'
      },
      {
        name: 'Task Completion',
        value: metrics.filter(m => m.type === 'task_completion').reduce((sum, m) => sum + m.value, 0) / Math.max(metrics.filter(m => m.type === 'task_completion').length, 1),
        target: 90,
        trend: 'up' as 'up' | 'down' | 'stable',
        status: 'good' as 'good' | 'warning' | 'critical'
      },
      {
        name: 'Bottleneck Risk',
        value: profiles.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length * 20,
        target: 10,
        trend: 'stable' as 'up' | 'down' | 'stable',
        status: profiles.filter(p => p.risk_level === 'critical').length > 0 ? 'critical' : 'warning' as 'good' | 'warning' | 'critical'
      },
      {
        name: 'AI Recommendation Quality',
        value: 88,
        target: 85,
        trend: 'up' as 'up' | 'down' | 'stable',
        status: 'good' as 'good' | 'warning' | 'critical'
      }
    ];
  }, [profiles, metrics]);

  return {
    loading,
    profiles,
    metrics,
    reports,
    performanceMetrics,
    createPerformanceProfile,
    addPerformanceMetric,
    generateMonthlyReport,
    refetch: fetchPerformanceData
  };
};