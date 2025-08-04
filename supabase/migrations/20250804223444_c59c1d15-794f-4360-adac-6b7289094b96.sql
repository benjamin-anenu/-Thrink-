-- Trigger the progress calculation for the existing phase
UPDATE phases 
SET progress = (
  SELECT ROUND(
    (COUNT(CASE WHEN pt.status = 'Completed' THEN 1 END) * 100.0 + 
     SUM(CASE WHEN pt.status != 'Completed' THEN COALESCE(pt.progress, 0) ELSE 0 END)) / COUNT(*)
  )
  FROM project_tasks pt
  JOIN milestones m ON pt.milestone_id = m.id
  WHERE m.phase_id = phases.id
), 
updated_at = NOW()
WHERE project_id = '1327ed03-c34a-406d-82ae-2cb7450afcf3';