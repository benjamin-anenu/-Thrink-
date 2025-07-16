import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectData, ProjectTask, ProjectMilestone, RebaselineRequest } from '@/types/project';
import { PerformanceTracker } from '@/services/PerformanceTracker';
import { EmailReminderService } from '@/services/EmailReminderService';
import { NotificationIntegrationService } from '@/services/NotificationIntegrationService';
import { eventBus } from '@/services/EventBus';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

interface ProjectContextType {
  projects: ProjectData[];
  currentProject: ProjectData | null;
  loading: boolean;
  getProject: (id: string) => ProjectData | null;
  addProject: (project: Omit<ProjectData, 'id'>) => void;
  updateProject: (id: string, updates: Partial<ProjectData>) => void;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<ProjectTask>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => void;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => void;
  rebaselineTasks: (projectId: string, request: RebaselineRequest) => void;
  setCurrentProject: (projectId: string) => void;
  completeTask: (projectId: string, taskId: string) => void;
  assignTaskToResource: (projectId: string, taskId: string, resourceId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allProjects, setAllProjects] = useState<ProjectData[]>([]);
  const [currentProject, setCurrentProjectState] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const { currentWorkspace } = useWorkspace();

  // Filter projects by current workspace
  const projects = allProjects.filter(project => 
    currentWorkspace ? project.workspaceId === currentWorkspace.id : true
  );

  // Initialize services
  const performanceTracker = PerformanceTracker.getInstance();
  const emailService = EmailReminderService.getInstance();
  const notificationService = NotificationIntegrationService.getInstance();

