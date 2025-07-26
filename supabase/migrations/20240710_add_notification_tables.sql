-- Daily project manager check-ins
CREATE TABLE public.project_daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  project_manager_id UUID REFERENCES auth.users(id),
  checkin_date DATE NOT NULL,
  status_update TEXT,
  blockers TEXT[],
  progress_update INTEGER,
  key_accomplishments TEXT[],
  next_steps TEXT[],
  stakeholder_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, checkin_date)
);

-- Resource delivery confirmations
CREATE TABLE public.resource_delivery_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES resources(id),
  confirmation_token UUID DEFAULT gen_random_uuid(),
  scheduled_date DATE NOT NULL,
  status TEXT CHECK (status IN ('pending', 'on_track', 'needs_rebaseline', 'completed')),
  response_date TIMESTAMP WITH TIME ZONE,
  rebaseline_reason TEXT,
  proposed_new_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rebaseline approval workflow
CREATE TABLE public.rebaseline_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_id UUID REFERENCES resource_delivery_confirmations(id),
  project_manager_id UUID REFERENCES auth.users(id),
  original_date DATE NOT NULL,
  proposed_date DATE NOT NULL,
  reason TEXT NOT NULL,
  impact_analysis TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')),
  decision_date TIMESTAMP WITH TIME ZONE,
  decision_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification queue (proper database storage)
CREATE TABLE public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  workspace_id UUID REFERENCES workspaces(id),
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  sent_via TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE project_daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_delivery_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebaseline_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY; 