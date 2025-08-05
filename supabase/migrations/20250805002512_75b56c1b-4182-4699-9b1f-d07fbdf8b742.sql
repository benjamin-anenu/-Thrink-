-- Fix the invalid task dates and recalculate everything
UPDATE project_tasks 
SET 
  start_date = '2025-09-04',
  end_date = '2025-10-11',  -- Fixed: end date should be after start date
  updated_at = NOW()
WHERE name = 'Review Google ratings' 
AND project_id = '1327ed03-c34a-406d-82ae-2cb7450afcf3';

-- Now recalculate all phase dates
SELECT public.update_phase_computed_dates('44645cb5-245b-4736-b479-ce4711b64b42'); -- Phase 1
SELECT public.update_phase_computed_dates('f17257cd-5b0c-486f-abc6-a70e9ad446e2'); -- Phase 2

-- Then recalculate project dates
SELECT public.update_project_computed_dates('1327ed03-c34a-406d-82ae-2cb7450afcf3');