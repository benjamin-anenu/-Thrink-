
import { useState, useEffect } from 'react';

export interface AISettings {
  useAIAnalysis: boolean;
  preferredModel: 'auto' | 'gpt-4o-mini' | 'claude-3-haiku' | 'mistral-7b';
}

export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>({
    useAIAnalysis: true,
    preferredModel: 'auto'
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('ai-insights-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Error parsing AI settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('ai-insights-settings', JSON.stringify(updatedSettings));
  };

  return {
    settings,
    updateSettings
  };
};
