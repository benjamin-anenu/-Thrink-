
-- Create skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource_skills table
CREATE TABLE public.resource_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 5),
  years_experience INTEGER CHECK (years_experience >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(resource_id, skill_id)
);

-- Enable RLS on skills table
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

-- Create policy for skills - allow read access to all authenticated users
CREATE POLICY "Allow read access to all skills" 
  ON public.skills 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy for skills - allow workspace members to manage skills
CREATE POLICY "Allow workspace members to manage skills" 
  ON public.skills 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS on resource_skills table
ALTER TABLE public.resource_skills ENABLE ROW LEVEL SECURITY;

-- Create policy for resource_skills - allow read access to all authenticated users
CREATE POLICY "Allow read access to resource_skills" 
  ON public.resource_skills 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create policy for resource_skills - allow workspace members to manage resource skills
CREATE POLICY "Allow workspace members to manage resource skills" 
  ON public.resource_skills 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert some default skills
INSERT INTO public.skills (name) VALUES 
  ('JavaScript'),
  ('TypeScript'),
  ('React'),
  ('Node.js'),
  ('Python'),
  ('Java'),
  ('Project Management'),
  ('UI/UX Design'),
  ('Database Design'),
  ('DevOps')
ON CONFLICT (name) DO NOTHING;
