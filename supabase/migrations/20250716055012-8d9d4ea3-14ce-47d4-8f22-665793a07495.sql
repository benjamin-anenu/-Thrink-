-- Add AI processing status to projects table
ALTER TABLE public.projects 
ADD COLUMN ai_processing_status text DEFAULT 'pending' CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed'));

-- Add AI processing started/completed timestamps
ALTER TABLE public.projects 
ADD COLUMN ai_processing_started_at timestamp with time zone,
ADD COLUMN ai_processing_completed_at timestamp with time zone;

-- Create index for efficient querying of AI processing status
CREATE INDEX idx_projects_ai_processing_status ON public.projects(ai_processing_status);

-- Enable realtime for projects table to get status updates
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;