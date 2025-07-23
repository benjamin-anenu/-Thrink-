import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useEscalationTriggers } from '@/hooks/useEscalationTriggers';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EscalationTriggersManagement: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const { triggers, loading, error, createTrigger } = useEscalationTriggers(currentWorkspace?.id || '');

  const handleCreateTrigger = () => {
    createTrigger(
      'New Trigger',
      'Task',
      'overdue',
      '1 day',
      currentWorkspace?.id || ''
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
        </AlertDescription>
      </Alert>
    );
  }

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
                    {trigger.name} - {trigger.trigger_type}
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
