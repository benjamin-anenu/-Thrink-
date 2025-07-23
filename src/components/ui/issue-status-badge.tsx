
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColors } from "@/utils/darkModeColors";

interface IssueStatusBadgeProps {
  status?: 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed';
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  type?: 'status' | 'severity' | 'priority';
  value?: string; // For direct value passing
}

export const IssueStatusBadge = ({ 
  status, 
  severity, 
  priority, 
  type = 'status' 
}: IssueStatusBadgeProps) => {
  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (status) {
      case 'Open':
        return 'error';
      case 'In Progress':
        return 'warning';
      case 'Escalated':
        return 'error';
      case 'Resolved':
        return 'success';
      case 'Closed':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const getSeverityVariant = (severity: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (severity) {
      case 'Low':
        return 'info';
      case 'Medium':
        return 'warning';
      case 'High':
        return 'error';
      case 'Critical':
        return 'error';
      default:
        return 'neutral';
    }
  };

  const getPriorityVariant = (priority: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' => {
    switch (priority) {
      case 'Low':
        return 'neutral';
      case 'Medium':
        return 'info';
      case 'High':
        return 'warning';
      case 'Urgent':
        return 'error';
      default:
        return 'neutral';
    }
  };

  let variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'neutral';
  let displayText: string = status || '';

  if (type === 'severity' && severity) {
    variant = getSeverityVariant(severity);
    displayText = severity;
  } else if (type === 'priority' && priority) {
    variant = getPriorityVariant(priority);
    displayText = priority;
  } else if (status) {
    variant = getStatusVariant(status);
    displayText = status;
  }

  const colors = getStatusColors(variant);

  return (
    <Badge className={cn(
      colors.bg,
      colors.text,
      colors.border,
      'border text-xs font-medium transition-colors'
    )}>
      {displayText}
    </Badge>
  );
};
