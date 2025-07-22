
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export class DataPopulationService {
  static async populateInitialData() {
    try {
      console.log('Starting data population...');
      
      // Call the database function to populate initial data
      const { error } = await supabase.rpc('populate_initial_resource_profiles');
      
      if (error) {
        console.error('Error populating initial data:', error);
        throw error;
      }
      
      console.log('Initial data populated successfully');
      return true;
    } catch (error) {
      console.error('Failed to populate initial data:', error);
      toast.error('Failed to populate initial resource data');
      return false;
    }
  }

  static async createSampleAIRecommendations(workspaceId: string) {
    try {
      // Get existing projects and resources
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('workspace_id', workspaceId)
        .limit(3);

      const { data: resources } = await supabase
        .from('resources')
        .select('id')
        .eq('workspace_id', workspaceId)
        .limit(5);

      if (!projects || !resources || projects.length === 0 || resources.length === 0) {
        console.log('No projects or resources found for AI recommendations');
        return;
      }

      const recommendations = [];
      
      // Create sample AI recommendations
      for (const project of projects) {
        for (const resource of resources.slice(0, 2)) {
          recommendations.push({
            project_id: project.id,
            resource_id: resource.id,
            workspace_id: workspaceId,
            task_capacity_fit_score: 7 + Math.random() * 3,
            complexity_handling_fit_score: 6 + Math.random() * 4,
            skill_match_score: 8 + Math.random() * 2,
            availability_score: 5 + Math.random() * 5,
            collaboration_fit_score: 7 + Math.random() * 3,
            learning_opportunity_score: 6 + Math.random() * 4,
            overall_fit_score: 7 + Math.random() * 2.5,
            task_completion_forecast: 75 + Math.random() * 20,
            quality_prediction: 80 + Math.random() * 15,
            timeline_confidence: 70 + Math.random() * 25,
            success_probability: 78 + Math.random() * 18,
            overload_risk_score: Math.floor(Math.random() * 5),
            skill_gap_risk_score: Math.floor(Math.random() * 4),
            context_switching_impact: Math.random() * 0.3,
            recommended_task_count: 3 + Math.floor(Math.random() * 5),
            reasoning: JSON.stringify({
              task_matches: [
                {
                  task_id: `task-${Math.random().toString(36).substr(2, 9)}`,
                  task_name: 'Sample Task',
                  fit_score: 8.5,
                  reasoning: 'Strong skill alignment and availability',
                  learning_opportunity: Math.random() > 0.5
                }
              ],
              capacity_analysis: {
                current_utilization: 60 + Math.random() * 30,
                additional_capacity_needed: 20 + Math.random() * 30,
                optimal_task_distribution: 'Balanced mix of complex and simple tasks',
                timeline_impact: 'Minimal impact expected'
              },
              potential_blockers: [],
              success_factors: ['Strong technical skills', 'Good team collaboration'],
              risk_factors: ['Potential scheduling conflict']
            }),
            alternative_assignments: JSON.stringify([])
          });
        }
      }

      const { error } = await supabase
        .from('ai_assignment_recommendations')
        .insert(recommendations);

      if (error) {
        console.error('Error creating AI recommendations:', error);
        throw error;
      }

      console.log(`Created ${recommendations.length} AI recommendations`);
      return recommendations.length;
    } catch (error) {
      console.error('Failed to create sample AI recommendations:', error);
      return 0;
    }
  }

  static async createSampleSkillProficiencies(workspaceId: string) {
    try {
      const { data: resources } = await supabase
        .from('resources')
        .select('id')
        .eq('workspace_id', workspaceId);

      const { data: skills } = await supabase
        .from('skills')
        .select('id, name')
        .eq('workspace_id', workspaceId);

      if (!resources || !skills || resources.length === 0 || skills.length === 0) {
        console.log('No resources or skills found for proficiencies');
        return;
      }

      const proficiencies = [];
      
      for (const resource of resources) {
        // Assign 3-5 random skills to each resource
        const numSkills = 3 + Math.floor(Math.random() * 3);
        const selectedSkills = skills.sort(() => 0.5 - Math.random()).slice(0, numSkills);
        
        for (const skill of selectedSkills) {
          proficiencies.push({
            resource_id: resource.id,
            skill_id: skill.id,
            workspace_id: workspaceId,
            skill_name: skill.name,
            proficiency_level: 4 + Math.floor(Math.random() * 6), // 4-9
            years_experience: Math.floor(Math.random() * 8) + 1, // 1-8
            confidence_score: 5 + Math.floor(Math.random() * 5), // 5-9
            improvement_trend: ['Improving', 'Stable', 'Declining'][Math.floor(Math.random() * 3)]
          });
        }
      }

      const { error } = await supabase
        .from('skill_proficiencies')
        .insert(proficiencies);

      if (error) {
        console.error('Error creating skill proficiencies:', error);
        throw error;
      }

      console.log(`Created ${proficiencies.length} skill proficiencies`);
      return proficiencies.length;
    } catch (error) {
      console.error('Failed to create sample skill proficiencies:', error);
      return 0;
    }
  }

  static async populateAllSampleData(workspaceId: string) {
    try {
      console.log('Populating all sample data for workspace:', workspaceId);
      
      // Populate initial resource profiles and utilization metrics
      await this.populateInitialData();
      
      // Add AI recommendations
      const recommendationsCount = await this.createSampleAIRecommendations(workspaceId);
      
      // Add skill proficiencies
      const proficienciesCount = await this.createSampleSkillProficiencies(workspaceId);
      
      toast.success(`Sample data populated: ${recommendationsCount} AI recommendations, ${proficienciesCount} skill proficiencies`);
      
      return true;
    } catch (error) {
      console.error('Failed to populate all sample data:', error);
      toast.error('Failed to populate sample data');
      return false;
    }
  }
}
