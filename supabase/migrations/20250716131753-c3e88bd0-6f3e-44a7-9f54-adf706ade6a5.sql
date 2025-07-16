-- Create a default workspace for users who don't have one yet
-- This will help with the transition from hardcoded workspace IDs to real database workspaces

-- First, let's ensure we have a proper workspace for testing
INSERT INTO public.workspaces (name, description, slug, owner_id, settings)
SELECT 
  'Personal Workspace',
  'Your personal project management space',
  'personal-workspace',
  auth.uid(),
  '{"allowGuestAccess": false, "defaultProjectVisibility": "private", "notificationSettings": {"emailNotifications": true, "projectUpdates": true, "taskAssignments": true, "deadlineReminders": true}}'::jsonb
WHERE auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.workspaces WHERE owner_id = auth.uid()
  );

-- Add the user as a member of their workspace
INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
SELECT 
  w.id,
  auth.uid(),
  'owner',
  'active'
FROM public.workspaces w
WHERE w.owner_id = auth.uid()
  AND auth.uid() IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = w.id AND user_id = auth.uid()
  );