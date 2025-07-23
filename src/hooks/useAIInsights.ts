
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
        const transformedInsights: AIInsight[] = [];
        
        for (const rec of data || []) {
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

          // Add skill-specific insights with detailed analysis
          if (skillScore < 50) {
            try {
              // Enhance description with specific skill gap analysis
              const skillGapAnalysis = await getDetailedSkillAnalysis(rec);
              type = 'warning';
              title = 'Specific Skill Gap Detected';
              description = skillGapAnalysis || `${rec.resources?.name || 'Resource'} needs training in specific areas (${skillScore}% skill match)`;
            } catch (error) {
              type = 'warning';
              title = 'Skill Gap Detected';
              description = `${rec.resources?.name || 'Resource'} needs training in specific areas (${skillScore}% skill match)`;
            }
          }

          transformedInsights.push({
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
          });
        }

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
        
        // Simple capacity insights without utilization property
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

        if (resources.length > 0) {
          workspaceInsights.push({
            id: `insight-${Date.now()}-2`,
            type: 'info',
            title: 'Resource Overview',
            description: `${resources.length} resources available for ${activeProjects.length} active projects`,
            category: 'Overview',
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

  const getDetailedSkillAnalysis = async (recommendation: any): Promise<string> => {
    try {
      // Get detailed resource and project data
      const { data: resourceData } = await supabase
        .from('resources')
        .select('*, resource_skills(skill_id, proficiency, skills(name))')
        .eq('id', recommendation.resource_id)
        .single();

      const { data: projectData } = await supabase
        .from('projects')
        .select('*, tasks(*)')
        .eq('id', recommendation.project_id)
        .single();

      if (!resourceData || !projectData) return null;

      // Extract skill data
      const resourceSkills = resourceData.resource_skills?.map(rs => ({
        name: rs.skills?.name,
        proficiency: rs.proficiency
      })) || [];

      const taskTypes = projectData.tasks?.map(t => t.name) || [];

      // Call enhanced analysis function
      const response = await fetch('/functions/v1/enhanced-skill-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceName: resourceData.name,
          resourceSkills,
          projectRequirements: projectData.description,
          taskTypes,
          overallFitScore: recommendation.overall_fit_score,
          skillMatchScore: recommendation.skill_match_score
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.analysis) {
          const analysis = result.analysis;
          
          // Format specific recommendations
          const skillGaps = analysis.specificSkillGaps?.slice(0, 2).join(', ') || 'various skills';
          const trainingNeeded = analysis.trainingRecommendations?.[0]?.training || 'additional training';
          
          return `${resourceData.name} needs training in ${skillGaps}. Recommended: ${trainingNeeded}. Priority: ${analysis.priority}.`;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting detailed skill analysis:', error);
      return null;
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
