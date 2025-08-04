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
  planned_time_off: any; // Changed from any[] to any to handle Json type
  recurring_commitments: any; // Changed from any[] to any to handle Json type
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
  total_tasks?: number;
  active_tasks?: number;
  overdue_tasks?: number;
  recent_activity?: Array<{
    task_name: string;
    status: string;
    due_date?: string;
    is_overdue: boolean;
  }>;
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

      // Load skills with skill names from skills table
      const { data: skillsData, error: skillsError } = await supabase
        .from('skill_proficiencies')
        .select(`
          *,
          skills!inner(name)
        `)
        .eq('resource_id', resourceId)
        .eq('workspace_id', currentWorkspace.id);

      if (skillsError) {
        console.error('Error loading skills:', skillsError);
      } else {
        // Map database fields to interface with skill names
        const mappedSkills = (skillsData || []).map((skill: any) => ({
          skill_name: skill.skills?.name || 'Unknown Skill',
          proficiency_level: skill.proficiency_level,
          years_experience: skill.years_experience,
          confidence_score: skill.confidence_score,
          last_used: skill.last_used,
          improvement_trend: skill.improvement_trend
        }));
        setSkills(mappedSkills);
      }

      // Load comprehensive project history from tasks
      const { data: taskData, error: taskError } = await supabase
        .from('project_tasks')
        .select(`
          *,
          projects!inner(name, status, start_date, end_date)
        `)
        .or(`assignee_id.eq.${resourceId},assigned_resources.cs.{${resourceId}}`)
        .order('created_at', { ascending: false });

      if (taskError) {
        console.error('Error loading project history:', taskError);
      } else {
        // Process project history with enhanced data
        const projectMap = new Map<string, any>();
        
        taskData?.forEach((task: any) => {
          const projectName = task.projects.name;
          const projectStatus = task.projects.status;
          const projectId = task.project_id;
          
          if (!projectMap.has(projectId)) {
            projectMap.set(projectId, {
              project_name: projectName,
              role: 'Team Member',
              status: projectStatus,
              start_date: task.projects.start_date || task.start_date,
              end_date: task.projects.end_date || task.end_date,
              tasks_completed: 0,
              total_tasks: 0,
              active_tasks: 0,
              overdue_tasks: 0,
              recent_activity: []
            });
          }

          const project = projectMap.get(projectId);
          project.total_tasks += 1;
          
          if (task.status === 'Completed') {
            project.tasks_completed += 1;
          } else if (['To Do', 'In Progress', 'In Review'].includes(task.status)) {
            project.active_tasks += 1;
          }
          
          // Check for overdue tasks
          if (task.end_date && new Date(task.end_date) < new Date() && task.status !== 'Completed') {
            project.overdue_tasks += 1;
          }

          // Add recent activity for active projects
          if (projectStatus === 'Active' && project.recent_activity.length < 3) {
            project.recent_activity.push({
              task_name: task.name,
              status: task.status,
              due_date: task.end_date,
              is_overdue: task.end_date && new Date(task.end_date) < new Date() && task.status !== 'Completed'
            });
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