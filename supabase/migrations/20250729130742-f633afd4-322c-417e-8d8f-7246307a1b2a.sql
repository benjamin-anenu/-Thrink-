-- Create a comprehensive security utility function for data encryption
CREATE OR REPLACE FUNCTION public.secure_encrypt_text(input_text TEXT)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE 
    WHEN input_text IS NULL OR input_text = '' THEN NULL
    ELSE encode(digest(input_text, 'sha256'), 'hex')
  END;
$$;

-- Create a function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type TEXT,
  event_description TEXT,
  user_id UUID DEFAULT auth.uid(),
  additional_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    metadata,
    ip_address,
    created_at
  ) VALUES (
    user_id,
    event_type,
    'security_event',
    jsonb_build_object(
      'description', event_description,
      'event_type', event_type,
      'additional_data', additional_metadata
    ),
    inet_client_addr(),
    NOW()
  );
END;
$$;

-- Create a function to validate session integrity
CREATE OR REPLACE FUNCTION public.validate_session_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if session is expired
  IF NEW.expires_at < NOW() THEN
    PERFORM public.log_security_event(
      'session_expired',
      'Session expired during validation',
      NEW.user_id
    );
    RAISE EXCEPTION 'Session has expired';
  END IF;
  
  -- Update last activity
  NEW.last_activity_at = NOW();
  
  RETURN NEW;
END;
$$;

-- Add trigger for session validation if user_sessions table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions' AND table_schema = 'public') THEN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS validate_session_trigger ON public.user_sessions;
    
    -- Create the trigger
    CREATE TRIGGER validate_session_trigger
      BEFORE UPDATE ON public.user_sessions
      FOR EACH ROW
      EXECUTE FUNCTION public.validate_session_integrity();
  END IF;
END $$;

-- Enable comprehensive audit logging for all security-sensitive operations
CREATE OR REPLACE FUNCTION public.audit_security_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log all changes to user_roles, profiles, workspace_members
  IF TG_TABLE_NAME IN ('user_roles', 'profiles', 'workspace_members') THEN
    PERFORM public.log_security_event(
      TG_OP || '_' || TG_TABLE_NAME,
      'Security-sensitive table modified: ' || TG_TABLE_NAME,
      COALESCE(NEW.user_id, OLD.user_id),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'old_data', CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
        'new_data', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add comprehensive audit triggers for security-sensitive tables
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN SELECT unnest(ARRAY['user_roles', 'profiles', 'workspace_members'])
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
      EXECUTE format('DROP TRIGGER IF EXISTS audit_security_trigger ON public.%I', table_name);
      EXECUTE format('CREATE TRIGGER audit_security_trigger 
                      AFTER INSERT OR UPDATE OR DELETE ON public.%I
                      FOR EACH ROW 
                      EXECUTE FUNCTION public.audit_security_changes()', table_name);
    END IF;
  END LOOP;
END $$;