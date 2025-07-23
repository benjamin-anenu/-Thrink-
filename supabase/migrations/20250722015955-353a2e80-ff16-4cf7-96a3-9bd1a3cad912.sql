
-- Add hourly_rate field to resources table
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.resources.hourly_rate IS 'Hourly rate for budget calculations and cost analysis';

-- Create resource_utilization_metrics table for real-time utilization tracking
CREATE TABLE IF NOT EXISTS public.resource_utilization_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  task_count INTEGER DEFAULT 0,
  task_capacity INTEGER DEFAULT 10,
  utilization_percentage DECIMAL(5,2) DEFAULT 0,
  weighted_task_load DECIMAL(8,2) DEFAULT 0,
  weighted_capacity DECIMAL(8,2) DEFAULT 10,
  weighted_utilization DECIMAL(5,2) DEFAULT 0,
  simple_tasks INTEGER DEFAULT 0,
  medium_tasks INTEGER DEFAULT 0,
  complex_tasks INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Well Utilized',
  utilization_trend INTEGER DEFAULT 0,
  optimal_task_range_min INTEGER DEFAULT 5,
  optimal_task_range_max INTEGER DEFAULT 15,
  predicted_completion_count INTEGER DEFAULT 0,
  bottleneck_risk_score INTEGER DEFAULT 0,
  context_switch_penalty INTEGER DEFAULT 0,
  average_task_quality DECIMAL(3,2) DEFAULT 0,
  collaboration_tasks INTEGER DEFAULT 0,
  learning_tasks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on resource_utilization_metrics
ALTER TABLE public.resource_utilization_metrics ENABLE ROW LEVEL SECURITY;

-- Create policy for resource utilization metrics
CREATE POLICY "Users can manage resource utilization in their workspace"
ON public.resource_utilization_metrics
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Add skills table if not exists for real skills management
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'Technical',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workspace_id, name)
);

-- Enable RLS on skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Create policy for skills
CREATE POLICY "Users can manage skills in their workspace"
ON public.skills
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Add skill_proficiencies table if not exists
CREATE TABLE IF NOT EXISTS public.skill_proficiencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency_level INTEGER NOT NULL CHECK (proficiency_level >= 1 AND proficiency_level <= 10),
  years_experience INTEGER DEFAULT 0,
  last_used DATE,
  confidence_score INTEGER DEFAULT 5 CHECK (confidence_score >= 1 AND confidence_score <= 10),
  improvement_trend TEXT DEFAULT 'Stable',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on skill_proficiencies
ALTER TABLE public.skill_proficiencies ENABLE ROW LEVEL SECURITY;

-- Create policy for skill proficiencies
CREATE POLICY "Users can manage skill proficiencies in their workspace"
ON public.skill_proficiencies
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Add resource_profiles table if not exists for enhanced resource data
CREATE TABLE IF NOT EXISTS public.resource_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  employee_id TEXT,
  seniority_level TEXT DEFAULT 'Mid',
  employment_type TEXT DEFAULT 'Full-time',
  optimal_task_count_per_day INTEGER DEFAULT 5,
  optimal_task_count_per_week INTEGER DEFAULT 25,
  preferred_work_style TEXT DEFAULT 'Mixed',
  task_switching_preference TEXT DEFAULT 'Sequential',
  timezone TEXT DEFAULT 'UTC',
  work_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  peak_productivity_periods TEXT[] DEFAULT ARRAY['Morning'],
  contract_end_date DATE,
  planned_time_off JSONB DEFAULT '[]'::jsonb,
  recurring_commitments JSONB DEFAULT '[]'::jsonb,
  career_aspirations TEXT[] DEFAULT ARRAY[]::TEXT[],
  mentorship_capacity BOOLEAN DEFAULT false,
  complexity_handling_score INTEGER DEFAULT 5,
  collaboration_effectiveness INTEGER DEFAULT 5,
  learning_task_success_rate INTEGER DEFAULT 80,
  historical_task_velocity DECIMAL(4,2) DEFAULT 1.0,
  strength_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  growth_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(resource_id, workspace_id)
);

