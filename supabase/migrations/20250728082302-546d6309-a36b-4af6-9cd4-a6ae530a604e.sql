-- Create app_role enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'manager', 'member', 'viewer');
    END IF;
END $$;

-- Now update functions with proper search_path and correct typing
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  current_user_role text;
  target_user_role text;
BEGIN
  -- Get current user's highest role
  SELECT role::text INTO current_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role::text
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
      WHEN current_user_role = 'manager' AND NEW.role::text IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Cannot assign roles higher than manager';
      WHEN current_user_role = 'admin' AND NEW.role::text = 'owner' THEN
        RAISE EXCEPTION 'Cannot assign owner role';
    END CASE;
  END IF;

  RETURN NEW;
END;
$function$;