  // Load projects from Supabase on mount (with localStorage fallback)
  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      const { data, error } = await supabase.from('projects').select('*');
      if (data) {
        setAllProjects(data);
      } else {
        // fallback to localStorage if Supabase fails
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
          setAllProjects(JSON.parse(savedProjects));
        } else {
          initializeRealisticProject();
        }
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (allProjects.length > 0) {
      localStorage.setItem('projects', JSON.stringify(allProjects));
    }
  }, [allProjects]);

  // Set up event listeners
  useEffect(() => {
    const unsubscribeTaskCompleted = eventBus.subscribe('task_completed', (event) => {
      const { taskId, projectId, resourceId } = event.payload;
      handleTaskCompletionEffects(projectId, taskId, resourceId);
    });

    const unsubscribeDeadlineCheck = eventBus.subscribe('deadline_approaching', (event) => {
      const { taskId, projectId, daysRemaining } = event.payload;
      handleDeadlineAlert(projectId, taskId, daysRemaining);
    });

    return () => {
      unsubscribeTaskCompleted();
      unsubscribeDeadlineCheck();
    };
  }, [allProjects]);

  // Monitor deadlines
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      projects.forEach(project => {
        project.tasks.forEach(task => {
          if (task.status !== 'Completed' && task.status !== 'Not Started') {
            const deadline = new Date(task.endDate);
            const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysRemaining <= 7 && daysRemaining >= 0) {
              eventBus.emit('deadline_approaching', {
                taskId: task.id,
                taskName: task.name,
                projectId: project.id,
                projectName: project.name,
                daysRemaining
              }, 'ProjectContext');
            }
          }
        });
      });
    };

    const interval = setInterval(checkDeadlines, 60000); // Check every minute
    checkDeadlines(); // Check immediately

    return () => clearInterval(interval);
  }, [projects]);

  const initializeRealisticProject = () => {
    const workspaceId = currentWorkspace?.id || 'ws-1';
    const realisticProject: ProjectData = {
      id: 'proj-ecommerce-2024',
      name: 'E-commerce Platform Redesign',
      description: 'Complete overhaul of the user interface and user experience for our main e-commerce platform to improve conversion rates and user satisfaction.',
      status: 'In Progress',
      priority: 'High',
      progress: 45,
      health: { status: 'green', score: 88 },
      startDate: '2024-07-01',
      endDate: '2024-10-31',
      teamSize: 6,
      budget: '$185,000',
      tags: ['Frontend', 'UX/UI', 'E-commerce', 'React'],
      workspaceId,
      resources: ['sarah', 'michael', 'emily', 'david'],
      stakeholders: ['john-doe', 'jane-smith'],
      milestones: [
        {
          id: 'milestone-discovery',
          name: 'Discovery & Planning',
          description: 'User research, competitive analysis, and technical planning',
          date: '2024-07-31',
          baselineDate: '2024-07-31',
          status: 'completed',
          tasks: ['task-research', 'task-analysis'],
          progress: 100
        },
        {
          id: 'milestone-design',
          name: 'Design Phase',
          description: 'UI/UX design, prototyping, and stakeholder approval',
          date: '2024-08-31',
          baselineDate: '2024-08-31',
          status: 'completed',
          tasks: ['task-wireframes', 'task-prototypes'],
          progress: 100
        },
        {
          id: 'milestone-development',
          name: 'Development Sprint 1',
          description: 'Core components and checkout flow implementation',
          date: '2024-09-30',
          baselineDate: '2024-09-30',
          status: 'in-progress',
          tasks: ['task-components', 'task-checkout'],
          progress: 60
        },
        {
          id: 'milestone-testing',
          name: 'Testing & Launch',
          description: 'QA testing, performance optimization, and production deployment',
          date: '2024-10-31',
          baselineDate: '2024-10-31',
          status: 'upcoming',
          tasks: ['task-testing', 'task-deployment'],
          progress: 0
        }
      ],
      tasks: [
        {
          id: 'task-research',
          name: 'User Research & Analytics Review',
          description: 'Conduct user interviews and analyze current platform analytics to identify pain points',
          startDate: '2024-07-01',
          endDate: '2024-07-15',
          baselineStartDate: '2024-07-01',
          baselineEndDate: '2024-07-15',
          progress: 100,
          assignedResources: ['emily'],
          assignedStakeholders: ['jane-smith'],
          dependencies: [],
          priority: 'High',
          status: 'Completed',
          milestoneId: 'milestone-discovery',
          duration: 14
        },
        {
          id: 'task-analysis',
          name: 'Technical Architecture Analysis',
          description: 'Review current tech stack and plan migration strategy',
          startDate: '2024-07-16',
          endDate: '2024-07-31',
          baselineStartDate: '2024-07-16',
          baselineEndDate: '2024-07-31',
          progress: 100,
          assignedResources: ['michael', 'david'],
          assignedStakeholders: ['john-doe'],
          dependencies: ['task-research'],
          priority: 'High',
          status: 'Completed',
          milestoneId: 'milestone-discovery',
          duration: 15
        },
        {
          id: 'task-wireframes',
          name: 'Wireframe & User Flow Design',
          description: 'Create detailed wireframes and user journey maps for new experience',
          startDate: '2024-08-01',
          endDate: '2024-08-15',
          baselineStartDate: '2024-08-01',
          baselineEndDate: '2024-08-15',
          progress: 100,
          assignedResources: ['emily'],
          assignedStakeholders: ['jane-smith'],
          dependencies: ['task-analysis'],
          priority: 'High',
          status: 'Completed',
          milestoneId: 'milestone-design',
          duration: 14
        },
        {
          id: 'task-prototypes',
          name: 'Interactive Prototypes',
          description: 'Build clickable prototypes for stakeholder review and user testing',
          startDate: '2024-08-16',
          endDate: '2024-08-31',
          baselineStartDate: '2024-08-16',
          baselineEndDate: '2024-08-31',
          progress: 100,
          assignedResources: ['emily', 'sarah'],
          assignedStakeholders: ['jane-smith', 'john-doe'],
          dependencies: ['task-wireframes'],
          priority: 'High',
          status: 'Completed',
          milestoneId: 'milestone-design',
          duration: 15
        },
        {
          id: 'task-components',
          name: 'React Component Library',
          description: 'Develop reusable React components based on approved designs',
          startDate: '2024-09-01',
          endDate: '2024-09-20',
          baselineStartDate: '2024-09-01',
          baselineEndDate: '2024-09-20',
          progress: 75,
          assignedResources: ['sarah', 'michael'],
          assignedStakeholders: ['john-doe'],
          dependencies: ['task-prototypes'],
          priority: 'High',
          status: 'In Progress',
          milestoneId: 'milestone-development',
          duration: 19
        },
        {
          id: 'task-checkout',
          name: 'Checkout Flow Implementation',
          description: 'Build and integrate the new streamlined checkout process',
          startDate: '2024-09-10',
          endDate: '2024-09-30',
          baselineStartDate: '2024-09-10',
          baselineEndDate: '2024-09-30',
          progress: 35,
          assignedResources: ['michael'],
          assignedStakeholders: ['john-doe'],
          dependencies: ['task-components'],
          priority: 'High',
          status: 'In Progress',
          milestoneId: 'milestone-development',
          duration: 20
        },
        {
          id: 'task-testing',
          name: 'QA Testing & Bug Fixes',
          description: 'Comprehensive testing across devices and browsers, performance optimization',
          startDate: '2024-10-01',
          endDate: '2024-10-20',
          baselineStartDate: '2024-10-01',
          baselineEndDate: '2024-10-20',
          progress: 0,
          assignedResources: ['sarah', 'emily'],
          assignedStakeholders: ['jane-smith'],
          dependencies: ['task-checkout'],
          priority: 'High',
          status: 'Not Started',
          milestoneId: 'milestone-testing',
          duration: 19
        },
        {
          id: 'task-deployment',
          name: 'Production Deployment',
          description: 'Deploy to production with monitoring and rollback capability',
          startDate: '2024-10-21',
          endDate: '2024-10-31',
          baselineStartDate: '2024-10-21',
          baselineEndDate: '2024-10-31',
          progress: 0,
          assignedResources: ['michael', 'david'],
          assignedStakeholders: ['john-doe'],
          dependencies: ['task-testing'],
          priority: 'High',
          status: 'Not Started',
          milestoneId: 'milestone-testing',
          duration: 10
        }
      ]
    };
    
    setAllProjects([realisticProject]);
    localStorage.setItem('projects', JSON.stringify([realisticProject]));
    
    // Schedule reminders for active tasks
    realisticProject.tasks.forEach(task => {
      if (task.status !== 'Completed') {
        scheduleTaskReminders(task, realisticProject);
      }
    });

    console.log('[ProjectContext] Initialized with realistic project data');
  };

  const scheduleTaskReminders = (task: ProjectTask, project: ProjectData) => {
    // Get resource info for email scheduling
    const resource = { 
      id: task.assignedResources[0] || 'unknown',
      name: task.assignedResources[0] || 'Unknown',
      email: `${task.assignedResources[0] || 'unknown'}@company.com`
    };
    
    emailService.scheduleTaskReminders(
      { ...task, deadline: task.endDate, dueDate: task.endDate },
      resource,
      project
    );
  };

  const handleTaskCompletionEffects = (projectId: string, taskId: string, resourceId: string) => {
    const project = allProjects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    
    if (project && task) {
      // Track performance
      performanceTracker.trackPositiveActivity(
        resourceId,
        'task_completion',
        8,
        `Completed task: ${task.name}`,
        projectId,
        taskId
      );

      // Send notification
      notificationService.onTaskCompleted(
        taskId,
        task.name,
        projectId,
        project.name,
        resourceId,
        resourceId // This would be resolved to actual resource name
      );

      // Check if milestone is complete
      const milestone = project.milestones.find(m => m.tasks.includes(taskId));
      if (milestone) {
        const milestoneComplete = milestone.tasks.every(tId => {
          const t = project.tasks.find(task => task.id === tId);
          return t?.status === 'Completed';
        });

        if (milestoneComplete && milestone.status !== 'completed') {
          updateMilestone(projectId, milestone.id, { status: 'completed', progress: 100 });
          notificationService.onProjectMilestone(milestone.id, milestone.name, projectId, project.name, true);
        }
      }
    }
  };

  const handleDeadlineAlert = (projectId: string, taskId: string, daysRemaining: number) => {
    const project = allProjects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    
    if (project && task) {
      notificationService.onDeadlineApproaching(taskId, task.name, projectId, project.name, daysRemaining);
    }
  };

  const getProject = (id: string): ProjectData | null => {
    return projects.find(p => p.id === id) || null;
  };

  const setCurrentProject = (projectId: string) => {
    const project = getProject(projectId);
    setCurrentProjectState(project);
  };

  const addProject = async (project: Omit<ProjectData, 'id'>) => {
    setLoading(true);
    // You may want to generate a UUID here or let Supabase do it
    const { data, error } = await supabase.from('projects').insert([project]).select().single();
    if (data) {
      setAllProjects(prev => [...prev, data]);
      // Optionally update localStorage for fallback
      localStorage.setItem('projects', JSON.stringify([...allProjects, data]));
    } else {
      // fallback to local logic if Supabase fails
      const newProject = { ...project, id: `proj-${Date.now()}` };
      setAllProjects(prev => [...prev, newProject]);
      localStorage.setItem('projects', JSON.stringify([...allProjects, newProject]));
    }
    setLoading(false);
  };

  const updateProject = (id: string, updates: Partial<ProjectData>) => {
    setAllProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    eventBus.emit('project_updated', { projectId: id, updates }, 'ProjectContext');
  };

  const addTask = (projectId: string, task: Omit<ProjectTask, 'id'>) => {
    const newTask: ProjectTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    
    setAllProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: [...p.tasks, newTask] }
        : p
    ));

    // Schedule email reminders for new task
    const project = getProject(projectId);
    if (project) {
      scheduleTaskReminders(newTask, project);
    }

    eventBus.emit('task_created', { taskId: newTask.id, projectId, task: newTask }, 'ProjectContext');
  };

  const updateTask = (projectId: string, taskId: string, updates: Partial<ProjectTask>) => {
    setAllProjects(prev => prev.map(p => 
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
          }
        : p
    ));

    eventBus.emit('task_updated', { taskId, projectId, updates }, 'ProjectContext');
  };

  const deleteTask = (projectId: string, taskId: string) => {
    setAllProjects(prev => prev.map(p => 
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.filter(t => t.id !== taskId)
          }
        : p
    ));
  };

  const completeTask = (projectId: string, taskId: string) => {
    const project = allProjects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    
    if (task && task.assignedResources.length > 0) {
      updateTask(projectId, taskId, { status: 'Completed', progress: 100 });
      
      // Emit completion event
      eventBus.emit('task_completed', {
        taskId,
        projectId,
        resourceId: task.assignedResources[0]
      }, 'ProjectContext');
    }
  };

  const assignTaskToResource = (projectId: string, taskId: string, resourceId: string) => {
    const project = allProjects.find(p => p.id === projectId);
    const task = project?.tasks.find(t => t.id === taskId);
    
    if (project && task) {
      updateTask(projectId, taskId, { 
        assignedResources: [...task.assignedResources, resourceId] 
      });

      notificationService.onResourceAssigned(resourceId, resourceId, projectId, project.name, task.name);
      
      eventBus.emit('resource_assigned', {
        resourceId,
        taskId,
        projectId
      }, 'ProjectContext');
    }
  };

  const addMilestone = (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => {
    const newMilestone: ProjectMilestone = {
      ...milestone,
      id: `milestone-${Date.now()}`
    };
    
    setAllProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, milestones: [...p.milestones, newMilestone] }
        : p
    ));
  };

  const updateMilestone = (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => {
    setAllProjects(prev => prev.map(p => 
      p.id === projectId
        ? {
            ...p,
            milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, ...updates } : m)
          }
        : p
    ));

    eventBus.emit('milestone_reached', { milestoneId, projectId, updates }, 'ProjectContext');
  };

  const rebaselineTasks = (projectId: string, request: RebaselineRequest) => {
    setAllProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      
      const updatedTasks = p.tasks.map(task => {
        if (task.id === request.taskId) {
          return {
            ...task,
            startDate: request.newStartDate,
            endDate: request.newEndDate
          };
        }
        
        // Update dependent tasks
        if (request.affectedTasks.includes(task.id)) {
          const daysDiff = new Date(request.newEndDate).getTime() - new Date(task.baselineEndDate).getTime();
          const daysToAdd = Math.ceil(daysDiff / (1000 * 60 * 60 * 24));
          
          const newStartDate = new Date(task.startDate);
          newStartDate.setDate(newStartDate.getDate() + daysToAdd);
          
          const newEndDate = new Date(task.endDate);
          newEndDate.setDate(newEndDate.getDate() + daysToAdd);
          
          return {
            ...task,
            startDate: newStartDate.toISOString().split('T')[0],
            endDate: newEndDate.toISOString().split('T')[0]
          };
        }
        
        return task;
      });
      
      return { ...p, tasks: updatedTasks };
    }));
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      loading,
      getProject,
      addProject,
      updateProject,
      addTask,
      updateTask,
      deleteTask,
      addMilestone,
      updateMilestone,
      rebaselineTasks,
      setCurrentProject,
      completeTask,
      assignTaskToResource
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
