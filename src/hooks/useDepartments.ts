import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDepartments() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDepartments() {
      setLoading(true);
      const { data, error } = await supabase
        .from('stakeholders')
        .select('department');
      if (!error && data) {
        const unique = Array.from(new Set(data.map((row: any) => row.department).filter(Boolean)));
        setDepartments(unique);
      }
      setLoading(false);
    }
    fetchDepartments();
  }, []);

  return { departments, loading };
} 