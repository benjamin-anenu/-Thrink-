-- Fix data inconsistency for the Kickoff task
UPDATE project_tasks 
SET start_date = '2025-07-01', end_date = '2025-08-15'
WHERE name = 'Kickoff' AND start_date > end_date;

-- Add trigger to recalculate phase progress when tasks are updated
CREATE OR REPLACE FUNCTION recalculate_phase_progress()
RETURNS TRIGGER AS $$
DECLARE
    phase_record RECORD;
    total_tasks INTEGER;
    completed_tasks INTEGER;
    avg_progress NUMERIC;
    final_progress INTEGER;
BEGIN
    -- Get all phases that contain tasks from affected milestones
    FOR phase_record IN 
        SELECT DISTINCT p.id as phase_id
        FROM phases p
        JOIN milestones m ON m.phase_id = p.id
        WHERE NEW.milestone_id = m.id OR OLD.milestone_id = m.id
    LOOP
        -- Calculate progress for this phase
        SELECT 
            COUNT(*) as task_count,
            COUNT(CASE WHEN pt.status = 'Completed' THEN 1 END) as completed_count,
            AVG(COALESCE(pt.progress, 0)) as avg_prog
        INTO total_tasks, completed_tasks, avg_progress
        FROM project_tasks pt
        JOIN milestones m ON pt.milestone_id = m.id
        WHERE m.phase_id = phase_record.phase_id;
        
        -- Calculate final progress (weight completed tasks as 100%)
        IF total_tasks > 0 THEN
            final_progress := ROUND(
                ((completed_tasks * 100.0) + ((total_tasks - completed_tasks) * COALESCE(avg_progress, 0))) / total_tasks
            );
        ELSE
            final_progress := 0;
        END IF;
        
        -- Update phase progress
        UPDATE phases 
        SET 
            progress = final_progress,
            updated_at = NOW()
        WHERE id = phase_record.phase_id;
        
    END LOOP;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task updates
DROP TRIGGER IF EXISTS trigger_recalculate_phase_progress ON project_tasks;
CREATE TRIGGER trigger_recalculate_phase_progress
    AFTER INSERT OR UPDATE OR DELETE ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION recalculate_phase_progress();