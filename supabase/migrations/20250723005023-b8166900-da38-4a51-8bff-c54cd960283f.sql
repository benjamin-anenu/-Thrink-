
-- Create scheduled_reports table
CREATE TABLE public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  created_by UUID NOT NULL,
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'milestone')),
  is_active BOOLEAN DEFAULT true,
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  sections TEXT[] DEFAULT '{}',
  date_range_start DATE,
  date_range_end DATE,
  format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'xlsx', 'csv', 'pptx')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create report_recipients table
CREATE TABLE public.report_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scheduled_report_id UUID NOT NULL REFERENCES public.scheduled_reports(id) ON DELETE CASCADE,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('workspace_member', 'resource', 'stakeholder')),
  recipient_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for scheduled_reports
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage scheduled reports in their workspace"
ON public.scheduled_reports
FOR ALL
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Add RLS policies for report_recipients
ALTER TABLE public.report_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage report recipients in their workspace"
ON public.report_recipients
FOR ALL
USING (scheduled_report_id IN (
  SELECT sr.id FROM scheduled_reports sr
  JOIN workspace_members wm ON wm.workspace_id = sr.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

-- Add indexes for performance
CREATE INDEX idx_scheduled_reports_workspace_id ON public.scheduled_reports(workspace_id);
CREATE INDEX idx_scheduled_reports_next_run_at ON public.scheduled_reports(next_run_at);
CREATE INDEX idx_report_recipients_scheduled_report_id ON public.report_recipients(scheduled_report_id);

-- Add trigger for updated_at
CREATE TRIGGER update_scheduled_reports_updated_at
  BEFORE UPDATE ON public.scheduled_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
