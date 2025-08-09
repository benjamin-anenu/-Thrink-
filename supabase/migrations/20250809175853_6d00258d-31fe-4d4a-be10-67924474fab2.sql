-- Harden RLS on remaining public tables and add enterprise-scoped policies

-- notifications: enable RLS and policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own notifications" ON public.notifications;
CREATE POLICY "Users manage own notifications"
ON public.notifications
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- notification_queue: enable RLS and policies (user or enterprise-scoped)
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view their own notification queue" ON public.notification_queue;
DROP POLICY IF EXISTS "Users manage their own notification queue" ON public.notification_queue;
CREATE POLICY "Users view their own notification queue"
ON public.notification_queue
FOR SELECT
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR
  (workspace_id IS NOT NULL AND workspace_id IN (
    SELECT w.id FROM public.workspaces w
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  ))
);
CREATE POLICY "Users manage their own notification queue"
ON public.notification_queue
FOR ALL
USING (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR
  (workspace_id IS NOT NULL AND workspace_id IN (
    SELECT w.id FROM public.workspaces w
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  ))
)
WITH CHECK (
  (user_id IS NOT NULL AND user_id = auth.uid())
  OR
  (workspace_id IS NOT NULL AND workspace_id IN (
    SELECT w.id FROM public.workspaces w
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  ))
);

-- project_assignments: enable RLS and enterprise-scoped policies
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view project assignments in their enterprise" ON public.project_assignments;
DROP POLICY IF EXISTS "Users manage project assignments in their enterprise" ON public.project_assignments;
CREATE POLICY "Users view project assignments in their enterprise"
ON public.project_assignments
FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  )
);
CREATE POLICY "Users manage project assignments in their enterprise"
ON public.project_assignments
FOR ALL
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE w.enterprise_id IN (
      SELECT enterprise_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  )
);

-- project_daily_checkins: enable RLS and policies
ALTER TABLE public.project_daily_checkins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view checkins in their enterprise" ON public.project_daily_checkins;
DROP POLICY IF EXISTS "Users manage checkins in their enterprise" ON public.project_daily_checkins;
CREATE POLICY "Users view checkins in their enterprise"
ON public.project_daily_checkins
FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  )
);
CREATE POLICY "Users manage checkins in their enterprise"
ON public.project_daily_checkins
FOR ALL
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE w.enterprise_id IN (
      SELECT enterprise_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  )
);

-- baseline_versions: enable RLS and policies via project linkage
ALTER TABLE public.baseline_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view baseline versions in their enterprise" ON public.baseline_versions;
DROP POLICY IF EXISTS "Users manage baseline versions in their enterprise" ON public.baseline_versions;
CREATE POLICY "Users view baseline versions in their enterprise"
ON public.baseline_versions
FOR SELECT
USING (
  (project_id IS NOT NULL AND project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    JOIN public.user_roles ur ON ur.enterprise_id = w.enterprise_id
    WHERE ur.user_id = auth.uid()
  ))
);
CREATE POLICY "Users manage baseline versions in their enterprise"
ON public.baseline_versions
FOR ALL
USING (
  (project_id IS NOT NULL AND project_id IN (
    SELECT p.id FROM public.projects p
    JOIN public.workspaces w ON w.id = p.workspace_id
    WHERE w.enterprise_id IN (
      SELECT enterprise_id FROM public.user_roles WHERE user_id = auth.uid()
    )
  ))
);
