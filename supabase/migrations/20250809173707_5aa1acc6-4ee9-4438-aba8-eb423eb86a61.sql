-- Create enterprises table for proper multi-tenancy
CREATE TABLE public.enterprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on enterprises
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;

-- Add enterprise_id to user_roles and remove global is_system_owner concept
ALTER TABLE public.user_roles 
ADD COLUMN enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE CASCADE,
ADD COLUMN is_enterprise_owner BOOLEAN DEFAULT false;

-- Add enterprise_id to workspaces for proper isolation
ALTER TABLE public.workspaces 
ADD COLUMN enterprise_id UUID REFERENCES public.enterprises(id) ON DELETE CASCADE;

-- Create enterprise RLS policies
CREATE POLICY "Users can view their own enterprise" 
ON public.enterprises 
FOR SELECT 
USING (owner_id = auth.uid() OR id IN (
  SELECT enterprise_id FROM public.user_roles 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update their owned enterprise" 
ON public.enterprises 
FOR UPDATE 
USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create enterprises" 
ON public.enterprises 
FOR INSERT 
WITH CHECK (owner_id = auth.uid());

-- Update user_roles RLS policies for enterprise isolation
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "System owners can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view roles in their enterprise" 
ON public.user_roles 
FOR SELECT 
USING (
  enterprise_id IN (
    SELECT id FROM public.enterprises 
    WHERE owner_id = auth.uid()
  ) OR user_id = auth.uid()
);

CREATE POLICY "Enterprise owners can manage roles in their enterprise" 
ON public.user_roles 
FOR ALL 
USING (
  enterprise_id IN (
    SELECT id FROM public.enterprises 
    WHERE owner_id = auth.uid()
  )
);

-- Update workspaces RLS policies for enterprise isolation
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
DROP POLICY IF EXISTS "Users can manage workspaces they own" ON public.workspaces;

CREATE POLICY "Users can view workspaces in their enterprise" 
ON public.workspaces 
FOR SELECT 
USING (
  enterprise_id IN (
    SELECT enterprise_id FROM public.user_roles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Enterprise owners can manage workspaces in their enterprise" 
ON public.workspaces 
FOR ALL 
USING (
  enterprise_id IN (
    SELECT id FROM public.enterprises 
    WHERE owner_id = auth.uid()
  )
);

-- Create function to create enterprise with owner
CREATE OR REPLACE FUNCTION public.create_enterprise_with_owner(
  enterprise_name TEXT,
  enterprise_description TEXT DEFAULT NULL,
  enterprise_slug TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_enterprise_id UUID;
  generated_slug TEXT;
BEGIN
  -- Generate slug if not provided
  IF enterprise_slug IS NULL THEN
    generated_slug := lower(regexp_replace(enterprise_name, '[^a-zA-Z0-9]', '-', 'g'));
    generated_slug := regexp_replace(generated_slug, '-+', '-', 'g');
    generated_slug := trim(both '-' from generated_slug);
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.enterprises WHERE slug = generated_slug) LOOP
      generated_slug := generated_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  ELSE
    generated_slug := enterprise_slug;
  END IF;

  -- Create enterprise
  INSERT INTO public.enterprises (name, description, slug, owner_id)
  VALUES (enterprise_name, enterprise_description, generated_slug, auth.uid())
  RETURNING id INTO new_enterprise_id;

  -- Add owner to user_roles
  INSERT INTO public.user_roles (user_id, role, enterprise_id, is_enterprise_owner)
  VALUES (auth.uid(), 'owner', new_enterprise_id, true);

  RETURN new_enterprise_id;
END;
$$;

-- Update handle_new_user function for proper enterprise creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  new_enterprise_id UUID;
  enterprise_name TEXT;
BEGIN
  -- Insert profile first
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- Create enterprise for the new user
  enterprise_name := COALESCE(
    NEW.raw_user_meta_data ->> 'company_name',
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '') || '''s Enterprise'
  );
  
  INSERT INTO public.enterprises (name, owner_id)
  VALUES (enterprise_name, NEW.id)
  RETURNING id INTO new_enterprise_id;
  
  -- Add user as enterprise owner
  INSERT INTO public.user_roles (user_id, role, enterprise_id, is_enterprise_owner)
  VALUES (NEW.id, 'owner', new_enterprise_id, true);
  
  -- Log the registration
  INSERT INTO public.audit_logs (user_id, action, metadata)
  VALUES (NEW.id, 'user_registered', jsonb_build_object(
    'email', NEW.email, 
    'enterprise_id', new_enterprise_id,
    'enterprise_name', enterprise_name
  ));
  
  RETURN NEW;
END;
$$;

-- Update existing functions to work with enterprises
CREATE OR REPLACE FUNCTION public.is_system_owner(user_id_param UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT is_enterprise_owner FROM public.user_roles WHERE user_id = user_id_param AND is_enterprise_owner = true LIMIT 1),
    false
  );
$$;

-- Create function to get user's enterprise
CREATE OR REPLACE FUNCTION public.get_user_enterprise(user_id_param UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT enterprise_id FROM public.user_roles 
  WHERE user_id = user_id_param 
  ORDER BY is_enterprise_owner DESC, created_at ASC
  LIMIT 1;
$$;