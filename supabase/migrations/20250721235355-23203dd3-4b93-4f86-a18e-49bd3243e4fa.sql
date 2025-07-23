
-- Enhanced Resource Management Database Schema
-- This migration adds support for AI-powered resource management with task-based utilization

-- Create enhanced resource profiles table
CREATE TABLE IF NOT EXISTS public.resource_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Identity & Role
  employee_id TEXT,
  seniority_level TEXT CHECK (seniority_level IN ('Junior', 'Mid', 'Senior', 'Lead', 'Principal')) DEFAULT 'Mid',
  
  -- Task Handling Patterns
  optimal_task_count_per_day INTEGER DEFAULT 3,
  optimal_task_count_per_week INTEGER DEFAULT 15,
  timezone TEXT DEFAULT 'UTC',
  work_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  preferred_work_style TEXT CHECK (preferred_work_style IN ('Deep Focus', 'Collaborative', 'Mixed')) DEFAULT 'Mixed',
  task_switching_preference TEXT CHECK (task_switching_preference IN ('Sequential', 'Parallel', 'Batched')) DEFAULT 'Sequential',
  
  -- Performance Metrics (Auto-calculated)
  historical_task_velocity DECIMAL DEFAULT 0,
  complexity_handling_score INTEGER DEFAULT 5 CHECK (complexity_handling_score BETWEEN 1 AND 10),
  collaboration_effectiveness DECIMAL DEFAULT 0,
  learning_task_success_rate DECIMAL DEFAULT 0,
  
  -- Task Productivity Patterns
  peak_productivity_periods TEXT[] DEFAULT ARRAY['Monday-AM', 'Tuesday-AM', 'Wednesday-AM'],
  task_switching_penalty_score INTEGER DEFAULT 5 CHECK (task_switching_penalty_score BETWEEN 1 AND 10),
  new_project_ramp_up_tasks INTEGER DEFAULT 5,
  
  -- Contract & Availability
  employment_type TEXT CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Consultant')) DEFAULT 'Full-time',
  contract_end_date DATE,
  planned_time_off JSONB DEFAULT '[]',
  recurring_commitments JSONB DEFAULT '[]',
  
  -- AI Enhancement Data
  strength_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  growth_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  career_aspirations TEXT[] DEFAULT ARRAY[]::TEXT[],
  mentorship_capacity BOOLEAN DEFAULT FALSE,
  
  -- Status tracking
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_projects TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced skill proficiency table
CREATE TABLE IF NOT EXISTS public.skill_proficiencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 10) DEFAULT 5,
  years_experience INTEGER DEFAULT 0,
  last_used DATE DEFAULT CURRENT_DATE,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 1 AND 10) DEFAULT 5,
  certification_level TEXT,
  improvement_trend TEXT CHECK (improvement_trend IN ('Improving', 'Stable', 'Declining')) DEFAULT 'Stable',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(resource_id, skill_id)
);

