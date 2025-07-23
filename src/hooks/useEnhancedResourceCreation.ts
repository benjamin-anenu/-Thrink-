
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ResourceFormData } from '@/components/ResourceCreationWizard';

export const useEnhancedResourceCreation = () => {
  const [isCreating, setIsCreating] = useState(false);

  const createEnhancedResource = async (formData: ResourceFormData, workspaceId: string) => {
    if (isCreating) return null;
    
    setIsCreating(true);
    
    try {
      // Start a transaction by creating the main resource first
      const { data: resourceData, error: resourceError } = await supabase
        .from('resources')
        .insert({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          workspace_id: workspaceId,
        })
        .select()
        .single();

      if (resourceError) throw resourceError;

      const resourceId = resourceData.id;

      // Create resource profile
      const { error: profileError } = await supabase
        .from('resource_profiles')
        .insert({
          resource_id: resourceId,
          workspace_id: workspaceId,
          employee_id: `EMP-${resourceId.slice(0, 8)}`,
          seniority_level: formData.seniorityLevel,
          employment_type: formData.employmentType,
          optimal_task_count_per_day: formData.optimalTaskCountPerDay,
          optimal_task_count_per_week: formData.optimalTaskCountPerWeek,
          preferred_work_style: formData.preferredWorkStyle,
          task_switching_preference: formData.taskSwitchingPreference,
          timezone: formData.timezone,
          work_days: formData.workDays,
          peak_productivity_periods: formData.peakProductivityPeriods,
          contract_end_date: formData.contractEndDate,
          planned_time_off: formData.plannedTimeOff,
          recurring_commitments: formData.recurringCommitments,
          career_aspirations: formData.careerAspirations,
          mentorship_capacity: formData.mentorshipCapacity,
          complexity_handling_score: formData.complexityHandlingScore,
          collaboration_effectiveness: formData.collaborationEffectiveness,
          learning_task_success_rate: formData.learningTaskSuccessRate,
          historical_task_velocity: formData.historicalTaskVelocity,
          strength_keywords: formData.strengthKeywords,
          growth_areas: formData.growthAreas,
        });

      if (profileError) throw profileError;

      // Create skill proficiencies (without certification level)
      if (formData.skills.length > 0) {
        const skillProficiencies = formData.skills.map(skill => ({
          resource_id: resourceId,
          workspace_id: workspaceId,
          skill_name: skill.skillName,
          proficiency_level: skill.proficiencyLevel,
          years_experience: skill.yearsExperience,
          confidence_score: skill.confidenceScore,
        }));

        const { error: skillsError } = await supabase
          .from('skill_proficiencies')
          .insert(skillProficiencies);

        if (skillsError) throw skillsError;
      }

      return resourceData;
    } catch (error) {
      console.error('Error creating enhanced resource:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createEnhancedResource,
    isCreating,
  };
};
