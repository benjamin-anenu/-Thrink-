import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Skill {
  id: string;
  name: string;
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use predefined skills since 'skills' table doesn't exist
    const predefinedSkills: Skill[] = [
      { id: '1', name: 'Project Management' },
      { id: '2', name: 'Software Development' },
      { id: '3', name: 'UI/UX Design' },
      { id: '4', name: 'Data Analysis' },
      { id: '5', name: 'Quality Assurance' },
      { id: '6', name: 'DevOps' },
      { id: '7', name: 'Business Analysis' },
      { id: '8', name: 'Marketing' },
      { id: '9', name: 'Sales' },
      { id: '10', name: 'Finance' },
    ];
    setSkills(predefinedSkills);
    setLoading(false);
  }, []);

  return { skills, loading };
}