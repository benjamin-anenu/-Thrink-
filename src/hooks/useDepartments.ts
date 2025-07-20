
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface Department {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!currentWorkspace?.id) {
        setDepartments([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('departments')
          .select('name')
          .order('name');

        if (error) throw error;
        setDepartments(data?.map(d => d.name) || []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [currentWorkspace?.id]);

  return { departments, loading };
};
