-- Phase 4: Database Function Security Fixes
-- Add SET search_path = '' to all database functions to prevent search path attacks

-- Update existing functions with proper search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'manager' THEN 3
      WHEN 'member' THEN 4
      WHEN 'viewer' THEN 5
    END
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_id_param
      AND user_id = user_id_param
      AND status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(workspace_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_id_param
      AND user_id = user_id_param
      AND role IN ('owner', 'admin')
      AND status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  -- Log the registration
  INSERT INTO public.audit_logs (user_id, action, metadata)
  VALUES (NEW.id, 'user_registered', jsonb_build_object('email', NEW.email));
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_user_role app_role;
  target_user_role app_role;
BEGIN
  -- Get current user's highest role
  SELECT role INTO current_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'manager' THEN 3
      WHEN 'member' THEN 4
      WHEN 'viewer' THEN 5
    END
  LIMIT 1;

  -- Check if user is trying to modify their own role
  IF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot modify their own roles';
  END IF;

  -- Check if user is trying to assign a role higher than their own
  IF current_user_role IS NOT NULL THEN
    CASE 
      WHEN current_user_role = 'viewer' OR current_user_role = 'member' THEN
        RAISE EXCEPTION 'Insufficient permissions to manage roles';
      WHEN current_user_role = 'manager' AND NEW.role IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Cannot assign roles higher than manager';
      WHEN current_user_role = 'admin' AND NEW.role = 'owner' THEN
        RAISE EXCEPTION 'Cannot assign owner role';
    END CASE;
  END IF;

  RETURN NEW;
END;
$function$;