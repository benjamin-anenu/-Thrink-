-- Update system owner status for the first user
UPDATE public.user_roles 
SET is_system_owner = true 
WHERE user_id = '3039b25d-2bc0-4101-89cf-aad209886dae';