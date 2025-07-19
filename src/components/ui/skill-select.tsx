
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

export interface Skill {
  id: string;
  name: string;
}

interface SkillSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SkillSelect: React.FC<SkillSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select a skill...",
  disabled = false
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error('Error fetching skills:', error);
          return;
        }

        if (data) {
          setSkills(data);
        }
      } catch (error) {
        console.error('Error in fetchSkills:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSkills();
  }, []);

  const handleCreateSkill = async (skillName: string) => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .insert([{ name: skillName }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newSkill: Skill = {
          id: data.id,
          name: data.name
        };
        setSkills(prev => [...prev, newSkill]);
        onValueChange?.(data.id);
      }
    } catch (error) {
      console.error('Error creating skill:', error);
    }
  };

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading skills..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {skills.map((skill) => (
          <SelectItem key={skill.id} value={skill.id}>
            {skill.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SkillSelect;
