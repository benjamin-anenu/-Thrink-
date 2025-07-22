-- Enhanced Resource Management Schema Migration
-- This migration introduces advanced AI-optimized resource management capabilities

-- ==============================================================================
-- 1. ENHANCED RESOURCE PROFILES TABLE
-- ==============================================================================

-- Drop and recreate the resources table with enhanced fields
DROP TABLE IF EXISTS public.resource_profiles CASCADE;
CREATE TABLE public.resource_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity & Role
  employee_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  department_id uuid REFERENCES public.workspace_departments(id),
  role text NOT NULL,
  seniority_level text NOT NULL CHECK (seniority_level IN ('Junior', 'Mid', 'Senior', 'Lead', 'Principal')),
  
  -- Task Handling Patterns (For AI Predictions)
  optimal_task_count_per_day integer DEFAULT 3,
  optimal_task_count_per_week integer DEFAULT 15,
  timezone text DEFAULT 'UTC',
  work_days text[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  preferred_work_style text DEFAULT 'Mixed' CHECK (preferred_work_style IN ('Deep Focus', 'Collaborative', 'Mixed')),
  task_switching_preference text DEFAULT 'Sequential' CHECK (task_switching_preference IN ('Sequential', 'Parallel', 'Batched')),
  
  -- Performance Metrics (Auto-calculated from task completion)
  historical_task_velocity numeric(5,2) DEFAULT 0,
  complexity_handling_score numeric(3,1) DEFAULT 5.0 CHECK (complexity_handling_score BETWEEN 1 AND 10),
  collaboration_effectiveness numeric(3,2) DEFAULT 0.5 CHECK (collaboration_effectiveness BETWEEN 0 AND 1),
  learning_task_success_rate numeric(3,2) DEFAULT 0.5 CHECK (learning_task_success_rate BETWEEN 0 AND 1),
  
  -- Task Productivity Patterns (AI Learning Data)
  peak_productivity_periods text[] DEFAULT ARRAY[],
  task_switching_penalty_score numeric(3,1) DEFAULT 5.0 CHECK (task_switching_penalty_score BETWEEN 1 AND 10),
  new_project_ramp_up_tasks integer DEFAULT 3,
  
  -- Optimal Task Complexity Mix
  simple_tasks_percentage numeric(3,2) DEFAULT 0.40,
  medium_tasks_percentage numeric(3,2) DEFAULT 0.40,
  complex_tasks_percentage numeric(3,2) DEFAULT 0.20,
  
  -- Contract & Availability
  employment_type text DEFAULT 'Full-time' CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Consultant')),
  contract_end_date date,
  
  -- AI Enhancement Data
  strength_keywords text[] DEFAULT ARRAY[],
  growth_areas text[] DEFAULT ARRAY[],
  career_aspirations text[] DEFAULT ARRAY[],
  mentorship_capacity boolean DEFAULT false,
  
  -- Automated Tracking Fields
  current_projects text[] DEFAULT ARRAY[],
  last_activity timestamp with time zone DEFAULT now(),
  status text DEFAULT 'Available' CHECK (status IN ('Available', 'Busy', 'Overloaded', 'On Leave', 'Transitioning')),
  
  -- Workspace Integration
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add constraint to ensure complexity mix percentages sum to 1
ALTER TABLE public.resource_profiles 
ADD CONSTRAINT check_complexity_mix_sum 
CHECK (simple_tasks_percentage + medium_tasks_percentage + complex_tasks_percentage = 1.0);

-- ==============================================================================
-- 2. SKILL PROFICIENCY TABLE
-- ==============================================================================

CREATE TABLE public.skill_proficiencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.resource_profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL,
  skill_name text NOT NULL,
  proficiency_level numeric(3,1) NOT NULL CHECK (proficiency_level BETWEEN 1 AND 10),
  years_experience numeric(4,1) DEFAULT 0,
  last_used timestamp with time zone DEFAULT now(),
  confidence_score numeric(3,1) DEFAULT 5.0 CHECK (confidence_score BETWEEN 1 AND 10),
  certification_level text,
  improvement_trend text DEFAULT 'Stable' CHECK (improvement_trend IN ('Improving', 'Stable', 'Declining')),
  skill_type text DEFAULT 'primary' CHECK (skill_type IN ('primary', 'secondary', 'learning')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(resource_id, skill_id)
);

-- ==============================================================================
-- 3. RESOURCE TIME OFF & COMMITMENTS
-- ==============================================================================

CREATE TABLE public.resource_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.resource_profiles(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  
  CHECK (end_date >= start_date)
);

CREATE TABLE public.resource_recurring_commitments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.resource_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  task_capacity_impact integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  
  CHECK (end_time > start_time)
);

