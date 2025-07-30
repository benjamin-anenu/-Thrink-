
import { toast } from 'sonner';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  projectId?: string;
  workspaceId?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
}

export class ErrorBoundaryService {
  private static instance: ErrorBoundaryService;
  private errorQueue: Array<{ error: Error; context: ErrorContext }> = [];
  private isProcessing = false;

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorBoundaryService {
    if (!ErrorBoundaryService.instance) {
      ErrorBoundaryService.instance = new ErrorBoundaryService();
    }
    return ErrorBoundaryService.instance;
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('[Error Boundary] Unhandled promise rejection:', event.reason);
      this.handleError(event.reason, {
        component: 'Promise',
        action: 'unhandled_rejection',
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      console.error('[Error Boundary] Uncaught error:', event.error);
      this.handleError(event.error, {
        component: 'Global',
        action: 'uncaught_error',
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Handle network errors specifically
    window.addEventListener('offline', () => {
      this.handleNetworkError('Network went offline');
    });
  }

  public handleError(error: Error | string, context: Partial<ErrorContext> = {}) {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const fullContext: ErrorContext = {
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    };

    // Skip duplicate project ID errors
    if (errorObj.message.includes('undefined') && errorObj.message.includes('project')) {
      return; // These are now handled by the real-time service fixes
    }

    console.error('[Error Boundary] Handling error:', {
      error: errorObj,
      context: fullContext
    });

    this.errorQueue.push({ error: errorObj, context: fullContext });
    
    // Show user-friendly error message
    this.showUserError(errorObj, fullContext);
    
    // Process error queue
    this.processErrorQueue();
  }

  private showUserError(error: Error, context: ErrorContext) {
    // Don't show network-related errors as they're handled separately
    if (this.isNetworkError(error)) {
      return;
    }

    // Show appropriate user message based on error type
    if (this.isCriticalError(error)) {
      toast.error('Something went wrong. Please refresh the page and try again.');
    } else if (this.isValidationError(error)) {
      toast.error('Please check your input and try again.');
    } else {
      // For non-critical errors, just log them without bothering the user
      console.warn('[Error Boundary] Non-critical error:', error.message);
    }
  }

  private isNetworkError(error: Error): boolean {
    return error.message.includes('fetch') || 
           error.message.includes('network') || 
           error.message.includes('connection') ||
           error.message.includes('offline');
  }

  private isCriticalError(error: Error): boolean {
    const criticalPatterns = [
      'chunk',
      'module',
      'import',
      'script',
      'database',
      'auth'
    ];
    
    return criticalPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }

  private isValidationError(error: Error): boolean {
    const validationPatterns = [
      'validation',
      'required',
      'invalid',
      'format'
    ];
    
    return validationPatterns.some(pattern => 
      error.message.toLowerCase().includes(pattern)
    );
  }

  private handleNetworkError(message: string) {
    toast.error('Connection lost. Trying to reconnect...', {
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload()
      }
    });
  }

  private async processErrorQueue() {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process errors in batches
      const batch = this.errorQueue.splice(0, 5);
      
      // Here you could send errors to a logging service
      // For now, we'll just log them
      batch.forEach(({ error, context }) => {
        console.group(`[Error Report] ${context.component || 'Unknown'}`);
        console.error('Error:', error);
        console.log('Context:', context);
        console.groupEnd();
      });

    } catch (processingError) {
      console.error('[Error Boundary] Failed to process error queue:', processingError);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if there are more errors
      if (this.errorQueue.length > 0) {
        setTimeout(() => this.processErrorQueue(), 1000);
      }
    }
  }

  public clearErrorQueue() {
    this.errorQueue = [];
  }

  public getErrorCount(): number {
    return this.errorQueue.length;
  }
}

// Export singleton instance
export const errorBoundaryService = ErrorBoundaryService.getInstance();
