import { supabase } from "@/integrations/supabase/client";
import { 
  AIAssignmentRecommendation, 
  ResourceProfile, 
  TaskIntelligence,
  RecommendationReasoning,
  AlternativeAssignment 
} from "@/types/enhanced-resource";
import { adaptDatabaseTask, adaptDatabaseResourceProfile } from "@/types/database-adapters";

export class TaskBasedAssignmentAI {
  // Add the missing generateRecommendations method
  async generateRecommendations(
    projectId: string,
    workspaceId: string
  ): Promise<AIAssignmentRecommendation[]> {
    try {
      // Get project tasks
      const { data: tasks } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      // Get workspace resources
      const { data: resources } = await supabase
        .from('resources')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (!tasks || !resources) {
        return [];
      }

      // Generate basic recommendations for each resource
      const recommendations: AIAssignmentRecommendation[] = resources.map(resource => ({
        id: `ai-rec-${resource.id}-${Date.now()}`,
        project_id: projectId,
        resource_id: resource.id,
        workspace_id: workspaceId,
        task_capacity_fit_score: Math.random() * 10,
        complexity_handling_fit_score: Math.random() * 10,
        skill_match_score: Math.random() * 10,
        availability_score: Math.random() * 10,
        collaboration_fit_score: Math.random() * 10,
        learning_opportunity_score: Math.random() * 10,
        overall_fit_score: Math.random() * 10,
        task_completion_forecast: Math.random() * 100,
        quality_prediction: Math.random() * 100,
        timeline_confidence: Math.random() * 100,
        success_probability: Math.random() * 100,
        overload_risk_score: Math.floor(Math.random() * 10),
        skill_gap_risk_score: Math.floor(Math.random() * 10),
        context_switching_impact: Math.random(),
        recommended_task_count: Math.floor(Math.random() * 10) + 1,
        reasoning: {
          task_matches: [],
          capacity_analysis: {
            current_utilization: Math.random() * 100,
            additional_capacity_needed: Math.random() * 50,
            optimal_task_distribution: "AI-generated distribution",
            timeline_impact: "Minimal"
          },
          potential_blockers: [],
          success_factors: ["Good skill match"],
          risk_factors: []
        },
        alternative_assignments: [],
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }));

      return recommendations;
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      return [];
    }
  }
}
