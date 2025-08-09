import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectOverview } from '@/hooks/useSystemOwnerOverview';

interface Props {
  projects: ProjectOverview[];
}

const SystemOwnerProjectList: React.FC<Props> = ({ projects }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects (real-time)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Workspace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tasks</TableHead>
                <TableHead className="w-48">Progress</TableHead>
                <TableHead>Issues Open</TableHead>
                <TableHead>Overdue</TableHead>
                <TableHead>Next Milestone</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.workspaceName}</TableCell>
                  <TableCell>
                    <Badge variant={p.overdueTasks > 0 || p.issuesOpen > 0 ? 'secondary' : 'default'}>
                      {p.status ?? 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.tasksCompleted}/{p.tasksTotal}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={p.progress} className="h-2 w-32" />
                      <span className="text-xs text-muted-foreground">{p.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{p.issuesOpen}</TableCell>
                  <TableCell>{p.overdueTasks}</TableCell>
                  <TableCell>
                    {p.nextMilestone ? (
                      <div className="text-sm">
                        <div className="font-medium truncate max-w-[180px]">{p.nextMilestone.name}</div>
                        <div className="text-muted-foreground text-xs">{p.nextMilestone.dueDate?.toString()}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.lastUpdated ? new Date(p.lastUpdated).toLocaleString() : '—'}</TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-8">
                    No projects found for the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemOwnerProjectList;
