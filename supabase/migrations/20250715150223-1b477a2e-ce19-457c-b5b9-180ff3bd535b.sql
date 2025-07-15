-- Create workspaces table for multi-tenant architecture
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL,
  settings JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  max_members INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace members table
CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive', 'suspended')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, user_id)
);

-- Create workspace invitations table
CREATE TABLE public.workspace_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID NOT NULL,
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, email)
);

-- Create user sessions table for activity monitoring
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id),
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  login_method TEXT DEFAULT 'email' CHECK (login_method IN ('email', 'sso', 'oauth')),
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Create compliance logs table
CREATE TABLE public.compliance_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.workspaces(id),
  user_id UUID,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL CHECK (event_category IN ('data_access', 'data_modification', 'user_management', 'security', 'compliance')),
  resource_type TEXT,
  resource_id UUID,
  description TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  retention_period INTEGER DEFAULT 2555, -- 7 years in days for compliance
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data processing activities table for GDPR compliance
CREATE TABLE public.data_processing_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id),
  activity_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  data_categories TEXT[] NOT NULL,
  data_subjects TEXT[] NOT NULL,
  recipients TEXT[],
  retention_period INTEGER, -- in days
  cross_border_transfers BOOLEAN DEFAULT false,
  safeguards TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspaces
CREATE POLICY "Users can view workspaces they belong to"
ON public.workspaces FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Workspace owners can update their workspaces"
ON public.workspaces FOR UPDATE
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create workspaces"
ON public.workspaces FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Create RLS policies for workspace members
CREATE POLICY "Users can view members of their workspaces"
ON public.workspace_members FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Workspace admins can manage members"
ON public.workspace_members FOR ALL
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND status = 'active'
  )
);

-- Create RLS policies for workspace invitations
CREATE POLICY "Users can view invitations for their workspaces"
ON public.workspace_invitations FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND status = 'active'
  )
);

CREATE POLICY "Workspace admins can manage invitations"
ON public.workspace_invitations FOR ALL
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND status = 'active'
  )
);

-- Create RLS policies for user sessions
CREATE POLICY "Users can view their own sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Workspace admins can view workspace sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND status = 'active'
  )
);

-- Create RLS policies for compliance logs
CREATE POLICY "Workspace admins can view compliance logs"
ON public.compliance_logs FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND status = 'active'
  )
);

CREATE POLICY "System can insert compliance logs"
ON public.compliance_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create RLS policies for data processing activities
CREATE POLICY "Workspace members can view data processing activities"
ON public.data_processing_activities FOR SELECT
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Workspace admins can manage data processing activities"
ON public.data_processing_activities FOR ALL
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND status = 'active'
  )
);

-- Create indexes for performance
CREATE INDEX idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON public.workspaces(slug);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX idx_workspace_invitations_workspace_id ON public.workspace_invitations(workspace_id);
CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations(email);
CREATE INDEX idx_workspace_invitations_token ON public.workspace_invitations(invitation_token);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_workspace_id ON public.user_sessions(workspace_id);
CREATE INDEX idx_compliance_logs_workspace_id ON public.compliance_logs(workspace_id);
CREATE INDEX idx_compliance_logs_user_id ON public.compliance_logs(user_id);
CREATE INDEX idx_compliance_logs_created_at ON public.compliance_logs(created_at);

-- Create triggers for updated_at columns
CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_processing_activities_updated_at
  BEFORE UPDATE ON public.data_processing_activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions for workspace management
CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(
  workspace_name TEXT,
  workspace_description TEXT DEFAULT NULL,
  workspace_slug TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_workspace_id UUID;
  generated_slug TEXT;
BEGIN
  -- Generate slug if not provided
  IF workspace_slug IS NULL THEN
    generated_slug := lower(regexp_replace(workspace_name, '[^a-zA-Z0-9]', '-', 'g'));
    generated_slug := regexp_replace(generated_slug, '-+', '-', 'g');
    generated_slug := trim(both '-' from generated_slug);
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = generated_slug) LOOP
      generated_slug := generated_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  ELSE
    generated_slug := workspace_slug;
  END IF;

  -- Create workspace
  INSERT INTO public.workspaces (name, description, slug, owner_id)
  VALUES (workspace_name, workspace_description, generated_slug, auth.uid())
  RETURNING id INTO new_workspace_id;

  -- Add owner as member
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (new_workspace_id, auth.uid(), 'owner', 'active');

  -- Log the creation
  INSERT INTO public.compliance_logs (
    workspace_id, user_id, event_type, event_category, description
  ) VALUES (
    new_workspace_id, auth.uid(), 'workspace_created', 'user_management',
    'Workspace created: ' || workspace_name
  );

  RETURN new_workspace_id;
END;
$$;

-- Create function to accept workspace invitation
CREATE OR REPLACE FUNCTION public.accept_workspace_invitation(invitation_token UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = auth.uid();

  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.workspace_invitations
  WHERE invitation_token = accept_workspace_invitation.invitation_token
    AND email = user_email
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Add user to workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role, invited_by, status)
  VALUES (
    invitation_record.workspace_id,
    auth.uid(),
    invitation_record.role,
    invitation_record.invited_by,
    'active'
  );

  -- Update invitation status
  UPDATE public.workspace_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_record.id;

  -- Log the acceptance
  INSERT INTO public.compliance_logs (
    workspace_id, user_id, event_type, event_category, description
  ) VALUES (
    invitation_record.workspace_id, auth.uid(), 'invitation_accepted', 'user_management',
    'User accepted workspace invitation'
  );

  RETURN TRUE;
END;
$$;

-- Create function to track user session
CREATE OR REPLACE FUNCTION public.track_user_session(
  session_id_param TEXT,
  workspace_id_param UUID DEFAULT NULL,
  ip_address_param INET DEFAULT NULL,
  user_agent_param TEXT DEFAULT NULL,
  device_info_param JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_uuid UUID;
BEGIN
  INSERT INTO public.user_sessions (
    user_id, session_id, workspace_id, ip_address, user_agent, device_info, expires_at
  ) VALUES (
    auth.uid(), session_id_param, workspace_id_param, ip_address_param, 
    user_agent_param, device_info_param, now() + interval '24 hours'
  )
  RETURNING id INTO session_uuid;

  RETURN session_uuid;
END;
$$;