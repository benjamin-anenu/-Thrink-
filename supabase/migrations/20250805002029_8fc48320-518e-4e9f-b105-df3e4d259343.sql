-- Trigger the computation of computed dates for existing data
DO $$
DECLARE
  project_rec RECORD;
  phase_rec RECORD;
BEGIN
  -- Update computed dates for all phases
  FOR phase_rec IN 
    SELECT id FROM phases WHERE computed_start_date IS NULL OR computed_end_date IS NULL
  LOOP
    PERFORM public.update_phase_computed_dates(phase_rec.id);
  END LOOP;
  
  -- Update computed dates for all projects  
  FOR project_rec IN 
    SELECT id FROM projects WHERE computed_start_date IS NULL OR computed_end_date IS NULL
  LOOP
    PERFORM public.update_project_computed_dates(project_rec.id);
  END LOOP;
END;
$$;