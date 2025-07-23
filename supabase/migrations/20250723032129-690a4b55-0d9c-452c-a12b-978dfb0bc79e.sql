-- Create AI user settings table
CREATE TABLE public.ai_user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  use_ai_analysis BOOLEAN NOT NULL DEFAULT true,
  preferred_model TEXT NOT NULL DEFAULT 'auto',
  chat_personality TEXT NOT NULL DEFAULT 'professional',
  context_awareness_level TEXT NOT NULL DEFAULT 'standard',
  conversation_history_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own AI settings"
ON public.ai_user_settings
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add foreign key constraints
ALTER TABLE public.ai_user_settings 
ADD CONSTRAINT fk_ai_settings_workspace 
FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Create trigger for updated_at
CREATE TRIGGER update_ai_user_settings_updated_at
  BEFORE UPDATE ON public.ai_user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_ai_user_settings_user_workspace ON public.ai_user_settings(user_id, workspace_id);

-- Create AI conversation history table
CREATE TABLE public.ai_conversation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  conversation_type TEXT NOT NULL DEFAULT 'tink_assistant',
  message_role TEXT NOT NULL, -- 'user' or 'assistant'
  message_content TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for conversation history
ALTER TABLE public.ai_conversation_history ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation history
CREATE POLICY "Users can manage their own conversation history"
ON public.ai_conversation_history
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add foreign key constraint
ALTER TABLE public.ai_conversation_history 
ADD CONSTRAINT fk_conversation_workspace 
FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Create index for conversation history
CREATE INDEX idx_conversation_history_user_workspace ON public.ai_conversation_history(user_id, workspace_id);
CREATE INDEX idx_conversation_history_type_created ON public.ai_conversation_history(conversation_type, created_at DESC);