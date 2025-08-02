
-- Add missing columns to the resources table to support all resource features
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS location text DEFAULT 'Remote',
ADD COLUMN IF NOT EXISTS availability integer DEFAULT 100,
ADD COLUMN IF NOT EXISTS employment_type text DEFAULT 'Full-time',
ADD COLUMN IF NOT EXISTS seniority_level text DEFAULT 'Mid-Level',
ADD COLUMN IF NOT EXISTS mentorship_capacity boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notes text;
