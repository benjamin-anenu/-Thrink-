
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ResourceSkillMatch {
  resource: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
  };
  skills: {
    id: string;
    name: string;
    proficiency: number;
    years_experience: number;
  }[];
  matchPercentage: number;
  missingSkills: string[];
}

export const useSkillMatching = () => {
  const [loading, setLoading] = useState(false);

  const getResourceSkillMatches = async (projectId: string, taskId?: string) => {
    setLoading(true);
    try {
      // Get all resources in the workspace
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select(`
          id, name, email, role, department, workspace_id,
          resource_skills(
            id, proficiency, years_experience,
            skills(id, name)
          )
        `)
        .is('deleted_at', null);

      if (resourcesError) throw resourcesError;

      // Get required skills for the task or project
      let requiredSkills: string[] = [];
      
      if (taskId) {
        const { data: task, error: taskError } = await supabase
          .from('project_tasks')
          .select('required_skills')
          .eq('id', taskId)
          .single();
        
        if (taskError) throw taskError;
        requiredSkills = task?.required_skills || [];
      } else {
        // Get skills from all tasks in the project
        const { data: tasks, error: tasksError } = await supabase
          .from('project_tasks')
          .select('required_skills')
          .eq('project_id', projectId);
        
        if (tasksError) throw tasksError;
        
        // Combine all required skills
        const allSkills = tasks?.flatMap(task => task.required_skills || []) || [];
        requiredSkills = [...new Set(allSkills)];
      }

      // Get skill names
      const { data: skillData, error: skillError } = await supabase
        .from('skills')
        .select('id, name')
        .in('id', requiredSkills);

      if (skillError) throw skillError;

      const skillMap = new Map(skillData?.map(skill => [skill.id, skill.name]) || []);

      // Calculate matches
      const matches: ResourceSkillMatch[] = resources?.map(resource => {
        const resourceSkills = resource.resource_skills?.map(rs => ({
          id: rs.skills.id,
          name: rs.skills.name,
          proficiency: rs.proficiency,
          years_experience: rs.years_experience
        })) || [];

        const resourceSkillIds = new Set(resourceSkills.map(s => s.id));
        const matchedSkills = requiredSkills.filter(skillId => resourceSkillIds.has(skillId));
        const missingSkills = requiredSkills
          .filter(skillId => !resourceSkillIds.has(skillId))
          .map(skillId => skillMap.get(skillId) || skillId);

        const matchPercentage = requiredSkills.length > 0 
          ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
          : 100;

        return {
          resource: {
            id: resource.id,
            name: resource.name,
            email: resource.email || '',
            role: resource.role || '',
            department: resource.department || ''
          },
          skills: resourceSkills,
          matchPercentage,
          missingSkills
        };
      }) || [];

      // Sort by match percentage (highest first)
      matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

      return matches;
    } catch (error) {
      console.error('Error getting skill matches:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    getResourceSkillMatches,
    loading
  };
};
