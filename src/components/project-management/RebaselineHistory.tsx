import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, Clock, AlertTriangle, History, Filter, Download, ArrowUpDown } from 'lucide-react';
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

const formatShortDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatDateRange = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (startDate.toDateString() === endDate.toDateString()) {
    return formatShortDate(start);
  }
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
};

const getTypeBadge = (type: string) => {
  const badgeClass = "text-white font-medium px-2 py-0.5 text-xs rounded-md";
  switch (type) {
    case 'manual':
      return <Badge className={`bg-blue-600 ${badgeClass}`}>Manual</Badge>;
    case 'auto':
      return <Badge className={`bg-green-600 ${badgeClass}`}>Auto</Badge>;
    case 'bulk':
      return <Badge className={`bg-purple-600 ${badgeClass}`}>Bulk</Badge>;
    default:
      return <Badge className={`bg-gray-600 ${badgeClass}`}>Other</Badge>;
  }
};

const getCascadeLabel = (method: string) => {
  switch (method) {
    case 'preserve_dependencies': return 'Preserve Dependencies';
    case 'shift_all': return 'Shift All';
    case 'manual_select': return 'Manual Select';
    default: return method ? method.replace(/_/g, ' ') : '';
  }
};

const getVarianceBadge = (days: number) => {
  const badgeClass = "text-white font-medium px-2 py-0.5 text-xs rounded-md min-w-[45px] text-center";
  if (days > 0) return <Badge className={`bg-red-600/90 ${badgeClass}`}>+{days}d</Badge>;
  if (days < 0) return <Badge className={`bg-green-600/90 ${badgeClass}`}>{days}d</Badge>;
  return <Badge className={`bg-gray-600/90 ${badgeClass}`}>0d</Badge>;
};

const RebaselineHistory: React.FC<RebaselineHistoryProps> = ({ projectId }) => {
  const [history, setHistory] = useState<RebaselineHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'manual' | 'auto' | 'bulk'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'task' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadHistory();
  }, [projectId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rebaseline_history')
        .select(`*, project_tasks!inner(name)`)
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

  const exportToCSV = () => {
    const headers = ['Task', 'Type', 'Old Date Range', 'New Date Range', 'Start Variance', 'End Variance', 'Affected Tasks', 'Method', 'Reason', 'Date'];
    const csvContent = [
      headers.join(','),
      ...history.map(item => [
        `"${item.task_name}"`,
        item.rebaseline_type,
        `"${formatDateRange(item.old_start_date, item.old_end_date)}"`,
        `"${formatDateRange(item.new_start_date, item.new_end_date)}"`,
        Math.ceil((new Date(item.new_start_date).getTime() - new Date(item.old_start_date).getTime()) / (1000 * 60 * 60 * 24)),
        Math.ceil((new Date(item.new_end_date).getTime() - new Date(item.old_end_date).getTime()) / (1000 * 60 * 60 * 24)),
        item.affected_tasks_count,
        `"${getCascadeLabel(item.cascade_method)}"`,
        `"${item.reason}"`,
        `"${formatShortDate(item.created_at)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rebaseline-history-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (column: 'date' | 'task' | 'type') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedHistory = [...history].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'task':
        comparison = (a.task_name || '').localeCompare(b.task_name || '');
        break;
      case 'type':
        comparison = a.rebaseline_type.localeCompare(b.rebaseline_type);
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const filteredHistory = sortedHistory.filter(item => filter === 'all' || item.rebaseline_type === filter);

  return (
    <TooltipProvider>
      <Card className="shadow-lg border border-slate-700 bg-slate-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <History className="h-5 w-5" />
                Rebaseline History
              </CardTitle>
              <CardDescription className="mt-1 text-sm text-slate-500 font-normal">
                Showing {filteredHistory.length} of {history.length} rebaseline actions
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="flex items-center gap-2"
                disabled={filteredHistory.length === 0}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="text-sm border border-slate-600 rounded px-3 py-1.5 bg-slate-800 text-slate-200 focus:border-slate-500 focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="manual">Manual</option>
                  <option value="auto">Auto</option>
                  <option value="bulk">Bulk</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Clock className="h-6 w-6 animate-spin mr-2" />
              <span className="text-slate-400">Loading history...</span>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No rebaseline history found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Rebaseline actions will appear here once performed
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[900px] text-sm">
                <TableHeader>
                  <TableRow className="border-b border-slate-700 bg-slate-800/50">
                    <TableHead className="w-48 font-semibold text-slate-300 py-4">
                      <button
                        onClick={() => handleSort('task')}
                        className="flex items-center gap-1 hover:text-slate-100 transition-colors"
                      >
                        Task
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead className="w-24 font-semibold text-slate-300 py-4">
                      <button
                        onClick={() => handleSort('type')}
                        className="flex items-center gap-1 hover:text-slate-100 transition-colors"
                      >
                        Type
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead className="w-56 font-semibold text-slate-300 py-4">Date Range</TableHead>
                    <TableHead className="w-32 font-semibold text-slate-300 py-4">Variance</TableHead>
                    <TableHead className="w-32 font-semibold text-slate-300 py-4">Affected</TableHead>
                    <TableHead className="w-64 font-semibold text-slate-300 py-4">Reason</TableHead>
                    <TableHead className="w-32 font-semibold text-slate-300 py-4">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center gap-1 hover:text-slate-100 transition-colors"
                      >
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.map((item) => {
                    const startVariance = Math.ceil((new Date(item.new_start_date).getTime() - new Date(item.old_start_date).getTime()) / (1000 * 60 * 60 * 24));
                    const endVariance = Math.ceil((new Date(item.new_end_date).getTime() - new Date(item.old_end_date).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <TableRow key={item.id} className="border-b border-slate-800 hover:bg-slate-800/70 transition-all duration-200">
                        <TableCell className="font-medium text-slate-200 py-4 px-4 align-middle">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="cursor-pointer hover:text-blue-400 transition-colors">
                                {item.task_name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Click to view task details</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="py-4 px-2 align-middle">{getTypeBadge(item.rebaseline_type)}</TableCell>
                        <TableCell className="py-4 px-2 align-middle">
                          <div className="space-y-1">
                            <div className="text-slate-300 text-xs">{formatDateRange(item.old_start_date, item.old_end_date)}</div>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <span>→</span>
                              <span className="text-slate-200">{formatDateRange(item.new_start_date, item.new_end_date)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-2 align-middle">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-slate-400 min-w-[32px]">Start</span>
                              {getVarianceBadge(startVariance)}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-slate-400 min-w-[32px]">End</span>
                              {getVarianceBadge(endVariance)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-2 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-200 text-sm">{item.affected_tasks_count}</span>
                            {item.cascade_method && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-xs text-slate-400 bg-slate-700/80 rounded px-2 py-0.5 cursor-help">
                                    {getCascadeLabel(item.cascade_method)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Cascade method used for dependent tasks</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-2 align-middle">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="block text-slate-200 max-w-xs truncate cursor-help text-sm">
                                {item.reason}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>{item.reason}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="py-4 px-2 align-middle">
                          <span className="text-xs text-slate-400">
                            {formatShortDate(item.created_at)}
                          </span>
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
    </TooltipProvider>
  );
};

export default RebaselineHistory; 