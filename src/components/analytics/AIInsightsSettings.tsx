
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAISettings } from '@/hooks/useAISettings';
import { Brain, Settings, Zap, Clock } from 'lucide-react';

const AIInsightsSettings: React.FC = () => {
  const { settings, updateSettings } = useAISettings();

  const modelOptions = [
    { value: 'auto', label: 'Auto (Smart Selection)', icon: Brain, description: 'Automatically selects best model' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini', icon: Zap, description: 'Fast, efficient analysis' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku', icon: Clock, description: 'Balanced performance' },
    { value: 'mistral-7b', label: 'Mistral 7B', icon: Settings, description: 'Cost-effective option' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Analysis Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="ai-toggle" className="text-sm font-medium">
              AI-Powered Analysis
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable advanced AI analysis for detailed skill gap insights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="ai-toggle"
              checked={settings.useAIAnalysis}
              onCheckedChange={(checked) => updateSettings({ useAIAnalysis: checked })}
            />
            <Badge variant={settings.useAIAnalysis ? "default" : "secondary"}>
              {settings.useAIAnalysis ? "AI Enabled" : "Basic Mode"}
            </Badge>
          </div>
        </div>

        {settings.useAIAnalysis && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preferred AI Model</Label>
            <Select
              value={settings.preferredModel}
              onValueChange={(value) => updateSettings({ preferredModel: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <p className="mb-1">
            <strong>AI Mode:</strong> Provides detailed skill gap analysis, specific training recommendations, and contextual insights.
          </p>
          <p>
            <strong>Basic Mode:</strong> Uses rule-based analysis with general recommendations and faster processing.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightsSettings;
