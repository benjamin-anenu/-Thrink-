
-- Create enhanced resource management tables

-- Resource profiles table for AI-powered resource management
CREATE TABLE IF NOT EXISTS public.resource_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    employee_id TEXT,
    seniority_level TEXT CHECK (seniority_level IN ('Junior', 'Mid', 'Senior', 'Lead', 'Principal')),
    
    -- Task handling patterns
    optimal_task_count_per_day INTEGER DEFAULT 3,
    optimal_task_count_per_week INTEGER DEFAULT 15,
    timezone TEXT DEFAULT 'UTC',
    work_days TEXT[] DEFAULT ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday'],
    preferred_work_style TEXT CHECK (preferred_work_style IN ('Deep Focus', 'Collaborative', 'Mixed')),
    task_switching_preference TEXT CHECK (task_switching_preference IN ('Sequential', 'Parallel', 'Batched')),
    
    -- Performance metrics (auto-calculated)
    historical_task_velocity DECIMAL DEFAULT 0.8,
    complexity_handling_score INTEGER DEFAULT 5 CHECK (complexity_handling_score >= 1 AND complexity_handling_score <= 10),
    collaboration_effectiveness DECIMAL DEFAULT 0.7,
    learning_task_success_rate DECIMAL DEFAULT 0.75,
    
    -- Task productivity patterns
    peak_productivity_periods TEXT[] DEFAULT ARRAY['9:00-11:00', '14:00-16:00'],
    task_switching_penalty_score INTEGER DEFAULT 5 CHECK (task_switching_penalty_score >= 1 AND task_switching_penalty_score <= 10),
    new_project_ramp_up_tasks INTEGER DEFAULT 3,
    
    -- Contract & availability
    employment_type TEXT CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Consultant')),
    contract_end_date DATE,
    planned_time_off JSONB DEFAULT '[]',
    recurring_commitments JSONB DEFAULT '[]',
    
    -- AI enhancement data
    strength_keywords TEXT[] DEFAULT ARRAY[],
    growth_areas TEXT[] DEFAULT ARRAY[],
    career_aspirations TEXT[] DEFAULT ARRAY[],
    mentorship_capacity BOOLEAN DEFAULT false,
    
    -- Status tracking
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_projects TEXT[] DEFAULT ARRAY[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill proficiencies table
CREATE TABLE IF NOT EXISTS public.skill_proficiencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    skill_name TEXT NOT NULL,
    proficiency_level INTEGER DEFAULT 5 CHECK (proficiency_level >= 1 AND proficiency_level <= 10),
    years_experience INTEGER DEFAULT 0,
    last_used DATE DEFAULT CURRENT_DATE,
    confidence_score INTEGER DEFAULT 5 CHECK (confidence_score >= 1 AND confidence_score <= 10),
    certification_level TEXT,
    improvement_trend TEXT CHECK (improvement_trend IN ('Improving', 'Stable', 'Declining')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task skill requirements table
CREATE TABLE IF NOT EXISTS public.task_skill_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL,
    skill_id UUID NOT NULL,
    skill_name TEXT NOT NULL,
    requirement_type TEXT DEFAULT 'primary' CHECK (requirement_type IN ('primary', 'secondary', 'nice_to_have', 'learning_opportunity')),
    minimum_proficiency INTEGER DEFAULT 5 CHECK (minimum_proficiency >= 1 AND minimum_proficiency <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource utilization metrics table
CREATE TABLE IF NOT EXISTS public.resource_utilization_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    
    -- Period tracking
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT DEFAULT 'week' CHECK (period_type IN ('day', 'week', 'month')),
    
    -- Task-based metrics
    task_count INTEGER DEFAULT 0,
    task_capacity INTEGER DEFAULT 15,
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
    utilization_status TEXT DEFAULT 'Well Utilized',
    context_switch_penalty DECIMAL DEFAULT 0,
    bottleneck_risk_score INTEGER DEFAULT 0 CHECK (bottleneck_risk_score >= 0 AND bottleneck_risk_score <= 10),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.resource_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_proficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_utilization_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage resource profiles in their workspace" ON public.resource_profiles
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can manage skill proficiencies in their workspace" ON public.skill_proficiencies
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can manage task skill requirements in their workspace" ON public.task_skill_requirements  
    FOR ALL USING (
        task_id IN (
            SELECT pt.id FROM public.project_tasks pt
            JOIN public.projects p ON p.id = pt.project_id
            JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
            WHERE wm.user_id = auth.uid() AND wm.status = 'active'
        )
    );

CREATE POLICY "Users can manage utilization metrics in their workspace" ON public.resource_utilization_metrics
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM public.workspace_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_resource_profiles_resource_id ON public.resource_profiles(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_profiles_workspace_id ON public.resource_profiles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_skill_proficiencies_resource_id ON public.skill_proficiencies(resource_id);
CREATE INDEX IF NOT EXISTS idx_skill_proficiencies_workspace_id ON public.skill_proficiencies(workspace_id);
CREATE INDEX IF NOT EXISTS idx_task_skill_requirements_task_id ON public.task_skill_requirements(task_id);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_metrics_resource_id ON public.resource_utilization_metrics(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_metrics_workspace_id ON public.resource_utilization_metrics(workspace_id);

-- Create function to populate initial resource profiles
CREATE OR REPLACE FUNCTION public.populate_initial_resource_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert sample resource profiles for existing resources
    INSERT INTO public.resource_profiles (
        resource_id, workspace_id, employee_id, seniority_level,
        optimal_task_count_per_day, optimal_task_count_per_week,
        preferred_work_style, task_switching_preference,
        historical_task_velocity, complexity_handling_score,
        collaboration_effectiveness, learning_task_success_rate,
        employment_type, strength_keywords, growth_areas
    )
    SELECT 
        r.id,
        r.workspace_id,
        'EMP-' || SUBSTR(r.id::text, 1, 8),
        CASE 
            WHEN r.role ILIKE '%senior%' THEN 'Senior'
            WHEN r.role ILIKE '%lead%' THEN 'Lead'
            WHEN r.role ILIKE '%junior%' THEN 'Junior'
            ELSE 'Mid'
        END,
        CASE 
            WHEN r.role ILIKE '%manager%' THEN 2
            WHEN r.role ILIKE '%senior%' THEN 4
            ELSE 3
        END,
        CASE 
            WHEN r.role ILIKE '%manager%' THEN 10
            WHEN r.role ILIKE '%senior%' THEN 20
            ELSE 15
        END,
        CASE 
            WHEN r.role ILIKE '%developer%' THEN 'Deep Focus'
            WHEN r.role ILIKE '%designer%' THEN 'Collaborative'
            ELSE 'Mixed'
        END,
        'Sequential',
        0.8 + (RANDOM() * 0.4), -- 0.8 to 1.2
        5 + FLOOR(RANDOM() * 5), -- 5 to 9
        0.6 + (RANDOM() * 0.3), -- 0.6 to 0.9
        0.7 + (RANDOM() * 0.2), -- 0.7 to 0.9
        'Full-time',
        ARRAY[LOWER(SPLIT_PART(r.role, ' ', 1)), LOWER(SPLIT_PART(r.role, ' ', -1))],
        ARRAY['Communication', 'Time Management']
    FROM public.resources r
    WHERE NOT EXISTS (
        SELECT 1 FROM public.resource_profiles rp 
        WHERE rp.resource_id = r.id
    );

    -- Insert sample utilization metrics
    INSERT INTO public.resource_utilization_metrics (
        resource_id, workspace_id, period_start, period_end,
        task_count, task_capacity, utilization_percentage,
        weighted_task_load, weighted_capacity, weighted_utilization,
        simple_tasks, medium_tasks, complex_tasks,
        tasks_completed, utilization_status, bottleneck_risk_score
    )
    SELECT 
        r.id,
        r.workspace_id,
        CURRENT_DATE - INTERVAL '7 days',
        CURRENT_DATE,
        5 + FLOOR(RANDOM() * 10), -- 5 to 14 tasks
        15,
        (5 + FLOOR(RANDOM() * 10)) * 100.0 / 15, -- Calculate percentage
        25 + (RANDOM() * 50), -- 25 to 75 weighted load
        75,
        (25 + (RANDOM() * 50)) * 100.0 / 75, -- Calculate weighted percentage
        2 + FLOOR(RANDOM() * 3), -- 2 to 4 simple tasks
        2 + FLOOR(RANDOM() * 4), -- 2 to 5 medium tasks
        1 + FLOOR(RANDOM() * 3), -- 1 to 3 complex tasks
        3 + FLOOR(RANDOM() * 5), -- 3 to 7 completed
        CASE 
            WHEN (5 + FLOOR(RANDOM() * 10)) > 12 THEN 'Overloaded'
            WHEN (5 + FLOOR(RANDOM() * 10)) < 8 THEN 'Underutilized'
            ELSE 'Well Utilized'
        END,
        FLOOR(RANDOM() * 6) -- 0 to 5 risk score
    FROM public.resources r
    WHERE NOT EXISTS (
        SELECT 1 FROM public.resource_utilization_metrics rum 
        WHERE rum.resource_id = r.id AND rum.period_start = CURRENT_DATE - INTERVAL '7 days'
    );
END;
$$;

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_resource_profiles_updated_at BEFORE UPDATE ON public.resource_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_skill_proficiencies_updated_at BEFORE UPDATE ON public.skill_proficiencies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_utilization_metrics_updated_at BEFORE UPDATE ON public.resource_utilization_metrics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
