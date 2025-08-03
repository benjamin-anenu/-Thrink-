-- Create task_subtasks table for proper subtask management
CREATE TABLE public.task_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies for subtasks
CREATE POLICY "Users can view subtasks for their project tasks" 
ON public.task_subtasks 
FOR SELECT 
USING (
  task_id IN (
    SELECT pt.id 
    FROM public.project_tasks pt
    JOIN public.projects p ON pt.project_id = p.id
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

CREATE POLICY "Users can manage subtasks for their project tasks" 
ON public.task_subtasks 
FOR ALL 
USING (
  task_id IN (
    SELECT pt.id 
    FROM public.project_tasks pt
    JOIN public.projects p ON pt.project_id = p.id
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
)
WITH CHECK (
  task_id IN (
    SELECT pt.id 
    FROM public.project_tasks pt
    JOIN public.projects p ON pt.project_id = p.id
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Create trigger for updating updated_at
CREATE TRIGGER update_task_subtasks_updated_at
BEFORE UPDATE ON public.task_subtasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();