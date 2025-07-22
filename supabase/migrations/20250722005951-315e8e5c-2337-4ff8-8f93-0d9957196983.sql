
-- Add missing columns to existing tables for enhanced resource management

-- Update resource_profiles table to include missing fields
ALTER TABLE public.resource_profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS work_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
ADD COLUMN IF NOT EXISTS peak_productivity_periods TEXT[],
ADD COLUMN IF NOT EXISTS task_switching_penalty_score INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS new_project_ramp_up_tasks INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS planned_time_off JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS recurring_commitments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS career_aspirations TEXT[],
ADD COLUMN IF NOT EXISTS mentorship_capacity BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS current_projects TEXT[];

-- Create skill_proficiencies table
CREATE TABLE IF NOT EXISTS public.skill_proficiencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  skill_id UUID,
  workspace_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency_level INTEGER NOT NULL DEFAULT 5 CHECK (proficiency_level >= 1 AND proficiency_level <= 10),
  years_experience INTEGER DEFAULT 0,
  last_used DATE,
  confidence_score INTEGER DEFAULT 5 CHECK (confidence_score >= 1 AND confidence_score <= 10),
  certification_level TEXT,
  improvement_trend TEXT DEFAULT 'Stable' CHECK (improvement_trend IN ('Improving', 'Stable', 'Declining')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(resource_id, skill_name)
);

-- Enable RLS on skill_proficiencies
ALTER TABLE public.skill_proficiencies ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for skill_proficiencies
CREATE POLICY "Users can manage skill proficiencies in their workspace" 
ON public.skill_proficiencies 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_members.workspace_id 
  FROM workspace_members 
  WHERE workspace_members.user_id = auth.uid() 
  AND workspace_members.status = 'active'
));

-- Create resource_performance_metrics table
CREATE TABLE IF NOT EXISTS public.resource_performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('task_completion', 'deadline_adherence', 'quality_score', 'collaboration', 'communication', 'learning_velocity', 'client_satisfaction')),
  metric_value NUMERIC NOT NULL DEFAULT 0 CHECK (metric_value >= 0 AND metric_value <= 10),
  weight NUMERIC NOT NULL DEFAULT 1.0,
  project_id UUID,
  task_id UUID,
  measurement_period TEXT DEFAULT 'monthly' CHECK (measurement_period IN ('daily', 'weekly', 'monthly', 'quarterly')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on resource_performance_metrics
ALTER TABLE public.resource_performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for resource_performance_metrics
CREATE POLICY "Users can manage performance metrics in their workspace" 
ON public.resource_performance_metrics 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_members.workspace_id 
  FROM workspace_members 
  WHERE workspace_members.user_id = auth.uid() 
  AND workspace_members.status = 'active'
));

-- Create resource_availability table
CREATE TABLE IF NOT EXISTS public.resource_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  date DATE NOT NULL,
  availability_type TEXT NOT NULL DEFAULT 'available' CHECK (availability_type IN ('available', 'busy', 'time_off', 'meeting', 'blocked')),
  hours_available NUMERIC DEFAULT 8.0,
  hours_allocated NUMERIC DEFAULT 0.0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(resource_id, date)
);

-- Enable RLS on resource_availability
ALTER TABLE public.resource_availability ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for resource_availability
CREATE POLICY "Users can manage resource availability in their workspace" 
ON public.resource_availability 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_members.workspace_id 
  FROM workspace_members 
  WHERE workspace_members.user_id = auth.uid() 
  AND workspace_members.status = 'active'
));

-- Update resource_utilization_metrics to include tasks_completed if not exists
ALTER TABLE public.resource_utilization_metrics 
ADD COLUMN IF NOT EXISTS tasks_completed INTEGER DEFAULT 0;

-- Create function to calculate resource performance score
CREATE OR REPLACE FUNCTION public.calculate_resource_performance_score(
  resource_id_param UUID,
  time_period TEXT DEFAULT 'monthly'
)
RETURNS TABLE(
  overall_score NUMERIC,
  task_completion_score NUMERIC,
  quality_score NUMERIC,
  collaboration_score NUMERIC,
  deadline_adherence_score NUMERIC,
  learning_velocity_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  date_filter TIMESTAMP;
BEGIN
  -- Set date filter based on time period
  CASE time_period
    WHEN 'weekly' THEN date_filter := NOW() - INTERVAL '1 week';
    WHEN 'monthly' THEN date_filter := NOW() - INTERVAL '1 month';
    WHEN 'quarterly' THEN date_filter := NOW() - INTERVAL '3 months';
    ELSE date_filter := NOW() - INTERVAL '1 month';
  END CASE;

  RETURN QUERY
  SELECT 
    COALESCE(AVG(metric_value * weight), 5.0) as overall_score,
    COALESCE(AVG(CASE WHEN metric_type = 'task_completion' THEN metric_value END), 5.0) as task_completion_score,
    COALESCE(AVG(CASE WHEN metric_type = 'quality_score' THEN metric_value END), 5.0) as quality_score,
    COALESCE(AVG(CASE WHEN metric_type = 'collaboration' THEN metric_value END), 5.0) as collaboration_score,
    COALESCE(AVG(CASE WHEN metric_type = 'deadline_adherence' THEN metric_value END), 5.0) as deadline_adherence_score,
    COALESCE(AVG(CASE WHEN metric_type = 'learning_velocity' THEN metric_value END), 5.0) as learning_velocity_score
  FROM public.resource_performance_metrics
  WHERE resource_id = resource_id_param
    AND created_at >= date_filter;
END;
$$;

-- Create function to get top performing resources
CREATE OR REPLACE FUNCTION public.get_top_performing_resources(
  workspace_id_param UUID,
  limit_count INTEGER DEFAULT 10,
  time_period TEXT DEFAULT 'monthly'
)
RETURNS TABLE(
  resource_id UUID,
  resource_name TEXT,
  overall_score NUMERIC,
  task_completion_score NUMERIC,
  quality_score NUMERIC,
  collaboration_score NUMERIC,
  rank_position INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH performance_scores AS (
    SELECT 
      r.id as resource_id,
      r.name as resource_name,
      ps.overall_score,
      ps.task_completion_score,
      ps.quality_score,
      ps.collaboration_score,
      ROW_NUMBER() OVER (ORDER BY ps.overall_score DESC) as rank_position
    FROM public.resources r
    LEFT JOIN LATERAL public.calculate_resource_performance_score(r.id, time_period) ps ON true
    WHERE r.workspace_id = workspace_id_param
  )
  SELECT * FROM performance_scores
  WHERE rank_position <= limit_count
  ORDER BY rank_position;
END;
$$;

-- Add triggers for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_skill_proficiencies_updated_at') THEN
        CREATE TRIGGER update_skill_proficiencies_updated_at 
        BEFORE UPDATE ON public.skill_proficiencies 
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_performance_metrics_updated_at') THEN
        CREATE TRIGGER update_performance_metrics_updated_at 
        BEFORE UPDATE ON public.resource_performance_metrics 
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_availability_updated_at') THEN
        CREATE TRIGGER update_availability_updated_at 
        BEFORE UPDATE ON public.resource_availability 
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END $$;
