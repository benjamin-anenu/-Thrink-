-- Create workspace_invitations table with RLS and indexes
-- Note: Avoid FK to auth.users; store invited_by as UUID only

-- Create enum for invitation status if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'invitation_status'
  ) THEN
    CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');
  END IF;
END $$;

-- Create table
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.app_role NOT NULL DEFAULT 'member',
  invited_by uuid NULL,
  invitation_token uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status public.invitation_status NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  email_sent_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace ON public.workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON public.workspace_invitations (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS uidx_workspace_invite_pending_unique 
  ON public.workspace_invitations(workspace_id, lower(email)) 
  WHERE status = 'pending';

-- Enable Row Level Security
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'workspace_invitations' 
      AND policyname = 'Workspace admins can manage invitations'
  ) THEN
    DROP POLICY "Workspace admins can manage invitations" ON public.workspace_invitations;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'workspace_invitations' 
      AND policyname = 'Invitee can view their invitations'
  ) THEN
    DROP POLICY "Invitee can view their invitations" ON public.workspace_invitations;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'workspace_invitations' 
      AND policyname = 'Workspace admins can view invitations'
  ) THEN
    DROP POLICY "Workspace admins can view invitations" ON public.workspace_invitations;
  END IF;
END $$;

-- Admins (owner/admin) can fully manage invitations in their workspace
CREATE POLICY "Workspace admins can manage invitations" 
ON public.workspace_invitations
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
  workspace_id IN (
    SELECT wm.workspace_id 
    FROM public.workspace_members wm
    WHERE wm.user_id = auth.uid()
      AND wm.status = 'active'
      AND wm.role IN ('owner','admin')
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT wm.workspace_id 
    FROM public.workspace_members wm
    WHERE wm.user_id = auth.uid()
      AND wm.status = 'active'
      AND wm.role IN ('owner','admin')
  )
);

-- Invitee can view their invitations by matching their profile email
CREATE POLICY "Invitee can view their invitations" 
ON public.workspace_invitations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  lower(email) = (
    SELECT lower(p.email) FROM public.profiles p WHERE p.user_id = auth.uid()
  )
);

-- Explicit SELECT policy for admins (optional clarity)
CREATE POLICY "Workspace admins can view invitations" 
ON public.workspace_invitations
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT wm.workspace_id 
    FROM public.workspace_members wm
    WHERE wm.user_id = auth.uid()
      AND wm.status = 'active'
      AND wm.role IN ('owner','admin')
  )
);

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_workspace_inv_updated_at'
  ) THEN
    CREATE TRIGGER trg_workspace_inv_updated_at
    BEFORE UPDATE ON public.workspace_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
