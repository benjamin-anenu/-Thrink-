
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useEscalationTriggers } from '@/hooks/useEscalationTriggers';

export const EscalationTriggerManager = () => {
  const { triggers, loading, updateTrigger } = useEscalationTriggers();

  const handleToggle = async (id: string, isActive: boolean) => {
    await updateTrigger(id, { is_active: isActive });
  };

  const handleThresholdUpdate = async (id: string, value: number) => {
    await updateTrigger(id, { threshold_value: value });
  };

  if (loading) {
    return <div>Loading escalation triggers...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Escalation Trigger Configuration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure which conditions should trigger escalations in your projects
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{trigger.name}</h4>
                    <Badge variant={trigger.is_active ? "default" : "secondary"}>
                      {trigger.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {trigger.description && (
                    <p className="text-sm text-muted-foreground">{trigger.description}</p>
                  )}
                  {trigger.threshold_value !== null && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Threshold:</Label>
                      <Input
                        type="number"
                        value={trigger.threshold_value}
                        onChange={(e) => handleThresholdUpdate(trigger.id, parseInt(e.target.value))}
                        className="w-20 h-8"
                        min="0"
                      />
                      <span className="text-xs text-muted-foreground">{trigger.threshold_unit}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={trigger.is_active}
                    onCheckedChange={(checked) => handleToggle(trigger.id, checked)}
                  />
                  <Label className="text-sm">Enable</Label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
