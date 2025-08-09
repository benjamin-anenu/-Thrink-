-- Data backfill and policy updates for multi-tenant enterprises (retry with slug generation)

DO $$
DECLARE
    existing_user RECORD;
    new_enterprise_id UUID;
    base_name TEXT;
    gen_slug TEXT;
BEGIN
    -- For each existing user who doesn't have an enterprise yet
    FOR existing_user IN 
        SELECT DISTINCT ur.user_id, COALESCE(p.company_name, p.full_name, p.email) AS base_name
        FROM public.user_roles ur
        LEFT JOIN public.profiles p ON p.user_id = ur.user_id
        WHERE ur.enterprise_id IS NULL
    LOOP
        base_name := COALESCE(existing_user.base_name, 'Enterprise');
        -- Generate slug from base_name
        gen_slug := lower(regexp_replace(base_name, '[^a-zA-Z0-9]', '-', 'g'));
        gen_slug := regexp_replace(gen_slug, '-+', '-', 'g');
        gen_slug := trim(both '-' from gen_slug);
        IF gen_slug = '' THEN
          gen_slug := 'enterprise';
        END IF;
        -- Ensure uniqueness
        WHILE EXISTS (SELECT 1 FROM public.enterprises WHERE slug = gen_slug) LOOP
          gen_slug := gen_slug || '-' || floor(random() * 1000)::text;
        END LOOP;

        -- Create an enterprise for this user
        INSERT INTO public.enterprises (name, owner_id, slug)
        VALUES (
            base_name || '''s Enterprise',
            existing_user.user_id,
            gen_slug
        )
        RETURNING id INTO new_enterprise_id;
        
        -- Update their user role to include enterprise_id and set as enterprise owner (preserve existing owner flag if any)
        UPDATE public.user_roles 
        SET 
            enterprise_id = new_enterprise_id,
            is_enterprise_owner = COALESCE(is_enterprise_owner, false) OR (role = 'owner')
        WHERE user_id = existing_user.user_id
          AND enterprise_id IS NULL;
        
        -- Update any workspaces they own to belong to their enterprise
        UPDATE public.workspaces
        SET enterprise_id = new_enterprise_id
        WHERE owner_id = existing_user.user_id
          AND enterprise_id IS NULL;
    END LOOP;
END $$;

-- Ensure our SECURITY DEFINER functions have fixed search_path
CREATE OR REPLACE FUNCTION public.create_enterprise_with_owner(
  enterprise_name TEXT,
  enterprise_description TEXT DEFAULT NULL,
  enterprise_slug TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_enterprise_id UUID;
  generated_slug TEXT;
BEGIN
  -- Generate slug if not provided
  IF enterprise_slug IS NULL THEN
    generated_slug := lower(regexp_replace(enterprise_name, '[^a-zA-Z0-9]', '-', 'g'));
    generated_slug := regexp_replace(generated_slug, '-+', '-', 'g');
    generated_slug := trim(both '-' from generated_slug);
    IF generated_slug = '' THEN
      generated_slug := 'enterprise';
    END IF;
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.enterprises WHERE slug = generated_slug) LOOP
      generated_slug := generated_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  ELSE
    generated_slug := enterprise_slug;
  END IF;

  -- Create enterprise
  INSERT INTO public.enterprises (name, description, slug, owner_id)
  VALUES (enterprise_name, enterprise_description, generated_slug, auth.uid())
  RETURNING id INTO new_enterprise_id;

  -- Add owner to user_roles
  INSERT INTO public.user_roles (user_id, role, enterprise_id, is_enterprise_owner)
  VALUES (auth.uid(), 'owner', new_enterprise_id, true);

  RETURN new_enterprise_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_enterprise(user_id_param UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT enterprise_id FROM public.user_roles 
  WHERE user_id = user_id_param 
  ORDER BY is_enterprise_owner DESC, created_at ASC
  LIMIT 1;
$$;

-- Recreate workspace member and project/resource/stakeholder policies (idempotent)
DROP POLICY IF EXISTS "Users can view workspace members in their enterprise" ON public.workspace_members;
DROP POLICY IF EXISTS "Enterprise owners can manage workspace members in their enterprise" ON public.workspace_members;

CREATE POLICY "Users can view workspace members in their enterprise" 
ON public.workspace_members 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT w.id FROM public.workspaces w
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  )
);

CREATE POLICY "Enterprise owners can manage workspace members in their enterprise" 
ON public.workspace_members 
FOR ALL 
USING (
  workspace_id IN (
    SELECT w.id FROM public.workspaces w
    WHERE w.enterprise_id IN (
      SELECT id FROM public.enterprises 
      WHERE owner_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can view projects in their enterprise" ON public.projects;
DROP POLICY IF EXISTS "Users can manage projects in their enterprise" ON public.projects;

CREATE POLICY "Users can view projects in their enterprise" 
ON public.projects 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT w.id FROM public.workspaces w
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage projects in their enterprise" 
ON public.projects 
FOR ALL 
USING (
  workspace_id IN (
    SELECT w.id FROM public.workspaces w
    WHERE w.enterprise_id IN (
      SELECT enterprise_id FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can view resources in their enterprise" ON public.resources;
DROP POLICY IF EXISTS "Users can manage resources in their enterprise" ON public.resources;

CREATE POLICY "Users can view resources in their enterprise" 
ON public.resources 
FOR SELECT 
USING (
  workspace_id IN (
    SELECT w.id FROM public.workspaces w
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage resources in their enterprise" 
ON public.resources 
FOR ALL 
USING (
  workspace_id IN (
    SELECT w.id FROM public.workspaces w
    WHERE w.enterprise_id IN (
      SELECT enterprise_id FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Users can view stakeholders in their enterprise" ON public.stakeholders;
DROP POLICY IF EXISTS "Users can manage stakeholders in their enterprise" ON public.stakeholders;

CREATE POLICY "Users can view stakeholders in their enterprise" 
ON public.stakeholders 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage stakeholders in their enterprise" 
ON public.stakeholders 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE w.enterprise_id IN (
      SELECT enterprise_id FROM public.user_roles 
      WHERE user_id = auth.uid()
    )
  )
);
