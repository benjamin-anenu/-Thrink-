
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface AIInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  description: string;
  category: string;
  actionable: boolean;
  projectId?: string;
  resourceId?: string;
  overallFitScore?: number;
  skillMatchScore?: number;
  successProbability?: number;
  reasoning?: any;
  createdAt: Date;
}

export const useAIInsights = (projectId?: string) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (!currentWorkspace) return;

    const fetchAIInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('ai_assignment_recommendations')
          .select(`
            *,
            resources:resource_id (
              id,
              name,
              role
            ),
            projects:project_id (
              id,
              name
            )
          `)
          .eq('workspace_id', currentWorkspace.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (projectId) {
          query = query.eq('project_id', projectId);
        }

        const { data, error: recommendationsError } = await query;

        if (recommendationsError) throw recommendationsError;

        // Transform AI recommendations into actionable insights
        const transformedInsights: AIInsight[] = (data || []).map(rec => {
          const overallScore = rec.overall_fit_score || 0;
          const skillScore = rec.skill_match_score || 0;
          const successProb = rec.success_probability || 0;
          
          let type: AIInsight['type'] = 'info';
          let title = 'Resource Assignment Recommendation';
          let description = 'AI recommendation available';

          // Generate insights based on scores
          if (overallScore >= 80) {
            type = 'success';
            title = 'Excellent Resource Match';
            description = `${rec.resources?.name || 'Resource'} is an excellent fit with ${overallScore}% compatibility`;
          } else if (overallScore >= 60) {
            type = 'info';
            title = 'Good Resource Match';
            description = `${rec.resources?.name || 'Resource'} is a good fit with ${overallScore}% compatibility`;
          } else if (overallScore < 40) {
            type = 'warning';
            title = 'Resource Assignment Risk';
            description = `${rec.resources?.name || 'Resource'} may face challenges with ${overallScore}% compatibility`;
          }

          // Add skill-specific insights
          if (skillScore < 50) {
            type = 'warning';
            title = 'Skill Gap Detected';
            description = `${rec.resources?.name || 'Resource'} may need additional training (${skillScore}% skill match)`;
          }

          return {
            id: rec.id,
            type,
            title,
            description,
            category: 'Assignment',
            actionable: overallScore < 60 || skillScore < 50,
            projectId: rec.project_id,
            resourceId: rec.resource_id,
            overallFitScore: overallScore,
            skillMatchScore: skillScore,
            successProbability: successProb,
            reasoning: rec.reasoning,
            createdAt: new Date(rec.created_at)
          };
        });

        // Add general workspace insights
        const workspaceInsights = await generateWorkspaceInsights();
        
        setInsights([...transformedInsights, ...workspaceInsights]);
      } catch (err) {
        console.error('Error fetching AI insights:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch AI insights');
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, [currentWorkspace, projectId]);

  const generateWorkspaceInsights = async (): Promise<AIInsight[]> => {
    try {
      // Fetch workspace data for general insights
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', currentWorkspace?.id);

      const { data: resources } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', currentWorkspace?.id);

      const workspaceInsights: AIInsight[] = [];

      if (projects && resources) {
        const activeProjects = projects.filter(p => p.status === 'Active');
        const overloadedResources = resources.filter(r => r.utilization > 90);
        const underutilizedResources = resources.filter(r => r.utilization < 30);

        if (activeProjects.length > resources.length * 2) {
          workspaceInsights.push({
            id: `insight-${Date.now()}-1`,
            type: 'warning',
            title: 'Resource Capacity Warning',
            description: `${activeProjects.length} active projects may overwhelm ${resources.length} resources`,
            category: 'Capacity',
            actionable: true,
            createdAt: new Date()
          });
        }

        if (overloadedResources.length > 0) {
          workspaceInsights.push({
            id: `insight-${Date.now()}-2`,
            type: 'error',
            title: 'Overloaded Resources',
            description: `${overloadedResources.length} resources are operating at >90% capacity`,
            category: 'Workload',
            actionable: true,
            createdAt: new Date()
          });
        }

        if (underutilizedResources.length > 0) {
          workspaceInsights.push({
            id: `insight-${Date.now()}-3`,
            type: 'info',
            title: 'Available Capacity',
            description: `${underutilizedResources.length} resources have available capacity for new work`,
            category: 'Opportunity',
            actionable: false,
            createdAt: new Date()
          });
        }
      }

      return workspaceInsights;
    } catch (err) {
      console.error('Error generating workspace insights:', err);
      return [];
    }
  };

  return {
    insights,
    loading,
    error,
    refreshInsights: () => {
      if (currentWorkspace) {
        setLoading(true);
        // Trigger re-fetch
        const event = new Event('ai-insights-refresh');
        window.dispatchEvent(event);
      }
    }
  };
};
