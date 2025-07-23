
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Zap, Brain, Clock } from 'lucide-react';
import { EnhancedTinkService, ModelOption } from '@/services/EnhancedTinkService';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  compact?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange, 
  compact = false 
}) => {
  const models = EnhancedTinkService.getAvailableModels();
  
  const getCostColor = (tier: string) => {
    switch (tier) {
      case 'free': return 'bg-green-500';
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getModelIcon = (modelName: string) => {
    if (modelName.includes('claude')) return <Brain className="w-4 h-4" />;
    if (modelName.includes('gpt')) return <Sparkles className="w-4 h-4" />;
    if (modelName.includes('llama')) return <Zap className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select AI Model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex items-center gap-2">
                  {getModelIcon(model.name)}
                  <span className="font-medium">{model.name}</span>
                  <Badge 
                    variant="secondary" 
                    className={`${getCostColor(model.costTier)} text-white text-xs`}
                  >
                    {model.costTier}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Choose AI Model</h3>
      </div>
      
      <div className="grid gap-3">
        {models.map((model) => (
          <Card 
            key={model.id}
            className={`cursor-pointer transition-all duration-200 ${
              selectedModel === model.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onModelChange(model.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getModelIcon(model.name)}
                  <CardTitle className="text-sm font-medium">{model.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="secondary" 
                    className={`${getCostColor(model.costTier)} text-white text-xs`}
                  >
                    {model.costTier}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {model.provider}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-xs">
                {model.description}
              </CardDescription>
              <div className="mt-2 text-xs text-muted-foreground">
                Context: {model.contextWindow.toLocaleString()} tokens
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <div className="text-sm text-muted-foreground">
          <strong>Cost Tiers:</strong>
          <div className="flex flex-wrap gap-2 mt-1">
            <Badge className="bg-green-500 text-white text-xs">Free</Badge>
            <Badge className="bg-blue-500 text-white text-xs">Low cost</Badge>
            <Badge className="bg-yellow-500 text-white text-xs">Medium cost</Badge>
            <Badge className="bg-orange-500 text-white text-xs">High performance</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelSelector;
