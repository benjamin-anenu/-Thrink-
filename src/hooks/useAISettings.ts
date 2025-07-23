
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface AISettings {
  useAIAnalysis: boolean;
  preferredModel: 'auto' | 'gpt-4o-mini' | 'claude-3-haiku' | 'mistral-7b';
  chatPersonality: 'professional' | 'friendly' | 'technical';
  contextAwarenessLevel: 'basic' | 'standard' | 'advanced';
  conversationHistoryEnabled: boolean;
}

export const useAISettings = () => {
  const { currentWorkspace } = useWorkspace();
  const [settings, setSettings] = useState<AISettings>({
    useAIAnalysis: true,
    preferredModel: 'auto',
    chatPersonality: 'professional',
    contextAwarenessLevel: 'standard',
    conversationHistoryEnabled: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentWorkspace) {
      loadSettings();
    }
  }, [currentWorkspace]);

  const loadSettings = async () => {
    if (!currentWorkspace) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('ai_user_settings')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('workspace_id', currentWorkspace.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading AI settings:', error);
        return;
      }

      if (data) {
        setSettings({
          useAIAnalysis: data.use_ai_analysis,
          preferredModel: data.preferred_model as AISettings['preferredModel'],
          chatPersonality: data.chat_personality as AISettings['chatPersonality'],
          contextAwarenessLevel: data.context_awareness_level as AISettings['contextAwarenessLevel'],
          conversationHistoryEnabled: data.conversation_history_enabled
        });
      } else {
        // Create default settings if they don't exist
        await createDefaultSettings(user.user.id, currentWorkspace.id);
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async (userId: string, workspaceId: string) => {
    const { error } = await supabase
      .from('ai_user_settings')
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        use_ai_analysis: true,
        preferred_model: 'auto',
        chat_personality: 'professional',
        context_awareness_level: 'standard',
        conversation_history_enabled: true
      });

    if (error) {
      console.error('Error creating default AI settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AISettings>) => {
    if (!currentWorkspace) return;

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('ai_user_settings')
        .upsert({
          user_id: user.user.id,
          workspace_id: currentWorkspace.id,
          use_ai_analysis: updatedSettings.useAIAnalysis,
          preferred_model: updatedSettings.preferredModel,
          chat_personality: updatedSettings.chatPersonality,
          context_awareness_level: updatedSettings.contextAwarenessLevel,
          conversation_history_enabled: updatedSettings.conversationHistoryEnabled
        });

      if (error) {
        console.error('Error updating AI settings:', error);
        // Revert local state on error
        setSettings(settings);
      }
    } catch (error) {
      console.error('Error updating AI settings:', error);
      setSettings(settings);
    }
  };

  return {
    settings,
    updateSettings,
    loading
  };
};
