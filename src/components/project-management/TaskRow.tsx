import React from 'react';
import { ProjectTask, ProjectMilestone } from '@/types/project';

interface TaskRowProps {
  task: ProjectTask;
  availableResources: Array<{ id: string; name: string; role: string; email?: string }>;
  // Add hierarchy support
  isExpanded?: boolean;
  onToggleExpansion?: (taskId: string) => void;
  onPromoteTask?: (taskId: string) => void;
  onDemoteTask?: (taskId: string) => void;
  onAddSubtask?: (taskId: string) => void;
  allTasks?: ProjectTask[];
}

const TaskRow: React.FC<TaskRowProps> = ({ 
  task, 
  availableResources,
  isExpanded = true,
  onToggleExpansion,
  onPromoteTask,
  onDemoteTask,
  onAddSubtask,
  allTasks = []
}) => {
  if (!task) return null;

  const indentLevel = task.hierarchyLevel || 0;
  const hasChildren = task.hasChildren || false;

  return (
    <div className="grid grid-cols-12 gap-0 border-b hover:bg-muted/50 transition-colors group">
      <div className="col-span-2 p-3 border-r">
        <div className="flex items-center gap-2">
          {/* Indentation for hierarchy */}
          <div style={{ width: `${indentLevel * 16}px` }} className="flex-shrink-0" />
          
          {/* Expansion toggle for parent tasks */}
          {hasChildren && onToggleExpansion && (
            <button
              onClick={() => onToggleExpansion(task.id)}
              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              {isExpanded ? (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
          )}
          
          {/* Visual hierarchy indicator */}
          {indentLevel > 0 && (
            <div className="flex items-center">
              <div className="w-2 h-px bg-border" />
              <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            </div>
          )}
          
          {/* Parent task indicator */}
          {hasChildren && (
            <div className="w-1.5 h-1.5 rounded-sm bg-primary/60 flex-shrink-0" />
          )}
          
          <div className="flex-1">
            <div className="font-medium text-foreground truncate" title={task.name}>
              {task.name || 'Untitled Task'}
            </div>
            {task.description && (
              <div className="text-xs text-muted-foreground mt-1 truncate" title={task.description}>
                {task.description}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-span-1 p-3 border-r">
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
          task.status === 'Completed' ? 'bg-success/10 text-success' :
          task.status === 'In Progress' ? 'bg-primary/10 text-primary' :
          task.status === 'On Hold' ? 'bg-warning/10 text-warning' :
          'bg-muted text-muted-foreground'
        }`}>
          {task.status || 'Not Started'}
        </span>
      </div>
      <div className="col-span-1 p-3 border-r">
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
          task.priority === 'High' ? 'bg-destructive/10 text-destructive' :
          task.priority === 'Medium' ? 'bg-warning/10 text-warning' :
          'bg-muted text-muted-foreground'
        }`}>
          {task.priority || 'Medium'}
        </span>
      </div>
      <div className="col-span-1 p-3 border-r">
        <div className="flex flex-wrap gap-1">
          {Array.isArray(task.assignedResources) && task.assignedResources.map(resourceId => {
            const resource = availableResources.find(r => r.id === resourceId);
            return resource ? (
              <span 
                key={resourceId} 
                className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-secondary text-secondary-foreground"
                title={`${resource.name} - ${resource.role}`}
              >
                {resource.name}
              </span>
            ) : null;
          })}
        </div>
      </div>
      <div className="col-span-1 p-3 border-r text-sm text-muted-foreground">
        {task.startDate || '-'}
      </div>
      <div className="col-span-1 p-3 border-r text-sm text-muted-foreground">
        {task.endDate || '-'}
      </div>
      <div className="col-span-1 p-3 border-r text-sm text-muted-foreground">
        {task.duration || 1}d
      </div>
      <div className="col-span-1 p-3 border-r">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${task.progress || 0}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {task.progress || 0}%
          </span>
        </div>
      </div>
      <div className="col-span-1 p-3 border-r text-sm text-muted-foreground">
        {Array.isArray(task.dependencies) && task.dependencies.length > 0 ? 
          `${task.dependencies.length} dep${task.dependencies.length !== 1 ? 's' : ''}` : 
          '-'
        }
      </div>
      <div className="col-span-1 p-3 border-r text-sm text-muted-foreground">
        {task.milestoneId ? 'Linked' : '-'}
      </div>
      <div className="col-span-1 p-3">
        <div className="flex items-center gap-1">
          {/* Hierarchy controls - visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onPromoteTask && indentLevel > 0 && (
              <button
                onClick={() => onPromoteTask(task.id)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Promote task"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
              </button>
            )}
            
            {onDemoteTask && (
              <button
                onClick={() => onDemoteTask(task.id)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Demote task"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            )}
            
            {onAddSubtask && (
              <button
                onClick={() => onAddSubtask(task.id)}
                className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Add subtask"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Existing action buttons */}
          <button className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button className="p-1 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskRow;
