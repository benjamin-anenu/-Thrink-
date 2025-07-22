import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface EnhancedResourceProfile {
  id: string;
  resource_id: string;
  employee_id?: string;
  seniority_level: string;
  employment_type: string;
  optimal_task_count_per_day: number;
  optimal_task_count_per_week: number;
  preferred_work_style: string;
  task_switching_preference: string;
  timezone: string;
  work_days: string[];
  peak_productivity_periods: string[];
  contract_end_date?: string;
  planned_time_off: any[];
  recurring_commitments: any[];
  career_aspirations: string[];
  mentorship_capacity: boolean;
  complexity_handling_score: number;
  collaboration_effectiveness: number;
  learning_task_success_rate: number;
  historical_task_velocity: number;
  strength_keywords: string[];
  growth_areas: string[];
}

export interface ResourceSkillProficiency {
  skill_name: string;
  proficiency_level: number;
  years_experience: number;
  confidence_score: number;
  last_used?: string;
  improvement_trend: string;
}

export interface ResourceProjectHistory {
  project_name: string;
  role: string;
  status: string;
  start_date: string;
  end_date?: string;
  tasks_completed: number;
  performance_score?: number;
}

export const useEnhancedResourceDetails = (resourceId: string) => {
  const [profile, setProfile] = useState<EnhancedResourceProfile | null>(null);
  const [skills, setSkills] = useState<ResourceSkillProficiency[]>([]);
  const [projectHistory, setProjectHistory] = useState<ResourceProjectHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadResourceDetails = async () => {
    if (!currentWorkspace || !resourceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Load resource profile
      const { data: profileData, error: profileError } = await supabase
        .from('resource_profiles')
        .select('*')
        .eq('resource_id', resourceId)
        .eq('workspace_id', currentWorkspace.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Load skills
      const { data: skillsData, error: skillsError } = await supabase
        .from('skill_proficiencies')
        .select('*')
        .eq('resource_id', resourceId)
        .eq('workspace_id', currentWorkspace.id);

      if (skillsError) {
        console.error('Error loading skills:', skillsError);
      } else {
        setSkills(skillsData || []);
      }

      // Load project history from tasks
      const { data: taskData, error: taskError } = await supabase
        .from('project_tasks')
        .select(`
          *,
          projects!inner(name, status)
        `)
        .eq('assignee_id', resourceId)
        .limit(10);

      if (taskError) {
        console.error('Error loading project history:', taskError);
      } else {
        // Process project history
        const projectMap = new Map<string, any>();
        
        taskData?.forEach((task: any) => {
          const projectName = task.projects.name;
          if (!projectMap.has(projectName)) {
            projectMap.set(projectName, {
              project_name: projectName,
              role: 'Team Member',
              status: task.projects.status,
              start_date: task.start_date,
              end_date: task.end_date,
              tasks_completed: 0,
              total_tasks: 0
            });
          }

          const project = projectMap.get(projectName);
          project.total_tasks += 1;
          if (task.status === 'Completed') {
            project.tasks_completed += 1;
          }
        });

        setProjectHistory(Array.from(projectMap.values()));
      }

    } catch (error) {
      console.error('Error loading resource details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResourceDetails();
  }, [resourceId, currentWorkspace]);

  return {
    profile,
    skills,
    projectHistory,
    loading,
    refreshDetails: loadResourceDetails,
  };
};