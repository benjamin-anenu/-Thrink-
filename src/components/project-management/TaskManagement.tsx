
import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';

interface TaskManagementProps {
  projectId: string;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ projectId }) => {
  const { tasks, loading } = useTasks(projectId);

  if (loading) {
    return <LoadingState>Loading tasks...</LoadingState>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Task management functionality will be implemented here.
          </p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Total Tasks: {tasks.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskManagement;
