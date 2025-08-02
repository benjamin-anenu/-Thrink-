
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProjectPhase {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  computed_start_date: string | null;
  computed_end_date: string | null;
  sort_order: number;
  status: string;
}

export const useProjectPhases = (projectId: string) => {
  const [phases, setPhases] = useState<ProjectPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectDateRange, setProjectDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });

  useEffect(() => {
    const fetchPhases = async () => {
      try {
        setLoading(true);
        
        // Fetch phases
        const { data: phasesData, error: phasesError } = await supabase
          .from('phases')
          .select('*')
          .eq('project_id', projectId)
          .order('sort_order');

        if (phasesError) throw phasesError;
        
        setPhases(phasesData || []);

        // Get project date range from phases
        const { data: dateRange, error: dateRangeError } = await supabase
          .rpc('get_project_phase_date_range', { project_id_param: projectId });

        if (dateRangeError) {
          console.error('Error fetching project date range:', dateRangeError);
        } else if (dateRange && dateRange.length > 0) {
          setProjectDateRange({
            startDate: dateRange[0].start_date,
            endDate: dateRange[0].end_date
          });
        }

      } catch (error) {
        console.error('Error fetching phases:', error);
        toast.error('Failed to load project phases');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchPhases();
    }
  }, [projectId]);

  return { phases, loading, projectDateRange };
};
