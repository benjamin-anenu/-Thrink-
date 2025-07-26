import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, History, Filter } from 'lucide-react';
import { ProjectRebaselineService } from '@/services/ProjectRebaselineService';
import { supabase } from '@/integrations/supabase/client';

interface RebaselineHistoryProps {
  projectId: string;
}

interface RebaselineHistoryItem {
  id: string;
  project_id: string;
  task_id: string;
  rebaseline_type: 'manual' | 'auto' | 'bulk';
  reason: string;
  old_start_date: string;
  old_end_date: string;
  new_start_date: string;
  new_end_date: string;
  affected_tasks_count: number;
  affected_task_ids: string[];
  cascade_method: string;
  created_by: string;
  created_at: string;
  task_name?: string;
}

const RebaselineHistory: React.FC<RebaselineHistoryProps> = ({ projectId }) => {
  const [history, setHistory] = useState<RebaselineHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'manual' | 'auto' | 'bulk'>('all');

  useEffect(() => {
    loadHistory();
  }, [projectId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rebaseline_history')
        .select(`
          *,
          project_tasks!inner(name)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const historyWithTaskNames = data?.map(item => ({
        ...item,
        task_name: item.project_tasks?.name || 'Unknown Task'
      })) || [];

      setHistory(historyWithTaskNames);
    } catch (error) {
      console.error('Error loading rebaseline history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'manual': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'auto': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'bulk': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateVariance = (oldDate: string, newDate: string) => {
    const old = new Date(oldDate);
    const new_ = new Date(newDate);
    const diff = Math.ceil((new_.getTime() - old.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredHistory = history.filter(item => 
    filter === 'all' || item.rebaseline_type === filter
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Rebaseline History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            Loading history...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Rebaseline History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border rounded px-2 py-1 bg-background"
            >
              <option value="all">All Types</option>
              <option value="manual">Manual</option>
              <option value="auto">Auto</option>
              <option value="bulk">Bulk</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No rebaseline history found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Rebaseline actions will appear here once performed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredHistory.length} of {history.length} rebaseline actions
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Affected Tasks</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => {
                  const startVariance = calculateVariance(item.old_start_date, item.new_start_date);
                  const endVariance = calculateVariance(item.old_end_date, item.new_end_date);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.task_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(item.rebaseline_type)}>
                          {item.rebaseline_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-muted-foreground">Old: {formatDate(item.old_start_date)} - {formatDate(item.old_end_date)}</div>
                          <div className="text-foreground">New: {formatDate(item.new_start_date)} - {formatDate(item.new_end_date)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`text-sm ${startVariance > 0 ? 'text-red-600' : startVariance < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                            Start: {startVariance > 0 ? '+' : ''}{startVariance} days
                          </div>
                          <div className={`text-sm ${endVariance > 0 ? 'text-red-600' : endVariance < 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                            End: {endVariance > 0 ? '+' : ''}{endVariance} days
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="text-muted-foreground">{item.affected_tasks_count} tasks</div>
                          {item.cascade_method && (
                            <Badge variant="outline" className="text-xs">
                              {item.cascade_method}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm" title={item.reason}>
                          {item.reason}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(item.created_at)}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RebaselineHistory; 