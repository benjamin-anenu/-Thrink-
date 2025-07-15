import { cn } from "@/lib/utils";

interface LoadingStateProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'skeleton';
  children?: React.ReactNode;
}

export function LoadingState({ 
  className, 
  size = 'md', 
  variant = 'spinner',
  children
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (variant === 'spinner') {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <div className={cn(
          "animate-spin rounded-full border-2 border-border border-t-primary",
          sizeClasses[size]
        )} />
        {children && <span className="ml-2 text-sm text-muted-foreground">{children}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("animate-pulse space-y-2", className)}>
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        {children}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="bg-muted rounded h-full w-full" />
        {children}
      </div>
    );
  }

  return null;
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  className,
  loadingText = "Loading..."
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <LoadingState variant="spinner" size="lg">
            {loadingText}
          </LoadingState>
        </div>
      )}
    </div>
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-4 bg-muted rounded animate-pulse",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}