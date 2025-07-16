import { Brain, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export type AIProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface AIProcessingStatusProps {
  status: AIProcessingStatus;
  onRetry?: () => void;
  className?: string;
  showRetryButton?: boolean;
}

export function AIProcessingStatus({ 
  status, 
  onRetry, 
  className,
  showRetryButton = false 
}: AIProcessingStatusProps) {
  const getStatusConfig = (status: AIProcessingStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: Brain,
          label: 'AI Setup Pending',
          variant: 'secondary' as const,
          className: 'text-muted-foreground'
        };
      case 'processing':
        return {
          icon: Loader2,
          label: 'AI Processing...',
          variant: 'secondary' as const,
          className: 'text-blue-600 animate-spin'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'AI Ready',
          variant: 'default' as const,
          className: 'text-green-600'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          label: 'AI Setup Failed',
          variant: 'destructive' as const,
          className: 'text-destructive'
        };
      default:
        return {
          icon: Brain,
          label: 'Unknown Status',
          variant: 'secondary' as const,
          className: 'text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={cn("h-3 w-3", config.className)} />
        {config.label}
      </Badge>
      
      {showRetryButton && status === 'failed' && onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          className="h-6 text-xs"
        >
          Retry
        </Button>
      )}
    </div>
  );
}