-- Create table to track temporary workspace access assumptions
CREATE TABLE IF NOT EXISTS public.assumed_workspace_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, workspace_id)
);

-- Enable RLS
ALTER TABLE public.assumed_workspace_access ENABLE ROW LEVEL SECURITY;

-- Policies: users manage their own assumed access; system owners manage all
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assumed_workspace_access' AND policyname = 'Users manage their own assumed access'
  ) THEN
    CREATE POLICY "Users manage their own assumed access"
    ON public.assumed_workspace_access
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'assumed_workspace_access' AND policyname = 'System owners can manage all assumed access'
  ) THEN
    CREATE POLICY "System owners can manage all assumed access"
    ON public.assumed_workspace_access
    FOR ALL
    USING (is_system_owner(auth.uid()))
    WITH CHECK (is_system_owner(auth.uid()));
  END IF;
END $$;

-- Helpful index
CREATE INDEX IF NOT EXISTS idx_assumed_access_user_ws ON public.assumed_workspace_access (user_id, workspace_id);
CREATE INDEX IF NOT EXISTS idx_assumed_access_expires ON public.assumed_workspace_access (expires_at);

-- Function to assume access without ambiguous references
CREATE OR REPLACE FUNCTION public.assume_workspace_access(
  _workspace_id uuid,
  _ttl_minutes integer DEFAULT 240,
  _role text DEFAULT 'admin'
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ws_exists boolean;
BEGIN
  -- Validate workspace exists
  SELECT EXISTS (SELECT 1 FROM public.workspaces w WHERE w.id = _workspace_id) INTO ws_exists;
  IF NOT ws_exists THEN
    RAISE EXCEPTION 'Workspace % not found', _workspace_id;
  END IF;

  -- Clean up expired rows for this user
  DELETE FROM public.assumed_workspace_access
  WHERE user_id = auth.uid() AND expires_at < now();

  -- Upsert current assumption
  DELETE FROM public.assumed_workspace_access
  WHERE user_id = auth.uid() AND workspace_id = _workspace_id;

  INSERT INTO public.assumed_workspace_access (user_id, workspace_id, role, expires_at)
  VALUES (auth.uid(), _workspace_id, COALESCE(_role, 'admin'), now() + make_interval(mins => COALESCE(_ttl_minutes, 240)));

  RETURN true;
END;
$$;

-- Function to clear assumed access
CREATE OR REPLACE FUNCTION public.clear_workspace_access(
  _workspace_id uuid
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.assumed_workspace_access
  WHERE user_id = auth.uid() AND workspace_id = _workspace_id;
  RETURN true;
END;
$$;
