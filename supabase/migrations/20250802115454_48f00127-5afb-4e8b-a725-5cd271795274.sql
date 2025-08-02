
-- Add is_system_owner column to user_roles table
ALTER TABLE public.user_roles ADD COLUMN is_system_owner boolean DEFAULT false;

-- Update the handle_new_user function to detect first user and assign owner role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  user_count integer;
BEGIN
  -- Insert profile first
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- Check if this is the first user in the system
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  IF user_count = 0 THEN
    -- First user becomes system owner
    INSERT INTO public.user_roles (user_id, role, is_system_owner)
    VALUES (NEW.id, 'owner', true);
  ELSE
    -- Subsequent users get member role
    INSERT INTO public.user_roles (user_id, role, is_system_owner)
    VALUES (NEW.id, 'member', false);
  END IF;
  
  -- Log the registration
  INSERT INTO public.audit_logs (user_id, action, metadata)
  VALUES (NEW.id, 'user_registered', jsonb_build_object('email', NEW.email, 'is_first_user', (user_count = 0)));
  
  RETURN NEW;
END;
$$;

-- Update create_workspace_with_owner function to handle system owner privileges
CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(workspace_name text, workspace_description text DEFAULT NULL::text, workspace_slug text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_workspace_id UUID;
  generated_slug TEXT;
  user_is_system_owner BOOLEAN;
BEGIN
  -- Check if current user is system owner
  SELECT is_system_owner INTO user_is_system_owner
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
  
  -- Generate slug if not provided
  IF workspace_slug IS NULL THEN
    generated_slug := lower(regexp_replace(workspace_name, '[^a-zA-Z0-9]', '-', 'g'));
    generated_slug := regexp_replace(generated_slug, '-+', '-', 'g');
    generated_slug := trim(both '-' from generated_slug);
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = generated_slug) LOOP
      generated_slug := generated_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  ELSE
    generated_slug := workspace_slug;
  END IF;

  -- Create workspace
  INSERT INTO public.workspaces (name, description, slug, owner_id)
  VALUES (workspace_name, workspace_description, generated_slug, auth.uid())
  RETURNING id INTO new_workspace_id;

  -- Add creator as workspace member with appropriate role
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (
    new_workspace_id, 
    auth.uid(), 
    CASE 
      WHEN user_is_system_owner THEN 'owner'
      ELSE 'owner' -- Workspace creators are always owners of their workspace
    END,
    'active'
  );

  -- Log the creation
  INSERT INTO public.compliance_logs (
    workspace_id, user_id, event_type, event_category, description
  ) VALUES (
    new_workspace_id, auth.uid(), 'workspace_created', 'user_management',
    'Workspace created: ' || workspace_name || ' (System owner: ' || COALESCE(user_is_system_owner::text, 'false') || ')'
  );

  RETURN new_workspace_id;
END;
$$;

-- Function to check if user is system owner
CREATE OR REPLACE FUNCTION public.is_system_owner(user_id_param uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_system_owner FROM public.user_roles WHERE user_id = user_id_param LIMIT 1),
    false
  );
$$;
