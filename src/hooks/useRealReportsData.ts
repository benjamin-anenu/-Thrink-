
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface ReportData {
  id: string;
  type: string;
  data: any;
  createdAt: Date;
  generatedBy: string;
  projectId?: string;
}

export interface ReportConfig {
  type: string;
  frequency: string;
  recipients: string[];
  sections: string[];
  dateRange: {
    from: Date;
    to: Date;
  };
}

export const useRealReportsData = (selectedProject?: string) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (!currentWorkspace) return;

    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('reports')
          .select(`
            *,
            projects:project_id (
              id,
              name,
              workspace_id
            )
          `)
          .eq('projects.workspace_id', currentWorkspace.id)
          .order('created_at', { ascending: false });

        if (selectedProject && selectedProject !== 'all') {
          query = query.eq('project_id', selectedProject);
        }

        const { data, error: reportsError } = await query;

        if (reportsError) throw reportsError;

        const transformedReports: ReportData[] = (data || []).map(report => ({
          id: report.id,
          type: report.type || 'Unknown',
          data: report.data,
          createdAt: new Date(report.created_at),
          generatedBy: report.generated_by || 'System',
          projectId: report.project_id
        }));

        setReports(transformedReports);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [currentWorkspace, selectedProject]);

  const generateReport = async (config: ReportConfig) => {
    if (!currentWorkspace) return null;

    try {
      // Generate report data based on current projects and resources
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);

      // Convert dates to ISO strings for JSON compatibility
      const reportData = {
        generatedAt: new Date().toISOString(),
        type: config.type,
        frequency: config.frequency,
        sections: config.sections,
        dateRange: {
          from: config.dateRange.from.toISOString(),
          to: config.dateRange.to.toISOString()
        },
        summary: {
          totalProjects: projectsData?.length || 0,
          totalResources: resourcesData?.length || 0,
          activeProjects: projectsData?.filter(p => p.status === 'Active').length || 0,
          completedProjects: projectsData?.filter(p => p.status === 'Completed').length || 0
        },
        projects: projectsData || [],
        resources: resourcesData || []
      };

      const { data, error } = await supabase
        .from('reports')
        .insert({
          type: config.type,
          data: reportData,
          generated_by: (await supabase.auth.getUser()).data.user?.id,
          project_id: selectedProject !== 'all' ? selectedProject : null
        })
        .select()
        .single();

      if (error) throw error;

      const newReport: ReportData = {
        id: data.id,
        type: data.type,
        data: data.data,
        createdAt: new Date(data.created_at),
        generatedBy: data.generated_by,
        projectId: data.project_id
      };

      setReports(prev => [newReport, ...prev]);
      return newReport;
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      return null;
    }
  };

  const downloadReport = async (reportId: string, format: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) throw new Error('Report not found');

      // Generate downloadable content based on format
      const content = format === 'pdf' 
        ? JSON.stringify(report.data, null, 2)
        : format === 'csv'
        ? convertToCSV(report.data)
        : JSON.stringify(report.data, null, 2);

      // Create and trigger download
      const blob = new Blob([content], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.type}-report-${report.id}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(err instanceof Error ? err.message : 'Failed to download report');
      return false;
    }
  };

  const convertToCSV = (data: any): string => {
    if (!data || typeof data !== 'object') return '';
    
    // Simple CSV conversion for basic data
    if (data.projects && Array.isArray(data.projects)) {
      const headers = ['Name', 'Status', 'Progress', 'Start Date', 'End Date'];
      const rows = data.projects.map((project: any) => [
        project.name || '',
        project.status || '',
        project.progress || 0,
        project.start_date || '',
        project.end_date || ''
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    return JSON.stringify(data, null, 2);
  };

  return {
    reports,
    loading,
    error,
    generateReport,
    downloadReport
  };
};
