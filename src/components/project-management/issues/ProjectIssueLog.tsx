
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter, Download, LayoutGrid, X } from 'lucide-react';
import { useIssueManagement } from '@/hooks/useIssueManagement';
import { IssueLogTable } from './IssueLogTable';
import { IssueCreationDialog } from './IssueCreationDialog';
import { IssueFilters } from './IssueFilters';
import { IssueMetricsCards } from './IssueMetricsCards';
import { Badge } from '@/components/ui/badge';

interface ProjectIssueLogProps {
  projectId: string;
  taskFilter?: string;
  onClearTaskFilter?: () => void;
}

export const ProjectIssueLog = ({ projectId, taskFilter, onClearTaskFilter }: ProjectIssueLogProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [tableDensity, setTableDensity] = useState<'compact' | 'normal' | 'comfortable'>('compact');
  
  const {
    issues,
    metrics,
    loading,
    filters,
    setFilters,
    createIssue,
    updateIssue,
    deleteIssue,
    generateAIInsights,
    getTaskDetails
  } = useIssueManagement(projectId);

  // Apply task filter when provided
  useEffect(() => {
    if (taskFilter) {
      setFilters(prev => ({
        ...prev,
        linkedTaskId: taskFilter
      }));
    }
  }, [taskFilter, setFilters]);

  const handleExportCSV = () => {
    // Simple CSV export
    const csvData = [
      ['Title', 'Category', 'Severity', 'Priority', 'Status', 'Assignee', 'Date Identified', 'Due Date', 'Impact Summary'],
      ...issues.map(issue => [
        issue.title,
        issue.category,
        issue.severity,
        issue.priority,
        issue.status,
        issue.assignee_id || 'Unassigned',
        issue.date_identified,
        issue.due_date || '',
        issue.impact_summary || ''
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project-issues-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <IssueMetricsCards metrics={metrics} />

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg md:text-xl">Issue Log</CardTitle>
              {taskFilter && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    Filtered by task
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearTaskFilter}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
              <Select value={tableDensity} onValueChange={(value: 'compact' | 'normal' | 'comfortable') => setTableDensity(value)}>
                <SelectTrigger className="w-full md:w-32">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 button-group">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 md:flex-none"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="flex-1 md:flex-none"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowCreateDialog(true)}
                  className="flex-1 md:flex-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Issue
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showFilters && (
            <div className="mb-6">
              <IssueFilters
                filters={filters}
                onFiltersChange={setFilters}
                projectId={projectId}
              />
            </div>
          )}
          
          <IssueLogTable
            issues={issues}
            loading={loading}
            onUpdateIssue={updateIssue}
            onDeleteIssue={deleteIssue}
            projectId={projectId}
            density={tableDensity}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
      <IssueCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateIssue={createIssue}
        generateAIInsights={generateAIInsights}
        getTaskDetails={getTaskDetails}
        projectId={projectId}
      />
    </div>
  );
};