-- Enable RLS on resource_profiles
ALTER TABLE public.resource_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for resource profiles
CREATE POLICY "Users can manage resource profiles in their workspace"
ON public.resource_profiles
FOR ALL
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Create function to calculate real-time utilization
CREATE OR REPLACE FUNCTION public.calculate_resource_utilization(resource_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_count_active INTEGER := 0;
  task_count_completed INTEGER := 0;
  simple_count INTEGER := 0;
  medium_count INTEGER := 0;
  complex_count INTEGER := 0;
  utilization_pct DECIMAL(5,2) := 0;
  resource_workspace_id UUID;
BEGIN
  -- Get resource workspace
  SELECT workspace_id INTO resource_workspace_id 
  FROM public.resources 
  WHERE id = resource_uuid;
  
  -- Count active tasks assigned to resource
  SELECT COUNT(*) INTO task_count_active
  FROM public.project_tasks pt
  JOIN public.projects p ON p.id = pt.project_id
  WHERE pt.assignee_id = resource_uuid 
  AND pt.status NOT IN ('Completed', 'Cancelled')
  AND p.workspace_id = resource_workspace_id;
  
  -- Count completed tasks in last 30 days
  SELECT COUNT(*) INTO task_count_completed
  FROM public.project_tasks pt
  JOIN public.projects p ON p.id = pt.project_id
  WHERE pt.assignee_id = resource_uuid 
  AND pt.status = 'Completed'
  AND pt.completed_at >= NOW() - INTERVAL '30 days'
  AND p.workspace_id = resource_workspace_id;
  
  -- Count by complexity
  SELECT 
    COUNT(CASE WHEN pt.complexity_score <= 3 THEN 1 END),
    COUNT(CASE WHEN pt.complexity_score BETWEEN 4 AND 7 THEN 1 END),
    COUNT(CASE WHEN pt.complexity_score >= 8 THEN 1 END)
  INTO simple_count, medium_count, complex_count
  FROM public.project_tasks pt
  JOIN public.projects p ON p.id = pt.project_id
  WHERE pt.assignee_id = resource_uuid 
  AND pt.status NOT IN ('Completed', 'Cancelled')
  AND p.workspace_id = resource_workspace_id;
  
  -- Calculate utilization percentage (assuming 10 is full capacity)
  utilization_pct := (task_count_active::DECIMAL / 10) * 100;
  
  -- Upsert utilization metrics
  INSERT INTO public.resource_utilization_metrics (
    resource_id,
    workspace_id,
    task_count,
    task_capacity,
    utilization_percentage,
    weighted_task_load,
    weighted_capacity,
    weighted_utilization,
    simple_tasks,
    medium_tasks,
    complex_tasks,
    tasks_completed,
    status,
    utilization_trend,
    optimal_task_range_min,
    optimal_task_range_max,
    predicted_completion_count,
    bottleneck_risk_score,
    context_switch_penalty,
    updated_at
  ) VALUES (
    resource_uuid,
    resource_workspace_id,
    task_count_active,
    10,
    utilization_pct,
    task_count_active * 1.2,
    10,
    LEAST(utilization_pct, 100),
    simple_count,
    medium_count,
    complex_count,
    task_count_completed,
    CASE 
      WHEN utilization_pct > 90 THEN 'Overloaded'
      WHEN utilization_pct > 70 THEN 'Well Utilized'
      WHEN utilization_pct > 40 THEN 'Moderately Utilized'
      ELSE 'Underutilized'
    END,
    0,
    5,
    15,
    FLOOR(task_count_completed / 4), -- Weekly forecast
    CASE WHEN utilization_pct > 80 THEN FLOOR(utilization_pct / 10) ELSE 0 END,
    CASE WHEN task_count_active > 8 THEN 3 ELSE 1 END,
    NOW()
  )
  ON CONFLICT (resource_id, workspace_id) 
  DO UPDATE SET
    task_count = EXCLUDED.task_count,
    utilization_percentage = EXCLUDED.utilization_percentage,
    weighted_task_load = EXCLUDED.weighted_task_load,
    weighted_utilization = EXCLUDED.weighted_utilization,
    simple_tasks = EXCLUDED.simple_tasks,
    medium_tasks = EXCLUDED.medium_tasks,
    complex_tasks = EXCLUDED.complex_tasks,
    tasks_completed = EXCLUDED.tasks_completed,
    status = EXCLUDED.status,
    predicted_completion_count = EXCLUDED.predicted_completion_count,
    bottleneck_risk_score = EXCLUDED.bottleneck_risk_score,
    context_switch_penalty = EXCLUDED.context_switch_penalty,
    updated_at = NOW();
END;
$$;
