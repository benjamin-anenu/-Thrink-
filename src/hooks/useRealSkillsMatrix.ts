import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';

export interface SkillData {
  skill: string;
  totalPeople: number;
  departments: string[];
  avgExperience: number;
  inDemand: boolean;
  avgProficiency: number;
  category: string;
}

export const useRealSkillsMatrix = () => {
  const [skillsData, setSkillsData] = useState<SkillData[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadSkillsData = async () => {
    if (!currentWorkspace) {
      setSkillsData([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch skills with proficiency data
      const { data: skillProficiencies, error } = await supabase
        .from('skill_proficiencies')
        .select(`
          skill_name,
          proficiency_level,
          years_experience,
          resource_id,
          resources!inner(department)
        `)
        .eq('workspace_id', currentWorkspace.id);

      if (error) throw error;

      // Group and aggregate skills data
      const skillsMap = new Map<string, {
        totalPeople: Set<string>;
        departments: Set<string>;
        totalExperience: number;
        totalProficiency: number;
        count: number;
      }>();

      skillProficiencies?.forEach((item: any) => {
        const skillName = item.skill_name;
        
        if (!skillsMap.has(skillName)) {
          skillsMap.set(skillName, {
            totalPeople: new Set(),
            departments: new Set(),
            totalExperience: 0,
            totalProficiency: 0,
            count: 0
          });
        }

        const skillData = skillsMap.get(skillName)!;
        skillData.totalPeople.add(item.resource_id);
        skillData.departments.add(item.resources.department);
        skillData.totalExperience += item.years_experience || 0;
        skillData.totalProficiency += item.proficiency_level || 0;
        skillData.count += 1;
      });

      // Convert to SkillData array
      const processedSkills: SkillData[] = Array.from(skillsMap.entries()).map(([skill, data]) => {
        const totalPeople = data.totalPeople.size;
        const avgExperience = data.count > 0 ? data.totalExperience / data.count : 0;
        const avgProficiency = data.count > 0 ? data.totalProficiency / data.count : 0;
        
        // Determine if skill is in high demand (based on total people and avg proficiency)
        const inDemand = totalPeople >= 3 && avgProficiency >= 7;

        return {
          skill,
          totalPeople,
          departments: Array.from(data.departments),
          avgExperience: Math.round(avgExperience * 10) / 10,
          avgProficiency: Math.round(avgProficiency * 10) / 10,
          inDemand,
          category: 'Technical' // Could be enhanced to categorize skills
        };
      });

      // Sort by total people (most common skills first)
      processedSkills.sort((a, b) => b.totalPeople - a.totalPeople);

      setSkillsData(processedSkills);

    } catch (error) {
      console.error('Error loading skills data:', error);
      toast.error('Failed to load skills matrix data');
      
      // Fallback to empty array
      setSkillsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSkillsData();
  }, [currentWorkspace]);

  return {
    skillsData,
    loading,
    refreshSkillsData: loadSkillsData,
  };
};