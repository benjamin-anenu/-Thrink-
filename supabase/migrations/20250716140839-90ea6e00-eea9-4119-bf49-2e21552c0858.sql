
-- Create table for project creation drafts
CREATE TABLE public.project_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  draft_name TEXT NOT NULL,
  draft_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_step INTEGER NOT NULL DEFAULT 1,
  last_modified TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_drafts
ALTER TABLE public.project_drafts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_drafts
CREATE POLICY "Users can manage their own drafts"
ON public.project_drafts
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add trigger to update updated_at column
CREATE TRIGGER update_project_drafts_updated_at
  BEFORE UPDATE ON public.project_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint for workspace_id
ALTER TABLE public.project_drafts 
ADD CONSTRAINT fk_project_drafts_workspace 
FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_project_drafts_user_workspace ON public.project_drafts(user_id, workspace_id);
CREATE INDEX idx_project_drafts_last_modified ON public.project_drafts(last_modified DESC);
