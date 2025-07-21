import { useMemo } from 'react';
import { ProjectTask } from '@/types/project';
import { DependencyCalculationService, ParsedDependency } from '@/services/DependencyCalculationService';

interface DependencyConnection {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: ParsedDependency['type'];
  lag: number;
  fromTask: ProjectTask;
  toTask: ProjectTask;
  hasConflict: boolean;
  displayType: 'FS' | 'SS' | 'FF' | 'SF';
}

export const useDependencyVisualization = (tasks: ProjectTask[]) => {
  const dependencyConnections = useMemo((): DependencyConnection[] => {
    const connections: DependencyConnection[] = [];
    
    tasks.forEach(task => {
      task.dependencies.forEach(depString => {
        const parsedDep = DependencyCalculationService.parseDependency(depString);
        const fromTask = tasks.find(t => t.id === parsedDep.taskId);
        
        if (fromTask) {
          const connection: DependencyConnection = {
            id: `${parsedDep.taskId}-${task.id}-${parsedDep.type}`,
            fromTaskId: parsedDep.taskId,
            toTaskId: task.id,
            type: parsedDep.type,
            lag: parsedDep.lag,
            fromTask,
            toTask: task,
            hasConflict: false, // Will be calculated
            displayType: getDependencyDisplayType(parsedDep.type)
          };
          
          connections.push(connection);
        }
      });
    });
    
    return connections;
  }, [tasks]);

  const getDependencyDisplayType = (type: ParsedDependency['type']): 'FS' | 'SS' | 'FF' | 'SF' => {
    switch (type) {
      case 'finish-to-start': return 'FS';
      case 'start-to-start': return 'SS';
      case 'finish-to-finish': return 'FF';
      case 'start-to-finish': return 'SF';
      default: return 'FS';
    }
  };

  const getConnectionArrowProperties = (connection: DependencyConnection) => {
    const { fromTask, toTask, type, lag } = connection;
    
    // Calculate arrow positioning based on dependency type
    const fromDate = type === 'finish-to-start' || type === 'finish-to-finish' 
      ? fromTask.endDate 
      : fromTask.startDate;
    
    const toDate = type === 'start-to-start' || type === 'finish-to-start'
      ? toTask.startDate
      : toTask.endDate;
    
    return {
      fromDate,
      toDate,
      color: connection.hasConflict ? '#ef4444' : getTypeColor(type),
      style: lag !== 0 ? 'dashed' : 'solid',
      label: getLagLabel(lag)
    };
  };

  const getTypeColor = (type: ParsedDependency['type']): string => {
    switch (type) {
      case 'finish-to-start': return '#3b82f6'; // blue
      case 'start-to-start': return '#10b981'; // green
      case 'finish-to-finish': return '#f59e0b'; // amber
      case 'start-to-finish': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  const getLagLabel = (lag: number): string => {
    if (lag === 0) return '';
    return lag > 0 ? `+${lag}d` : `${lag}d`;
  };

  // Note: Critical path calculation should be done at the component level with proper projectId
  const getCriticalPath = useMemo(() => {
    return []; // Placeholder - actual calculation done in component with projectId
  }, [tasks]);

  const getTaskLevel = (taskId: string): number => {
    // Calculate how many dependency levels deep a task is
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.dependencies.length === 0) return 0;

    let maxDepth = 0;
    const visited = new Set<string>();

    const calculateDepth = (currentTaskId: string, depth: number): number => {
      if (visited.has(currentTaskId)) return depth;
      visited.add(currentTaskId);

      const currentTask = tasks.find(t => t.id === currentTaskId);
      if (!currentTask) return depth;

      let currentMaxDepth = depth;
      for (const depString of currentTask.dependencies) {
        const parsedDep = DependencyCalculationService.parseDependency(depString);
        const depDepth = calculateDepth(parsedDep.taskId, depth + 1);
        currentMaxDepth = Math.max(currentMaxDepth, depDepth);
      }

      return currentMaxDepth;
    };

    return calculateDepth(taskId, 0);
  };

  const getDependencyStats = useMemo(() => {
    const stats = {
      totalDependencies: dependencyConnections.length,
      finishToStart: 0,
      startToStart: 0,
      finishToFinish: 0,
      startToFinish: 0,
      withLag: 0,
      withLead: 0,
      conflicts: 0
    };

    dependencyConnections.forEach(connection => {
      switch (connection.type) {
        case 'finish-to-start': stats.finishToStart++; break;
        case 'start-to-start': stats.startToStart++; break;
        case 'finish-to-finish': stats.finishToFinish++; break;
        case 'start-to-finish': stats.startToFinish++; break;
      }

      if (connection.lag > 0) stats.withLag++;
      if (connection.lag < 0) stats.withLead++;
      if (connection.hasConflict) stats.conflicts++;
    });

    return stats;
  }, [dependencyConnections]);

  return {
    dependencyConnections,
    getDependencyDisplayType,
    getConnectionArrowProperties,
    getTypeColor,
    getLagLabel,
    getCriticalPath,
    getTaskLevel,
    getDependencyStats
  };
};