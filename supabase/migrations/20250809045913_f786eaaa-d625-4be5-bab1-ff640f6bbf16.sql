-- Promote the specified user to system owner and ensure they have the owner role
-- User: 62548a11-427c-4ba3-b573-5764160b1cd4

-- 1) Set is_system_owner=true for all of the user's role records
UPDATE public.user_roles
SET is_system_owner = true
WHERE user_id = '62548a11-427c-4ba3-b573-5764160b1cd4';

-- 2) Ensure an 'owner' role exists for this user
INSERT INTO public.user_roles (user_id, role, is_system_owner)
SELECT '62548a11-427c-4ba3-b573-5764160b1cd4', 'owner', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '62548a11-427c-4ba3-b573-5764160b1cd4' AND role = 'owner'
);

-- 3) Optional: demote duplicate lower roles to avoid ambiguity (keep but mark non-owner as not system owner)
UPDATE public.user_roles
SET is_system_owner = true
WHERE user_id = '62548a11-427c-4ba3-b573-5764160b1cd4' AND role = 'owner';

-- 4) Log the promotion
INSERT INTO public.audit_logs (user_id, action, resource_type, metadata)
VALUES (
  '62548a11-427c-4ba3-b573-5764160b1cd4',
  'promote_to_system_owner',
  'user_roles',
  jsonb_build_object('by', 'lovable-assistant', 'timestamp', now())
);
