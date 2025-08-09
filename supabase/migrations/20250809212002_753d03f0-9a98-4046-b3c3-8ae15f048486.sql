-- Fix Benjamin's enterprise owner recognition issue
-- Step 1: Remove conflicting member role for Benjamin (keeping only the owner role)
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'benjamin.o.anenu@gmail.com'
) 
AND role = 'member'
AND is_enterprise_owner = false;

-- Step 2: Clean up any other users with duplicate roles per enterprise
-- Remove duplicate roles keeping the highest priority role (owner > admin > manager > member > viewer)
WITH ranked_roles AS (
  SELECT 
    id,
    user_id,
    enterprise_id,
    role,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, enterprise_id 
      ORDER BY 
        CASE role::text
          WHEN 'owner' THEN 1
          WHEN 'admin' THEN 2
          WHEN 'manager' THEN 3
          WHEN 'member' THEN 4
          WHEN 'viewer' THEN 5
        END,
        created_at DESC
    ) as rank
  FROM public.user_roles
),
duplicates_to_delete AS (
  SELECT id FROM ranked_roles WHERE rank > 1
)
DELETE FROM public.user_roles WHERE id IN (SELECT id FROM duplicates_to_delete);

-- Step 3: Add unique constraint to prevent future duplicates
ALTER TABLE public.user_roles 
ADD CONSTRAINT unique_user_enterprise_role 
UNIQUE (user_id, enterprise_id);