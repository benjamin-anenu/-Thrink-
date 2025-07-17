
import React from 'react';
import { ProjectTask } from '@/types/project';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, AlertTriangle, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DependencyVisualizerProps {
  task: ProjectTask;
  allTasks: ProjectTask[];
}

interface ParsedDependency {
  taskId: string;
  type: string;
  lag: number;
  task?: ProjectTask;
}

const DependencyVisualizer: React.FC<DependencyVisualizerProps> = ({
  task,
  allTasks
}) => {
  // Parse dependencies from the stored format (taskId:type:lag)
  const parseDependencies = (): ParsedDependency[] => {
    return task.dependencies.map(dep => {
      const parts = dep.split(':');
      const taskId = parts[0];
      return {
        taskId,
        type: parts[1] || 'finish-to-start',
        lag: parseInt(parts[2]) || 0,
        task: allTasks.find(t => t.id === taskId)
      };
    }).filter(dep => dep.task); // Only include dependencies where we found the task
  };

  const dependencies = parseDependencies();

  if (dependencies.length === 0) {
    return (
      <div className="text-xs text-muted-foreground p-1">
        No dependencies
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'start-to-start':
        return <ArrowRight className="h-3 w-3 text-blue-500 flex-shrink-0" />;
      case 'finish-to-finish':
        return <ArrowRight className="h-3 w-3 text-green-500 flex-shrink-0" />;
      case 'start-to-finish':
        return <ArrowRight className="h-3 w-3 text-purple-500 flex-shrink-0" />;
      default: // finish-to-start
        return <ArrowRight className="h-3 w-3 text-orange-500 flex-shrink-0" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'start-to-start':
        return 'SS';
      case 'finish-to-finish':
        return 'FF';
      case 'start-to-finish':
        return 'SF';
      default:
        return 'FS';
    }
  };

  const isTaskDelayed = (dependency: ParsedDependency): boolean => {
    if (!dependency.task) return false;
    
    const depEndDate = new Date(dependency.task.endDate);
    const taskStartDate = new Date(task.startDate);
    
    // Check if dependency task end date is after current task start date
    return depEndDate > taskStartDate;
  };

  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1 w-full overflow-hidden">
        {dependencies.map((dep) => (
          <Tooltip key={dep.taskId}>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline" 
                className={`text-xs cursor-help flex items-center gap-1 max-w-full min-w-0 ${
                  isTaskDelayed(dep) ? 'border-red-200 bg-red-50 text-red-700' : ''
                }`}
              >
                {getTypeIcon(dep.type)}
                <span className="truncate flex-1 min-w-0" title={dep.task?.name || 'Unknown'}>
                  {dep.task?.name || 'Unknown'}
                </span>
                {dep.lag !== 0 && (
                  <span className="text-xs flex-shrink-0 ml-1">
                    {dep.lag > 0 ? `+${dep.lag}d` : `${dep.lag}d`}
                  </span>
                )}
                {isTaskDelayed(dep) && <AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-medium">{dep.task?.name}</div>
                <div className="text-xs text-muted-foreground">
                  Type: {getTypeLabel(dep.type)} ({dep.type.replace('-', ' to ')})
                </div>
                {dep.lag !== 0 && (
                  <div className="text-xs text-muted-foreground">
                    {dep.lag > 0 ? `Lag: +${dep.lag} days` : `Lead: ${Math.abs(dep.lag)} days`}
                  </div>
                )}
                {dep.task && (
                  <div className="text-xs text-muted-foreground">
                    Due: {new Date(dep.task.endDate).toLocaleDateString()}
                  </div>
                )}
                {isTaskDelayed(dep) && (
                  <div className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Dependency may cause delay
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default DependencyVisualizer;
