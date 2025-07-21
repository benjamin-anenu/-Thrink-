import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IssueStatusBadgeProps {
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed';
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  type?: 'status' | 'severity' | 'priority';
}

export const IssueStatusBadge = ({ 
  status, 
  severity, 
  priority, 
  type = 'status' 
}: IssueStatusBadgeProps) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Open':
        return 'destructive';
      case 'In Progress':
        return 'default';
      case 'Escalated':
        return 'destructive';
      case 'Resolved':
        return 'secondary';
      case 'Closed':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getSeverityClasses = (severity: string) => {
    switch (severity) {
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      default:
        return '';
    }
  };

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'Low':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200';
      case 'Urgent':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
      default:
        return '';
    }
  };

  if (type === 'severity' && severity) {
    return (
      <Badge className={cn('border', getSeverityClasses(severity))}>
        {severity}
      </Badge>
    );
  }

  if (type === 'priority' && priority) {
    return (
      <Badge className={cn('border', getPriorityClasses(priority))}>
        {priority}
      </Badge>
    );
  }

  return (
    <Badge variant={getStatusVariant(status)}>
      {status}
    </Badge>
  );
};