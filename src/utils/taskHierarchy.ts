
import { ProjectTask, TaskHierarchyNode } from '@/types/project';

export class TaskHierarchyUtils {
  /**
   * Transform flat task list into hierarchical tree structure
   */
  static buildHierarchyTree(tasks: ProjectTask[]): TaskHierarchyNode[] {
    // Create a map for quick lookups
    const taskMap = new Map<string, ProjectTask>();
    tasks.forEach(task => taskMap.set(task.id, task));

    // Create hierarchy nodes
    const nodeMap = new Map<string, TaskHierarchyNode>();
    const rootNodes: TaskHierarchyNode[] = [];

    // First pass: create all nodes
    tasks.forEach(task => {
      const node: TaskHierarchyNode = {
        task: { ...task, hasChildren: false },
        children: [],
        depth: task.hierarchyLevel,
        isExpanded: true,
        path: []
      };
      nodeMap.set(task.id, node);
    });

    // Second pass: build parent-child relationships and calculate paths
    tasks
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach(task => {
        const node = nodeMap.get(task.id)!;
        
        if (task.parentTaskId) {
          const parentNode = nodeMap.get(task.parentTaskId);
          if (parentNode) {
            parentNode.children.push(node);
            parentNode.task.hasChildren = true;
            // Build path from root to current task
            node.path = [...parentNode.path, parentNode.task.name];
          }
        } else {
          rootNodes.push(node);
          node.path = [];
        }
      });

    // Sort children by sort_order
    const sortChildren = (nodes: TaskHierarchyNode[]) => {
      nodes.sort((a, b) => a.task.sortOrder - b.task.sortOrder);
      nodes.forEach(node => sortChildren(node.children));
    };

    sortChildren(rootNodes);
    return rootNodes;
  }

  /**
   * Flatten hierarchy tree back to a sorted task list
   */
  static flattenHierarchy(hierarchyTree: TaskHierarchyNode[]): ProjectTask[] {
    const result: ProjectTask[] = [];

    const traverse = (nodes: TaskHierarchyNode[]) => {
      nodes.forEach(node => {
        result.push(node.task);
        if (node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(hierarchyTree);
    return result;
  }

  /**
   * Get all descendants of a task
   */
  static getTaskDescendants(taskId: string, hierarchyTree: TaskHierarchyNode[]): string[] {
    const descendants: string[] = [];

    const findAndCollectDescendants = (nodes: TaskHierarchyNode[]) => {
      for (const node of nodes) {
        if (node.task.id === taskId) {
          const collectChildren = (childNodes: TaskHierarchyNode[]) => {
            childNodes.forEach(child => {
              descendants.push(child.task.id);
              collectChildren(child.children);
            });
          };
          collectChildren(node.children);
          return true;
        }
        if (findAndCollectDescendants(node.children)) {
          return true;
        }
      }
      return false;
    };

    findAndCollectDescendants(hierarchyTree);
    return descendants;
  }

  /**
   * Get task path from root to specified task
   */
  static getTaskPath(taskId: string, hierarchyTree: TaskHierarchyNode[]): string[] {
    const findPath = (nodes: TaskHierarchyNode[], currentPath: string[] = []): string[] | null => {
      for (const node of nodes) {
        const newPath = [...currentPath, node.task.name];
        
        if (node.task.id === taskId) {
          return newPath;
        }
        
        const childPath = findPath(node.children, newPath);
        if (childPath) {
          return childPath;
        }
      }
      return null;
    };

    return findPath(hierarchyTree) || [];
  }

  /**
   * Validate if a task can be moved to a new parent
   */
  static canMoveTask(
    taskId: string, 
    newParentId: string | undefined, 
    hierarchyTree: TaskHierarchyNode[]
  ): { canMove: boolean; reason?: string } {
    // Can't move task to itself
    if (taskId === newParentId) {
      return { canMove: false, reason: 'Cannot move task to itself' };
    }

    // Can't move task to its descendant (would create circular reference)
    if (newParentId) {
      const descendants = this.getTaskDescendants(taskId, hierarchyTree);
      if (descendants.includes(newParentId)) {
        return { canMove: false, reason: 'Cannot move task to its descendant' };
      }
    }

    // Check depth limit (max 5 levels)
    if (newParentId) {
      const parentPath = this.getTaskPath(newParentId, hierarchyTree);
      if (parentPath.length >= 5) {
        return { canMove: false, reason: 'Maximum hierarchy depth (5 levels) would be exceeded' };
      }
    }

    return { canMove: true };
  }

  /**
   * Calculate new hierarchy level for a task based on its parent
   */
  static calculateHierarchyLevel(parentTaskId: string | undefined, tasks: ProjectTask[]): number {
    if (!parentTaskId) {
      return 0;
    }

    const parentTask = tasks.find(t => t.id === parentTaskId);
    return parentTask ? parentTask.hierarchyLevel + 1 : 0;
  }

  /**
   * Generate new sort order for a task at a specific position
   */
  static generateSortOrder(
    parentTaskId: string | undefined,
    position: number,
    tasks: ProjectTask[]
  ): number {
    const siblings = tasks.filter(t => t.parentTaskId === parentTaskId);
    siblings.sort((a, b) => a.sortOrder - b.sortOrder);

    if (position >= siblings.length) {
      // Add at the end
      const lastOrder = siblings.length > 0 ? siblings[siblings.length - 1].sortOrder : 0;
      return lastOrder + 100;
    } else if (position === 0) {
      // Add at the beginning
      const firstOrder = siblings.length > 0 ? siblings[0].sortOrder : 100;
      return Math.max(1, firstOrder - 100);
    } else {
      // Insert between existing tasks
      const prevOrder = siblings[position - 1].sortOrder;
      const nextOrder = siblings[position].sortOrder;
      return Math.floor((prevOrder + nextOrder) / 2);
    }
  }

  /**
   * Get visual indentation level for display
   */
  static getIndentationLevel(task: ProjectTask): number {
    return task.hierarchyLevel * 16; // 16px per level
  }

  /**
   * Check if a task is a root task (no parent)
   */
  static isRootTask(task: ProjectTask): boolean {
    return !task.parentTaskId;
  }

  /**
   * Get immediate children of a task
   */
  static getTaskChildren(parentId: string, tasks: ProjectTask[]): ProjectTask[] {
    return tasks
      .filter(task => task.parentTaskId === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Get siblings of a task (tasks with same parent)
   */
  static getTaskSiblings(taskId: string, tasks: ProjectTask[]): ProjectTask[] {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return [];

    return tasks
      .filter(t => t.parentTaskId === task.parentTaskId && t.id !== taskId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
