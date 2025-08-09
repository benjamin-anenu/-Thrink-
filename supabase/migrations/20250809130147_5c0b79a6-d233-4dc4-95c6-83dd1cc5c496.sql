-- Add missing columns and trigger to workspace_invitations for invite flow
DO $$ BEGIN
  -- Ensure table exists before altering
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'workspace_invitations'
  ) THEN
    -- If table doesn't exist, create minimal structure compatible with edge function
    CREATE TABLE public.workspace_invitations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      workspace_id UUID NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('owner','admin','member','viewer')),
      invited_by UUID NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NULL,
      email_sent_at TIMESTAMPTZ NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Basic RLS: members of the workspace can see invites; only admins can insert/update
    ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Workspace members can view invitations"
    ON public.workspace_invitations
    FOR SELECT
    USING (
      workspace_id IN (
        SELECT wm.workspace_id FROM public.workspace_members wm
        WHERE wm.user_id = auth.uid() AND wm.status = 'active'
      )
    );

    CREATE POLICY "Workspace admins can manage invitations"
    ON public.workspace_invitations
    FOR ALL
    USING (
      public.is_workspace_admin(workspace_id, auth.uid())
    )
    WITH CHECK (
      public.is_workspace_admin(workspace_id, auth.uid())
    );
  END IF;
END $$;

-- Add columns if they are missing
ALTER TABLE public.workspace_invitations
  ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Create/update trigger to maintain updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_workspace_inv_updated_at'
  ) THEN
    CREATE TRIGGER trg_workspace_inv_updated_at
    BEFORE UPDATE ON public.workspace_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;