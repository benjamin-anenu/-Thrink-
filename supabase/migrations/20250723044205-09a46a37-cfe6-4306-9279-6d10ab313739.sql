-- Create phases table
CREATE TABLE public.phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  baseline_start_date DATE,
  baseline_end_date DATE,
  status VARCHAR(50) DEFAULT 'planned', -- planned, active, completed, paused, cancelled
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  sort_order INTEGER NOT NULL DEFAULT 0,
  color VARCHAR(7), -- hex color for UI visualization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  CONSTRAINT unique_phase_sort_order UNIQUE (project_id, sort_order)
);

-- Indexes for performance
CREATE INDEX idx_phases_project_id ON public.phases(project_id);
CREATE INDEX idx_phases_sort_order ON public.phases(project_id, sort_order);
CREATE INDEX idx_phases_status ON public.phases(status);

-- Enable RLS
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for phases
CREATE POLICY "Users can manage phases for their projects" 
ON public.phases 
FOR ALL 
USING (project_id IN (
  SELECT p.id
  FROM projects p
  JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
))
WITH CHECK (project_id IN (
  SELECT p.id
  FROM projects p
  JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

-- Update milestones table to add phase relationship
ALTER TABLE public.milestones 
ADD COLUMN phase_id UUID REFERENCES public.phases(id) ON DELETE SET NULL,
ADD COLUMN sort_order_in_phase INTEGER DEFAULT 0;

-- Index for phase relationships
CREATE INDEX idx_milestones_phase_id ON public.milestones(phase_id);
CREATE INDEX idx_milestones_phase_sort ON public.milestones(phase_id, sort_order_in_phase);

-- Create trigger for updating updated_at on phases
CREATE TRIGGER update_phases_updated_at
BEFORE UPDATE ON public.phases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migration script for existing data
DO $$
DECLARE
    project_record RECORD;
    default_phase_id UUID;
    milestone_record RECORD;
    milestone_order INTEGER;
BEGIN
    FOR project_record IN SELECT id FROM public.projects LOOP
        -- Create a default phase for each existing project
        INSERT INTO public.phases (project_id, name, description, status, sort_order, color)
        VALUES (
            project_record.id, 
            'Phase 1', 
            'Default phase for existing milestones', 
            'active', 
            1,
            '#3b82f6'
        ) RETURNING id INTO default_phase_id;
        
        -- Assign all existing milestones to this default phase
        milestone_order := 1;
        FOR milestone_record IN 
            SELECT id FROM public.milestones 
            WHERE project_id = project_record.id 
            ORDER BY due_date NULLS LAST
        LOOP
            UPDATE public.milestones 
            SET phase_id = default_phase_id,
                sort_order_in_phase = milestone_order
            WHERE id = milestone_record.id;
            
            milestone_order := milestone_order + 1;
        END LOOP;
    END LOOP;
END $$;