-- ==============================================================================
-- 4. ENHANCED TASK INTELLIGENCE TABLE
-- ==============================================================================

DROP TABLE IF EXISTS public.task_intelligence CASCADE;
CREATE TABLE public.task_intelligence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  
  -- Task Complexity & Effort
  complexity_score numeric(3,1) DEFAULT 5.0 CHECK (complexity_score BETWEEN 1 AND 10),
  effort_points integer DEFAULT 1,
  task_size text DEFAULT 'M' CHECK (task_size IN ('XS', 'S', 'M', 'L', 'XL')),
  confidence_level numeric(3,1) DEFAULT 5.0 CHECK (confidence_level BETWEEN 1 AND 10),
  
  -- Dependencies & Relationships
  dependency_weight numeric(3,1) DEFAULT 1.0,
  prerequisite_tasks text[] DEFAULT ARRAY[],
  parallel_task_capacity integer DEFAULT 1,
  
  -- Context & Environment
  requires_deep_focus boolean DEFAULT false,
  collaboration_intensity text DEFAULT 'Medium' CHECK (collaboration_intensity IN ('Low', 'Medium', 'High')),
  context_switching_penalty numeric(3,1) DEFAULT 5.0 CHECK (context_switching_penalty BETWEEN 1 AND 10),
  knowledge_transfer_required boolean DEFAULT false,
  
  -- Auto-tracking (Task-based)
  actual_complexity numeric(3,1),
  completion_percentage numeric(5,2) DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  blocker_count integer DEFAULT 0,
  rework_cycles integer DEFAULT 0,
  
  -- Status & Timeline
  status text DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled', 'Blocked')),
  priority text DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  assigned_resources text[] DEFAULT ARRAY[],
  
  -- AI Learning Data
  estimated_completion_time numeric(8,2), -- Hours
  actual_completion_time numeric(8,2), -- Hours
  quality_score numeric(3,1) CHECK (quality_score IS NULL OR quality_score BETWEEN 1 AND 10),
  
  -- Temporal data
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- ==============================================================================
-- 5. TASK SKILL REQUIREMENTS TABLE
-- ==============================================================================

CREATE TABLE public.task_skill_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.task_intelligence(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL,
  skill_name text NOT NULL,
  required_proficiency_level numeric(3,1) NOT NULL CHECK (required_proficiency_level BETWEEN 1 AND 10),
  is_mandatory boolean DEFAULT true,
  alternative_skills text[] DEFAULT ARRAY[],
  requirement_type text DEFAULT 'primary' CHECK (requirement_type IN ('primary', 'nice_to_have', 'learning_opportunity')),
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(task_id, skill_id, requirement_type)
);

-- ==============================================================================
-- 6. AUTOMATED DATA COLLECTION TABLES
-- ==============================================================================

-- Git commit tracking
CREATE TABLE public.task_git_commits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.task_intelligence(id) ON DELETE CASCADE,
  commit_hash text NOT NULL,
  timestamp timestamp with time zone NOT NULL,
  lines_added integer DEFAULT 0,
  lines_removed integer DEFAULT 0,
  files_changed integer DEFAULT 0,
  commit_message text,
  author text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(task_id, commit_hash)
);

-- Communication thread tracking
CREATE TABLE public.task_communication_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.task_intelligence(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('slack', 'teams', 'email', 'comments')),
  thread_id text NOT NULL,
  message_count integer DEFAULT 0,
  participants text[] DEFAULT ARRAY[],
  started_at timestamp with time zone NOT NULL,
  last_activity timestamp with time zone NOT NULL,
  sentiment_score numeric(3,2) CHECK (sentiment_score IS NULL OR sentiment_score BETWEEN -1 AND 1),
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(task_id, platform, thread_id)
);

