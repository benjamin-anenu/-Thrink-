
-- Ensure invitations have a unique, auto-generated token and useful timestamps/indexes
ALTER TABLE public.workspace_invitations
  ADD COLUMN IF NOT EXISTS invitation_token uuid DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS email_sent_at timestamptz NULL;

-- Ensure tokens are indexed/unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_workspace_invitations_token_unique
  ON public.workspace_invitations(invitation_token);

-- Helpful index for listing/filtering
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace_status
  ON public.workspace_invitations(workspace_id, status);

-- Backfill missing tokens for older pending invites (safe if some already have tokens)
UPDATE public.workspace_invitations
SET invitation_token = gen_random_uuid()
WHERE invitation_token IS NULL;
