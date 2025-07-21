
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { IssueStatusBadge } from '@/components/ui/issue-status-badge';
import { AlertTriangle, Edit2, Trash2, Save, X, ExternalLink } from 'lucide-react';
import { ProjectIssue } from '@/types/issue';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface IssueLogTableProps {
  issues: ProjectIssue[];
  loading: boolean;
  onUpdateIssue: (issueId: string, updates: Partial<ProjectIssue>) => Promise<any>;
  onDeleteIssue: (issueId: string) => Promise<void>;
  projectId: string;
  density?: 'compact' | 'normal' | 'comfortable';
}

export const IssueLogTable = ({ 
  issues, 
  loading, 
  onUpdateIssue, 
  onDeleteIssue,
  projectId,
  density = 'compact'
}: IssueLogTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProjectIssue>>({});

  const startEdit = (issue: ProjectIssue) => {
    setEditingId(issue.id);
    setEditForm({ ...issue });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (editingId && editForm) {
      try {
        await onUpdateIssue(editingId, editForm);
        setEditingId(null);
        setEditForm({});
      } catch (error) {
        console.error('Failed to save issue:', error);
      }
    }
  };

  const handleDelete = async (issueId: string) => {
    if (confirm('Are you sure you want to delete this issue?')) {
      await onDeleteIssue(issueId);
    }
  };

  const updateEditForm = (field: keyof ProjectIssue, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const formatScheduleVariance = (variance?: number) => {
    if (variance === null || variance === undefined) return '-';
    if (variance === 0) return 'On time';
    return variance > 0 ? `+${variance} days` : `${variance} days`;
  };

  const getVarianceColor = (variance?: number) => {
    if (variance === null || variance === undefined) return 'text-muted-foreground';
    if (variance === 0) return 'text-green-600';
    return variance > 0 ? 'text-red-600' : 'text-blue-600';
  };

  const formatTimeToResolve = (days?: number) => {
    if (days === null || days === undefined) return '-';
    if (days === 0) return 'Same day';
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  const getDensityClasses = () => {
    switch (density) {
      case 'compact':
        return 'text-xs py-1 px-2';
      case 'comfortable':
        return 'text-base py-4 px-4';
      default:
        return 'text-sm py-2 px-3';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading issues...</div>;
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No issues found. Create your first issue to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className={getDensityClasses()}>Title</TableHead>
            <TableHead className={getDensityClasses()}>Category</TableHead>
            <TableHead className={getDensityClasses()}>Severity</TableHead>
            <TableHead className={getDensityClasses()}>Priority</TableHead>
            <TableHead className={getDensityClasses()}>Status</TableHead>
            <TableHead className={getDensityClasses()}>Date Identified</TableHead>
            <TableHead className={getDensityClasses()}>Due Date</TableHead>
            <TableHead className={getDensityClasses()}>Date Resolved</TableHead>
            <TableHead className={getDensityClasses()}>Task</TableHead>
            <TableHead className={getDensityClasses()}>Time to Resolve</TableHead>
            <TableHead className={getDensityClasses()}>Schedule Variance</TableHead>
            <TableHead className={getDensityClasses()}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow key={issue.id}>
              <TableCell className={cn("font-medium", getDensityClasses())}>
                {editingId === issue.id ? (
                  <Input
                    value={editForm.title}
                    onChange={(e) => updateEditForm('title', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  issue.title
                )}
              </TableCell>

              <TableCell className={getDensityClasses()}>
                {editingId === issue.id ? (
                  <Select
                    value={editForm.category}
                    onValueChange={(value) => updateEditForm('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Technical', 'Process', 'Client', 'Resource', 'Scope', 'Communication', 'Quality'].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline">{issue.category}</Badge>
                )}
              </TableCell>

              <TableCell className={getDensityClasses()}>
                {editingId === issue.id ? (
                  <Select
                    value={editForm.severity}
                    onValueChange={(value) => updateEditForm('severity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Low', 'Medium', 'High', 'Critical'].map(sev => (
                        <SelectItem key={sev} value={sev}>{sev}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <IssueStatusBadge severity={issue.severity} type="severity" status={issue.status} />
                )}
              </TableCell>

              <TableCell className={getDensityClasses()}>
                {editingId === issue.id ? (
                  <Select
                    value={editForm.priority}
                    onValueChange={(value) => updateEditForm('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Low', 'Medium', 'High', 'Urgent'].map(pri => (
                        <SelectItem key={pri} value={pri}>{pri}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <IssueStatusBadge priority={issue.priority} type="priority" status={issue.status} />
                )}
              </TableCell>

              <TableCell className={getDensityClasses()}>
                {editingId === issue.id ? (
                  <Select
                    value={editForm.status}
                    onValueChange={(value) => updateEditForm('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'].map(stat => (
                        <SelectItem key={stat} value={stat}>{stat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <IssueStatusBadge status={issue.status} />
                )}
              </TableCell>

              <TableCell className={getDensityClasses()}>
                {editingId === issue.id ? (
                  <Input
                    type="date"
                    value={editForm.date_identified || ''}
                    onChange={(e) => updateEditForm('date_identified', e.target.value)}
                  />
                ) : (
                  issue.date_identified && (
                    <span className="text-sm">
                      {format(new Date(issue.date_identified), 'MMM dd, yyyy')}
                    </span>
                  )
                )}
              </TableCell>

              <TableCell className={getDensityClasses()}>
                {editingId === issue.id ? (
                  <Input
                    type="date"
                    value={editForm.due_date || ''}
                    onChange={(e) => updateEditForm('due_date', e.target.value)}
                  />
                ) : (
                  issue.due_date && (
                    <span className="text-sm">
                      {format(new Date(issue.due_date), 'MMM dd, yyyy')}
                    </span>
                  )
                )}
              </TableCell>

              <TableCell className={getDensityClasses()}>
                {editingId === issue.id ? (
                  <Input
                    type="date"
                    value={editForm.resolved_at ? editForm.resolved_at.split('T')[0] : ''}
                    onChange={(e) => updateEditForm('resolved_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
                  />
                ) : (
                  issue.resolved_at && (
                    <span className="text-sm">
                      {format(new Date(issue.resolved_at), 'MMM dd, yyyy')}
                    </span>
                  )
                )}
              </TableCell>

              <TableCell className={getDensityClasses()}>
                {issue.task_name || '-'}
              </TableCell>

              <TableCell className={cn("text-muted-foreground", getDensityClasses())}>
                {formatTimeToResolve(issue.time_to_resolve_days)}
              </TableCell>

              <TableCell className={cn(getVarianceColor(issue.schedule_variance_days), getDensityClasses())}>
                {formatScheduleVariance(issue.schedule_variance_days)}
              </TableCell>

              <TableCell className={getDensityClasses()}>
                <div className="flex items-center gap-1">
                  {editingId === issue.id ? (
                    <>
                      <Button size="sm" onClick={saveEdit}>
                        <Save className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEdit(issue)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(issue.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
