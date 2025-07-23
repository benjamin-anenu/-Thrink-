
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAISettings } from '@/hooks/useAISettings';
import { Brain, Settings, Zap, Sparkles, Cpu, BarChart3 } from 'lucide-react';

const AIInsightsSettings: React.FC = () => {
  const { settings, updateSettings, loading } = useAISettings();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Analysis Settings
        </CardTitle>
        <CardDescription>
          Configure your AI-powered analysis preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="ai-analysis">Enable AI Analysis</Label>
            <p className="text-sm text-muted-foreground">
              Use advanced AI to analyze resource assignments and capacity
            </p>
          </div>
          <Switch
            id="ai-analysis"
            checked={settings.useAIAnalysis}
            onCheckedChange={(checked) => updateSettings({ useAIAnalysis: checked })}
          />
        </div>

        {settings.useAIAnalysis && (
          <>
            <div className="space-y-2">
              <Label htmlFor="ai-model">Preferred AI Model</Label>
              <Select 
                value={settings.preferredModel} 
                onValueChange={(value) => updateSettings({ preferredModel: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <div>
                        <div>Auto (Recommended)</div>
                        <div className="text-xs text-muted-foreground">Best model for the task</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="gpt-4o-mini">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <div>
                        <div>GPT-4o Mini</div>
                        <div className="text-xs text-muted-foreground">Fast and efficient</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="claude-3-haiku">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <div>
                        <div>Claude 3 Haiku</div>
                        <div className="text-xs text-muted-foreground">Balanced performance</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="mistral-7b">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <div>
                        <div>Mistral 7B</div>
                        <div className="text-xs text-muted-foreground">Open source option</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chat-personality">Chat Personality</Label>
              <Select 
                value={settings.chatPersonality} 
                onValueChange={(value) => updateSettings({ chatPersonality: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select personality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context-level">Context Awareness</Label>
              <Select 
                value={settings.contextAwarenessLevel} 
                onValueChange={(value) => updateSettings({ contextAwarenessLevel: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select context level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="pt-2 text-sm text-muted-foreground">
          {settings.useAIAnalysis ? (
            <div className="flex items-center gap-2 text-emerald-600">
              <Brain className="h-4 w-4" />
              AI Mode: Advanced analysis with personalized insights
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Basic Mode: Standard metrics and insights
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsSettings;