-- Enhance project_tasks table for task intelligence
ALTER TABLE public.project_tasks 
ADD COLUMN IF NOT EXISTS complexity_score INTEGER DEFAULT 5 CHECK (complexity_score BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS effort_points INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS task_size TEXT CHECK (task_size IN ('XS', 'S', 'M', 'L', 'XL')) DEFAULT 'M',
ADD COLUMN IF NOT EXISTS confidence_level INTEGER DEFAULT 5 CHECK (confidence_level BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS dependency_weight INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parallel_task_capacity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS requires_deep_focus BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS collaboration_intensity TEXT CHECK (collaboration_intensity IN ('Low', 'Medium', 'High')) DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS context_switching_penalty INTEGER DEFAULT 5 CHECK (context_switching_penalty BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS knowledge_transfer_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS actual_complexity INTEGER CHECK (actual_complexity BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS blocker_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rework_cycles INTEGER DEFAULT 0;

-- Create task skill requirements table
CREATE TABLE IF NOT EXISTS public.task_skill_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.project_tasks(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  requirement_type TEXT CHECK (requirement_type IN ('primary', 'secondary', 'nice_to_have', 'learning_opportunity')) DEFAULT 'primary',
  minimum_proficiency INTEGER CHECK (minimum_proficiency BETWEEN 1 AND 10) DEFAULT 5,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(task_id, skill_id)
);

-- Create resource utilization metrics table
CREATE TABLE IF NOT EXISTS public.resource_utilization_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Metrics period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT CHECK (period_type IN ('day', 'week', 'month')) DEFAULT 'week',
  
  -- Task-based metrics
  task_count INTEGER DEFAULT 0,
  task_capacity INTEGER DEFAULT 0,
  utilization_percentage DECIMAL DEFAULT 0,
  weighted_task_load DECIMAL DEFAULT 0,
  weighted_capacity DECIMAL DEFAULT 0,
  weighted_utilization DECIMAL DEFAULT 0,
  
  -- Task distribution
  simple_tasks INTEGER DEFAULT 0,
  medium_tasks INTEGER DEFAULT 0,
  complex_tasks INTEGER DEFAULT 0,
  
  -- Performance indicators
  tasks_completed INTEGER DEFAULT 0,
  average_task_quality DECIMAL DEFAULT 0,
  collaboration_tasks INTEGER DEFAULT 0,
  learning_tasks INTEGER DEFAULT 0,
  
  -- Status and trends
  utilization_status TEXT DEFAULT 'Available',
  context_switch_penalty DECIMAL DEFAULT 0,
  bottleneck_risk_score INTEGER DEFAULT 0 CHECK (bottleneck_risk_score BETWEEN 0 AND 10),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI assignment recommendations table
CREATE TABLE IF NOT EXISTS public.ai_assignment_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  
  -- Scoring metrics
  task_capacity_fit_score DECIMAL DEFAULT 0,
  complexity_handling_fit_score DECIMAL DEFAULT 0,
  skill_match_score DECIMAL DEFAULT 0,
  availability_score DECIMAL DEFAULT 0,
  collaboration_fit_score DECIMAL DEFAULT 0,
  learning_opportunity_score DECIMAL DEFAULT 0,
  overall_fit_score DECIMAL DEFAULT 0,
  
  -- Predictions
  task_completion_forecast DECIMAL DEFAULT 0,
  quality_prediction DECIMAL DEFAULT 0,
  timeline_confidence DECIMAL DEFAULT 0,
  success_probability DECIMAL DEFAULT 0,
  
  -- Risk assessment
  overload_risk_score INTEGER DEFAULT 0 CHECK (overload_risk_score BETWEEN 0 AND 10),
  skill_gap_risk_score INTEGER DEFAULT 0 CHECK (skill_gap_risk_score BETWEEN 0 AND 10),
  context_switching_impact DECIMAL DEFAULT 0,
  
  -- Recommendation data
  recommended_task_count INTEGER DEFAULT 0,
  reasoning JSONB DEFAULT '{}',
  alternative_assignments JSONB DEFAULT '[]',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours'
);

-- Create resource comparison data table
CREATE TABLE IF NOT EXISTS public.resource_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  resource_ids UUID[] NOT NULL,
  comparison_type TEXT DEFAULT 'general',
  
  -- Comparison metrics
  skill_comparison_data JSONB DEFAULT '{}',
  availability_comparison_data JSONB DEFAULT '{}',
  performance_comparison_data JSONB DEFAULT '{}',
  cost_comparison_data JSONB DEFAULT '{}',
  
  -- AI analysis
  complementary_skills_analysis JSONB DEFAULT '{}',
  team_synergy_prediction JSONB DEFAULT '{}',
  optimal_pairing_suggestions JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.resource_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_proficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_utilization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assignment_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_comparisons ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspace access
CREATE POLICY "Users can manage resource profiles in their workspace" ON public.resource_profiles
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can manage skill proficiencies in their workspace" ON public.skill_proficiencies
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can manage task skill requirements in their workspace" ON public.task_skill_requirements
FOR ALL USING (
  task_id IN (
    SELECT pt.id FROM project_tasks pt
    JOIN projects p ON p.id = pt.project_id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

CREATE POLICY "Users can view utilization metrics in their workspace" ON public.resource_utilization_metrics
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can view AI recommendations in their workspace" ON public.ai_assignment_recommendations
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Users can manage resource comparisons in their workspace" ON public.resource_comparisons
FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resource_profiles_workspace_id ON public.resource_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_resource_profiles_resource_id ON public.resource_profiles(resource_id);
CREATE INDEX IF NOT EXISTS idx_skill_proficiencies_resource_id ON public.skill_proficiencies(resource_id);
CREATE INDEX IF NOT EXISTS idx_skill_proficiencies_skill_id ON public.skill_proficiencies(skill_id);
CREATE INDEX IF NOT EXISTS idx_task_skill_requirements_task_id ON public.task_skill_requirements(task_id);
CREATE INDEX IF NOT EXISTS idx_utilization_metrics_resource_period ON public.resource_utilization_metrics(resource_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_project_id ON public.ai_assignment_recommendations(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_expires_at ON public.ai_assignment_recommendations(expires_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resource_profiles_updated_at
    BEFORE UPDATE ON public.resource_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_proficiencies_updated_at
    BEFORE UPDATE ON public.skill_proficiencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_utilization_metrics_updated_at
    BEFORE UPDATE ON public.resource_utilization_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_comparisons_updated_at
    BEFORE UPDATE ON public.resource_comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
