-- Fix immediate critical issues and populate existing data

-- First, let's create enterprises for existing users and populate the data
DO $$
DECLARE
    existing_user RECORD;
    new_enterprise_id UUID;
BEGIN
    -- For each existing user who doesn't have an enterprise yet
    FOR existing_user IN 
        SELECT DISTINCT ur.user_id, p.full_name, p.email
        FROM user_roles ur
        LEFT JOIN profiles p ON p.user_id = ur.user_id
        WHERE ur.enterprise_id IS NULL
    LOOP
        -- Create an enterprise for this user
        INSERT INTO public.enterprises (name, owner_id)
        VALUES (
            COALESCE(existing_user.full_name || '''s Enterprise', existing_user.email || '''s Enterprise', 'Enterprise'),
            existing_user.user_id
        )
        RETURNING id INTO new_enterprise_id;
        
        -- Update their user role to include enterprise_id and set as enterprise owner
        UPDATE public.user_roles 
        SET 
            enterprise_id = new_enterprise_id,
            is_enterprise_owner = true
        WHERE user_id = existing_user.user_id;
        
        -- Update any workspaces they own to belong to their enterprise
        UPDATE public.workspaces
        SET enterprise_id = new_enterprise_id
        WHERE owner_id = existing_user.user_id;
    END LOOP;
END $$;

-- Remove the old is_system_owner column from user_roles
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS is_system_owner;

-- Update workspace member policies to work with enterprise isolation
DROP POLICY IF EXISTS "Users can manage workspace members in their workspace" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members in their workspace" ON public.workspace_members;

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

-- Update project policies for enterprise isolation
DROP POLICY IF EXISTS "Users can view projects in their workspace" ON public.projects;
DROP POLICY IF EXISTS "Users can manage projects in their workspace" ON public.projects;

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

-- Update resources policies for enterprise isolation  
DROP POLICY IF EXISTS "Users can view resources in their workspace" ON public.resources;
DROP POLICY IF EXISTS "Users can manage resources in their workspace" ON public.resources;

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

-- Update stakeholders policies for enterprise isolation
DROP POLICY IF EXISTS "Users can view stakeholders in their workspace" ON public.stakeholders;
DROP POLICY IF EXISTS "Users can manage stakeholders in their workspace" ON public.stakeholders;

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

-- Update the create_workspace_with_owner function to include enterprise_id
CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(
  workspace_name text,
  workspace_description text DEFAULT NULL,
  workspace_slug text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_workspace_id UUID;
  generated_slug TEXT;
  user_enterprise_id UUID;
BEGIN
  -- Get user's enterprise
  SELECT enterprise_id INTO user_enterprise_id
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  
  IF user_enterprise_id IS NULL THEN
    RAISE EXCEPTION 'User must belong to an enterprise to create workspaces';
  END IF;

  -- Generate slug if not provided
  IF workspace_slug IS NULL THEN
    generated_slug := lower(regexp_replace(workspace_name, '[^a-zA-Z0-9]', '-', 'g'));
    generated_slug := regexp_replace(generated_slug, '-+', '-', 'g');
    generated_slug := trim(both '-' from generated_slug);
    
    -- Ensure uniqueness within enterprise
    WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = generated_slug AND enterprise_id = user_enterprise_id) LOOP
      generated_slug := generated_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  ELSE
    generated_slug := workspace_slug;
  END IF;

  -- Create workspace
  INSERT INTO public.workspaces (name, description, slug, owner_id, enterprise_id)
  VALUES (workspace_name, workspace_description, generated_slug, auth.uid(), user_enterprise_id)
  RETURNING id INTO new_workspace_id;

  -- Add creator as workspace member
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (new_workspace_id, auth.uid(), 'owner', 'active');

  -- Log the creation
  INSERT INTO public.compliance_logs (
    workspace_id, user_id, event_type, event_category, description
  ) VALUES (
    new_workspace_id, auth.uid(), 'workspace_created', 'user_management',
    'Workspace created: ' || workspace_name || ' in enterprise: ' || user_enterprise_id
  );

  RETURN new_workspace_id;
END;
$$;