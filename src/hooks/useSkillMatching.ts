
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
          id, name, email, role, department, workspace_id
        `)
        .not('deleted_at', 'is', null);

      if (resourcesError) throw resourcesError;

      // For now, we'll return a basic skill match analysis
      // Since required_skills column might not exist yet, we'll simulate it
      const matches: ResourceSkillMatch[] = resources?.map(resource => {
        // Simulate some skills and matching logic
        const resourceSkills = [
          { id: '1', name: 'Project Management', proficiency: 4, years_experience: 3 },
          { id: '2', name: 'React', proficiency: 3, years_experience: 2 }
        ];

        // Simulate missing skills
        const missingSkills = ['Node.js', 'TypeScript'];
        
        // Calculate a basic match percentage
        const matchPercentage = Math.floor(Math.random() * 40) + 60; // 60-100%

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
