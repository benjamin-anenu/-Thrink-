import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export function useDepartments() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    async function fetchDepartments() {
      if (!currentWorkspace) {
        setDepartments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('name')
          .eq('workspace_id', currentWorkspace.id)
          .eq('is_active', true)
          .order('name');
        
        if (error) throw error;
        
        const departmentNames = data?.map(dept => dept.name) || [];
        setDepartments(departmentNames);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Failed to load departments');
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDepartments();
  }, [currentWorkspace]);

  return { departments, loading, error };
}