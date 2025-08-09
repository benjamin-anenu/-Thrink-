-- Secure RPC to permanently hard-delete a project and all related data
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
BEGIN
  -- Ensure the caller has admin rights in the workspace
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

  -- Delete related records (project-scoped)
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

  -- Ordered deletions
  DELETE FROM public.project_tasks WHERE project_id = p_project_id;
  DELETE FROM public.milestones WHERE project_id = p_project_id;
  DELETE FROM public.phases WHERE project_id = p_project_id;

  -- Finally delete the project row
  DELETE FROM public.projects 
  WHERE id = p_project_id 
    AND workspace_id = p_workspace_id;

  -- Return whether the project is gone
  RETURN NOT EXISTS (SELECT 1 FROM public.projects WHERE id = p_project_id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.hard_delete_project(uuid, uuid) TO authenticated;

-- Secure RPC to update workspace settings (prevents RLS issues)
CREATE OR REPLACE FUNCTION public.update_workspace_settings(
  p_workspace_id uuid,
  p_name text,
  p_description text,
  p_settings jsonb
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  is_admin boolean;
BEGIN
  SELECT public.is_workspace_admin(p_workspace_id, auth.uid()) INTO is_admin;
  IF NOT COALESCE(is_admin, false) THEN
    RAISE EXCEPTION 'Insufficient permissions to update this workspace';
  END IF;

  UPDATE public.workspaces
  SET 
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    settings = COALESCE(p_settings, settings),
    updated_at = now()
  WHERE id = p_workspace_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_workspace_settings(uuid, text, text, jsonb) TO authenticated;