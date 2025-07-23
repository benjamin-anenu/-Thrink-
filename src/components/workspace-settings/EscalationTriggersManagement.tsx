import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useEscalationTriggers } from '@/hooks/useEscalationTriggers';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EscalationTriggersManagement: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const { triggers, loading, createTrigger } = useEscalationTriggers();

  const handleCreateTrigger = () => {
    createTrigger(
      'New Trigger',
      'Automatic trigger for overdue tasks',
      'overdue',
      1,
      'day'
    );
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Escalation Triggers</CardTitle>
        <CardDescription>Manage automated escalation triggers for your workspace</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            Loading escalation triggers...
          </div>
        ) : (
          <div className="space-y-4">
            {triggers.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No escalation triggers configured yet.
              </div>
            ) : (
              <ul>
                {triggers.map(trigger => (
                  <li key={trigger.id}>
                    {trigger.name} - {trigger.condition_type}
                  </li>
                ))}
              </ul>
            )}
            <Button onClick={handleCreateTrigger}>Create New Trigger</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EscalationTriggersManagement;
