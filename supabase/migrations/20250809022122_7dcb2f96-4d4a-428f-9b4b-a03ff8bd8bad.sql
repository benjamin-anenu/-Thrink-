-- Update hard_delete_project to remove all FK references before deleting
CREATE OR REPLACE FUNCTION public.hard_delete_project(
  p_project_id uuid,
  p_workspace_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  is_admin boolean;
  ref RECORD;
BEGIN
  -- Permission check
  SELECT public.is_workspace_admin(p_workspace_id, auth.uid()) INTO is_admin;
  IF NOT COALESCE(is_admin, false) THEN
    RAISE EXCEPTION 'Insufficient permissions to delete project in this workspace';
  END IF;

  -- Remove storage files linked to this project (if any)
  DELETE FROM storage.objects
  WHERE bucket_id = 'project-files'
    AND name IN (
      SELECT file_path FROM public.project_documents WHERE project_id = p_project_id
      UNION
      SELECT file_path FROM public.project_files WHERE project_id = p_project_id
    );

  -- Explicit project-scoped deletes (fast paths)
  DELETE FROM public.project_ai_data WHERE project_id = p_project_id;
  DELETE FROM public.project_budgets WHERE project_id = p_project_id;
  DELETE FROM public.project_documents WHERE project_id = p_project_id;
  DELETE FROM public.project_files WHERE project_id = p_project_id;
  DELETE FROM public.project_initiation_documents WHERE project_id = p_project_id;
  DELETE FROM public.project_kickoff_data WHERE project_id = p_project_id;
  DELETE FROM public.project_requirements WHERE project_id = p_project_id;
  DELETE FROM public.project_team_members WHERE project_id = p_project_id;
  DELETE FROM public.project_escalation_matrix WHERE project_id = p_project_id;
  DELETE FROM public.critical_path_analysis WHERE project_id = p_project_id;
  DELETE FROM public.project_issues WHERE project_id = p_project_id;
  DELETE FROM public.document_folders WHERE project_id = p_project_id;
  DELETE FROM public.calendar_events WHERE project_id = p_project_id AND workspace_id = p_workspace_id;
  DELETE FROM public.stakeholders WHERE project_id = p_project_id;
  DELETE FROM public.reports WHERE project_id = p_project_id;
  DELETE FROM public.project_tasks WHERE project_id = p_project_id;
  DELETE FROM public.milestones WHERE project_id = p_project_id;
  DELETE FROM public.phases WHERE project_id = p_project_id;

  -- Defensive: remove any remaining FK references dynamically (e.g., rebaseline_requests_enhanced)
  FOR ref IN
    SELECT tc.table_schema, tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND ccu.table_schema = 'public'
      AND ccu.table_name = 'projects'
      AND ccu.column_name = 'id'
  LOOP
    EXECUTE format('DELETE FROM %I.%I WHERE %I = $1', ref.table_schema, ref.table_name, ref.column_name)
    USING p_project_id;
  END LOOP;

  -- Finally delete the project row
  DELETE FROM public.projects 
  WHERE id = p_project_id 
    AND workspace_id = p_workspace_id;

  -- Return whether the project is gone
  RETURN NOT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.hard_delete_project(uuid, uuid) TO authenticated;