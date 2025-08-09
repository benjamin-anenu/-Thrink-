-- Ensure separate enterprise owners for Benjamin and Robor, and harden remaining RLS

DO $$
DECLARE
  v_ben_user uuid;
  v_robor_user uuid;
  v_ben_ent uuid;
  v_robor_ent uuid;
  v_slug text;
BEGIN
  -- Look up users by email (case-insensitive)
  SELECT user_id INTO v_ben_user FROM public.profiles WHERE lower(email) = lower('benjamin.o.anenu@gmail.com');
  SELECT user_id INTO v_robor_user FROM public.profiles WHERE lower(email) = lower('robor.eminokanju@gmail.com');

  IF v_ben_user IS NULL THEN RAISE EXCEPTION 'Benjamin user not found'; END IF;
  IF v_robor_user IS NULL THEN RAISE EXCEPTION 'Robor user not found'; END IF;

  -- Ensure Benjamin has an enterprise (owned by him)
  SELECT id INTO v_ben_ent FROM public.enterprises WHERE owner_id = v_ben_user LIMIT 1;
  IF v_ben_ent IS NULL THEN
    v_slug := lower(regexp_replace('benjamin-enterprise', '[^a-zA-Z0-9]', '-', 'g'));
    WHILE EXISTS (SELECT 1 FROM public.enterprises WHERE slug = v_slug) LOOP
      v_slug := v_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
    INSERT INTO public.enterprises (name, description, slug, owner_id)
    VALUES ('Benjamin Enterprise', NULL, v_slug, v_ben_user) RETURNING id INTO v_ben_ent;
  END IF;

  -- Ensure Robor has an enterprise (owned by him)
  SELECT id INTO v_robor_ent FROM public.enterprises WHERE owner_id = v_robor_user LIMIT 1;
  IF v_robor_ent IS NULL THEN
    v_slug := lower(regexp_replace('robor-enterprise', '[^a-zA-Z0-9]', '-', 'g'));
    WHILE EXISTS (SELECT 1 FROM public.enterprises WHERE slug = v_slug) LOOP
      v_slug := v_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
    INSERT INTO public.enterprises (name, description, slug, owner_id)
    VALUES ('Robor Enterprise', NULL, v_slug, v_robor_user) RETURNING id INTO v_robor_ent;
  END IF;

  -- Ensure user_roles reflect ownership in their own enterprise
  -- Benjamin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = v_ben_user AND enterprise_id = v_ben_ent AND role = 'owner'
  ) THEN
    INSERT INTO public.user_roles (user_id, role, enterprise_id, is_enterprise_owner)
    VALUES (v_ben_user, 'owner', v_ben_ent, true);
  ELSE
    UPDATE public.user_roles SET is_enterprise_owner = true, role = 'owner'
    WHERE user_id = v_ben_user AND enterprise_id = v_ben_ent;
  END IF;

  -- Robor
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = v_robor_user AND enterprise_id = v_robor_ent AND role = 'owner'
  ) THEN
    INSERT INTO public.user_roles (user_id, role, enterprise_id, is_enterprise_owner)
    VALUES (v_robor_user, 'owner', v_robor_ent, true);
  ELSE
    UPDATE public.user_roles SET is_enterprise_owner = true, role = 'owner'
    WHERE user_id = v_robor_user AND enterprise_id = v_robor_ent;
  END IF;

  -- Re-assign all workspaces owned by each user to their own enterprise to ensure isolation
  UPDATE public.workspaces SET enterprise_id = v_ben_ent WHERE owner_id = v_ben_user AND enterprise_id IS DISTINCT FROM v_ben_ent;
  UPDATE public.workspaces SET enterprise_id = v_robor_ent WHERE owner_id = v_robor_user AND enterprise_id IS DISTINCT FROM v_robor_ent;
END $$;

-- Enable RLS and add policies for remaining uncovered tables
-- change_control_board: no direct enterprise linkage; safest default is enterprise-owner-only visibility
ALTER TABLE public.change_control_board ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enterprise owners can view all change control board" ON public.change_control_board;
CREATE POLICY "Enterprise owners can view all change control board"
ON public.change_control_board
FOR SELECT
USING (public.is_system_owner(auth.uid()));

-- reports: scope via project->workspace->enterprise
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view reports in their enterprise" ON public.reports;
DROP POLICY IF EXISTS "Users can manage reports in their enterprise" ON public.reports;
CREATE POLICY "Users can view reports in their enterprise"
ON public.reports
FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  )
);
CREATE POLICY "Users can manage reports in their enterprise"
ON public.reports
FOR ALL
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE w.enterprise_id IN (
      SELECT enterprise_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  )
);
