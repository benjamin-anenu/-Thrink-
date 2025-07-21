import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
}

export const IssueLogTable = ({ 
  issues, 
  loading, 
  onUpdateIssue, 
  onDeleteIssue 
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
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Impact</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => (
            <TableRow 
              key={issue.id}
              className={cn(
                'hover:bg-muted/50',
                issue.status === 'Resolved' || issue.status === 'Closed' 
                  ? 'opacity-60' 
                  : '',
                issue.severity === 'Critical' 
                  ? 'border-l-4 border-l-red-500' 
                  : issue.severity === 'High' 
                  ? 'border-l-4 border-l-orange-500' 
                  : ''
              )}
            >
              <TableCell>
                {issue.severity === 'Critical' && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                {issue.linked_task_id && (
                  <ExternalLink className="h-3 w-3 text-blue-500 mt-1" />
                )}
              </TableCell>
              
              <TableCell className="font-medium">
                {editingId === issue.id ? (
                  <Input
                    value={editForm.title || ''}
                    onChange={(e) => updateEditForm('title', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div>
                    <div className="font-medium">{issue.title}</div>
                    {issue.description && (
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {issue.description}
                      </div>
                    )}
                  </div>
                )}
              </TableCell>

              <TableCell>
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

              <TableCell>
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

              <TableCell>
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

              <TableCell>
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

              <TableCell>
                <span className="text-sm">
                  {issue.assignee_id || 'Unassigned'}
                </span>
              </TableCell>

              <TableCell>
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

              <TableCell>
                <div className="text-xs text-muted-foreground max-w-xs">
                  {issue.impact_summary || 'No impact analysis'}
                  {issue.estimated_delay_days > 0 && (
                    <div className="text-orange-600 font-medium">
                      +{issue.estimated_delay_days}d delay
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell>
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