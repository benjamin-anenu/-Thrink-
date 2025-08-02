
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading-state';

const ProjectTimeline: React.FC = () => {
  const { projectId } = useParams();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Project timeline functionality will be implemented here.
          </p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Project ID: {projectId}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTimeline;
