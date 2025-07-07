
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AssignmentsTabProps {
  onShowAssignmentModal: () => void;
}

const AssignmentsTab = ({ onShowAssignmentModal }: AssignmentsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignment Management</CardTitle>
        <CardDescription>
          Manage task assignments and workload distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Assignment management interface coming soon...
          </p>
          <Button onClick={onShowAssignmentModal}>
            Create New Assignment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentsTab;
