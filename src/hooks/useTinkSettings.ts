
import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface TinkSettings {
  selectedModel: string;
  preferredMode: 'agent' | 'chat';
  showAdvancedOptions: boolean;
}

export const useTinkSettings = () => {
  const { currentWorkspace } = useWorkspace();
  const [settings, setSettings] = useState<TinkSettings>({
    selectedModel: 'anthropic/claude-3.5-sonnet',
    preferredMode: 'agent',
    showAdvancedOptions: false
  });

  useEffect(() => {
    if (currentWorkspace) {
      loadSettings();
    }
  }, [currentWorkspace]);

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem(`tink-settings-${currentWorkspace?.id}`);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading Tink settings:', error);
    }
  };

  const updateSettings = (newSettings: Partial<TinkSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (currentWorkspace) {
      try {
        localStorage.setItem(
          `tink-settings-${currentWorkspace.id}`, 
          JSON.stringify(updatedSettings)
        );
      } catch (error) {
        console.error('Error saving Tink settings:', error);
      }
    }
  };

  return {
    settings,
    updateSettings
  };
};