-- Help request tracking
CREATE TABLE public.task_help_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.task_intelligence(id) ON DELETE CASCADE,
  requested_at timestamp with time zone NOT NULL,
  resolved_at timestamp with time zone,
  help_type text NOT NULL CHECK (help_type IN ('technical', 'clarification', 'approval', 'resource')),
  resolution_time_minutes integer,
  helped_by text,
  created_at timestamp with time zone DEFAULT now()
);

-- ==============================================================================
-- 7. TASK COMPLETION PATTERNS TABLE
-- ==============================================================================

CREATE TABLE public.task_completion_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.resource_profiles(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.task_intelligence(id) ON DELETE CASCADE,
  completion_day_of_week text NOT NULL,
  completion_time_of_day text NOT NULL,
  task_complexity numeric(3,1) NOT NULL,
  completion_duration_hours numeric(8,2) NOT NULL,
  quality_score numeric(3,1) NOT NULL CHECK (quality_score BETWEEN 1 AND 10),
  required_help_requests integer DEFAULT 0,
  context_switches_during_task integer DEFAULT 0,
  completed_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- ==============================================================================
-- 8. PROJECT INTELLIGENCE ENHANCEMENTS
-- ==============================================================================

-- Add enhanced fields to existing projects table
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS estimated_total_tasks integer DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS average_task_complexity numeric(3,1) DEFAULT 5.0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS concurrent_task_limit integer DEFAULT 10;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS current_task_utilization numeric(5,2) DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS health_score numeric(5,2) DEFAULT 50;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS task_completion_rate numeric(5,2) DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS collaboration_complexity numeric(3,1) DEFAULT 1;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS communication_overhead numeric(3,1) DEFAULT 1;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS predicted_end_date date;

-- ==============================================================================
-- 9. ANALYTICS & AI TABLES
-- ==============================================================================

-- Resource utilization metrics
CREATE TABLE public.resource_utilization_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.resource_profiles(id) ON DELETE CASCADE,
  date_recorded date NOT NULL,
  period_type text NOT NULL CHECK (period_type IN ('day', 'week', 'month')),
  
  -- Core Metrics
  task_count integer NOT NULL,
  task_capacity integer NOT NULL,
  utilization_percentage numeric(5,2) NOT NULL,
  
  -- Weighted Utilization
  weighted_task_load numeric(8,2) NOT NULL,
  weighted_capacity numeric(8,2) NOT NULL,
  weighted_utilization numeric(5,2) NOT NULL,
  
  -- Task Distribution
  simple_tasks integer DEFAULT 0,
  medium_tasks integer DEFAULT 0,
  complex_tasks integer DEFAULT 0,
  
  -- Status & Predictions
  status text NOT NULL,
  utilization_trend text DEFAULT 'Stable' CHECK (utilization_trend IN ('Increasing', 'Stable', 'Decreasing')),
  predicted_completion_count integer DEFAULT 0,
  bottleneck_risk text DEFAULT 'Low' CHECK (bottleneck_risk IN ('Low', 'Medium', 'High')),
  context_switch_penalty numeric(3,1) DEFAULT 0,
  
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(resource_id, date_recorded, period_type)
);

-- AI assignment recommendations
CREATE TABLE public.ai_assignment_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resource_profiles(id) ON DELETE CASCADE,
  
  -- Scoring
  task_capacity_fit_score numeric(3,2) NOT NULL CHECK (task_capacity_fit_score BETWEEN 0 AND 1),
  complexity_handling_fit numeric(3,2) NOT NULL CHECK (complexity_handling_fit BETWEEN 0 AND 1),
  task_variety_preference numeric(3,2) NOT NULL CHECK (task_variety_preference BETWEEN 0 AND 1),
  
  -- Availability
  available_task_slots integer NOT NULL,
  
  -- Predictions
  task_completion_forecast numeric(3,2) NOT NULL,
  quality_prediction numeric(3,1) NOT NULL CHECK (quality_prediction BETWEEN 1 AND 10),
  learning_growth_potential numeric(3,2) NOT NULL CHECK (learning_growth_potential BETWEEN 0 AND 1),
  
  -- Risk Assessment
  task_overload_risk text NOT NULL CHECK (task_overload_risk IN ('Low', 'Medium', 'High')),
  context_switching_impact numeric(3,1) NOT NULL,
  
  -- Metadata
  recommendation_confidence numeric(3,2) NOT NULL CHECK (recommendation_confidence BETWEEN 0 AND 1),
  reasoning jsonb,
  recommended_tasks text[] DEFAULT ARRAY[],
  
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '7 days'),
  
  UNIQUE(project_id, resource_id, created_at)
);

-- ==============================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Resource profile indexes
CREATE INDEX idx_resource_profiles_workspace_id ON public.resource_profiles(workspace_id);
CREATE INDEX idx_resource_profiles_department_id ON public.resource_profiles(department_id);
CREATE INDEX idx_resource_profiles_status ON public.resource_profiles(status);
CREATE INDEX idx_resource_profiles_seniority ON public.resource_profiles(seniority_level);

-- Skill proficiency indexes
CREATE INDEX idx_skill_proficiencies_resource_id ON public.skill_proficiencies(resource_id);
CREATE INDEX idx_skill_proficiencies_skill_id ON public.skill_proficiencies(skill_id);
CREATE INDEX idx_skill_proficiencies_type ON public.skill_proficiencies(skill_type);

-- Task intelligence indexes
CREATE INDEX idx_task_intelligence_project_id ON public.task_intelligence(project_id);
CREATE INDEX idx_task_intelligence_status ON public.task_intelligence(status);
CREATE INDEX idx_task_intelligence_complexity ON public.task_intelligence(complexity_score);
CREATE INDEX idx_task_intelligence_assigned_resources ON public.task_intelligence USING gin(assigned_resources);

-- Utilization metrics indexes
CREATE INDEX idx_utilization_metrics_resource_date ON public.resource_utilization_metrics(resource_id, date_recorded);
CREATE INDEX idx_utilization_metrics_period ON public.resource_utilization_metrics(period_type, date_recorded);

-- ==============================================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.resource_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_proficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_recurring_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_git_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_communication_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completion_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_utilization_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assignment_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies (workspace-based access)
CREATE POLICY "Users can access resources in their workspace" ON public.resource_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members wm 
      WHERE wm.workspace_id = resource_profiles.workspace_id 
      AND wm.user_id = auth.uid()
    )
  );

-- Apply similar policies to other tables...
CREATE POLICY "Users can access skill proficiencies in their workspace" ON public.skill_proficiencies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.resource_profiles rp
      JOIN public.workspace_members wm ON wm.workspace_id = rp.workspace_id
      WHERE rp.id = skill_proficiencies.resource_id
      AND wm.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 12. TRIGGERS FOR AUTOMATIC UPDATES
-- ==============================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resource_profiles_updated_at BEFORE UPDATE ON public.resource_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_proficiencies_updated_at BEFORE UPDATE ON public.skill_proficiencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_intelligence_updated_at BEFORE UPDATE ON public.task_intelligence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 13. INITIAL DATA SEEDING FUNCTIONS
-- ==============================================================================

-- Function to migrate existing resource data
CREATE OR REPLACE FUNCTION migrate_legacy_resources()
RETURNS void AS $$
DECLARE
  legacy_resource RECORD;
BEGIN
  -- Check if old resources table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'resources') THEN
    -- Insert legacy data into new structure
    FOR legacy_resource IN 
      SELECT id, name, email, role, department, workspace_id, created_at, updated_at
      FROM public.resources
    LOOP
      INSERT INTO public.resource_profiles (
        id, employee_id, name, email, role, workspace_id, created_at, updated_at
      ) VALUES (
        legacy_resource.id,
        legacy_resource.id, -- Use ID as employee_id for legacy data
        legacy_resource.name,
        COALESCE(legacy_resource.email, legacy_resource.name || '@company.com'),
        COALESCE(legacy_resource.role, 'Team Member'),
        legacy_resource.workspace_id,
        COALESCE(legacy_resource.created_at, now()),
        COALESCE(legacy_resource.updated_at, now())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;