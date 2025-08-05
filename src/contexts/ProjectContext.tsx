import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectData, ProjectTask, ProjectMilestone, RebaselineRequest } from '@/types/project';
import { PerformanceTracker } from '@/services/PerformanceTracker';
import { EmailReminderService } from '@/services/EmailReminderService';
import { NotificationIntegrationService } from '@/services/NotificationIntegrationService';
import { eventBus } from '@/services/EventBus';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { ProjectCreationService } from '@/services/ProjectCreationService';

interface ProjectContextType {
  projects: ProjectData[];
  currentProject: ProjectData | null;
  loading: boolean;
  getProject: (id: string) => ProjectData | null;
  addProject: (project: Omit<ProjectData, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectData>) => Promise<void>;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id'>) => Promise<void>;
  updateTask: (projectId: string, taskId: string, updates: Partial<ProjectTask>) => Promise<void>;
  deleteTask: (projectId: string, taskId: string) => Promise<void>;
  addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => Promise<void>;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => Promise<void>;
  rebaselineTasks: (projectId: string, request: RebaselineRequest) => Promise<void>;
  setCurrentProject: (projectId: string) => void;
  completeTask: (projectId: string, taskId: string) => Promise<void>;
  assignTaskToResource: (projectId: string, taskId: string, resourceId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
  retryAIProcessing: (projectId: string) => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  // Filter projects by current workspace
  const projects = allProjects.filter(project => 
    currentWorkspace ? project.workspaceId === currentWorkspace.id : true
  );

  // Set up real-time updates for project changes
  useEffect(() => {
    if (!currentWorkspace) return;

    const channel = supabase
      .channel('project-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'projects',
          filter: `workspace_id=eq.${currentWorkspace.id}`
        },
        (payload) => {
          console.log('Project updated:', payload);
          // Update the project in our state
          setAllProjects(prev => prev.map(project => 
            project.id === payload.new.id 
              ? { ...project, 
                  aiProcessingStatus: payload.new.ai_processing_status,
                  aiProcessingStartedAt: payload.new.ai_processing_started_at,
                  aiProcessingCompletedAt: payload.new.ai_processing_completed_at
                }
              : project
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace]);

  // Initialize services
  const performanceTracker = PerformanceTracker.getInstance();
  const emailService = EmailReminderService.getInstance();
  const notificationService = NotificationIntegrationService.getInstance();

  // Load projects from Supabase when workspace changes
  useEffect(() => {
    if (currentWorkspace) {
      console.log('[ProjectContext] Workspace changed, refreshing projects for:', currentWorkspace.name);
      refreshProjects();
    } else {
      console.log('[ProjectContext] No workspace, clearing projects');
      setAllProjects([]);
      setLoading(false);
    }
  }, [currentWorkspace]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentWorkspace) return;

    const channel = supabase
      .channel('project_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `workspace_id=eq.${currentWorkspace.id}`
        },
        () => {
          refreshProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace]);

  // Set up event listeners for tasks and deadlines
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

  const refreshProjects = async () => {
    if (!currentWorkspace) {
      console.log('[ProjectContext] No workspace, skipping project refresh');
      return;
    }
    
    console.log('[ProjectContext] Refreshing projects for workspace:', currentWorkspace.name);
    setLoading(true);
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select(`
          *,
          milestones (
            id,
            name,
            description,
            due_date,
            baseline_date,
            status,
            progress,
            task_ids
          ),
          stakeholders (
            id,
            name,
            email,
            role,
            organization,
            influence_level,
            contact_info,
            escalation_level
          )
        `)
        .eq('workspace_id', currentWorkspace.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our ProjectData interface
      const transformedProjects: ProjectData[] = (projectsData || []).map(project => {
        console.log(`[ProjectContext] Raw project data for ${project.name}:`, {
          computed_start_date: project.computed_start_date,
          computed_end_date: project.computed_end_date,
          start_date: project.start_date,
          end_date: project.end_date
        });
        
        return {
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status as any,
        priority: project.priority as any,
        progress: project.progress || 0,
        health: {
          status: project.health_status as any,
          score: project.health_score || 100
        },
        startDate: project.start_date || '',
        endDate: project.end_date || '',
        computed_start_date: project.computed_start_date,
        computed_end_date: project.computed_end_date,
        teamSize: project.team_size || 0,
        budget: project.budget || '',
        tags: project.tags || [],
        workspaceId: project.workspace_id,
        resources: project.resources || [],
        stakeholders: project.stakeholder_ids || [],
        milestones: (project.milestones || []).map((m: any) => ({
          id: m.id,
          name: m.name,
          description: m.description || '',
          date: m.due_date || '',
          baselineDate: m.baseline_date || '',
          status: m.status || 'upcoming',
          tasks: m.task_ids || [],
          progress: m.progress || 0
        })),
        tasks: [], // Will be populated by loadProjectTasks
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        aiProcessingStatus: (project.ai_processing_status as 'pending' | 'processing' | 'completed' | 'failed') || 'pending',
        aiProcessingStartedAt: project.ai_processing_started_at,
        aiProcessingCompletedAt: project.ai_processing_completed_at
        };
      });

      setAllProjects(transformedProjects);
      
      // Load tasks for all projects
      await loadProjectTasks(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Fallback to demo data if there's an error
      initializeRealisticProject();
    } finally {
      setLoading(false);
    }
  };

  const loadProjectTasks = async (projects: ProjectData[]) => {
    if (projects.length === 0) return;

    try {
      const { data: tasksData, error } = await supabase
        .from('project_tasks')
        .select('*')
        .in('project_id', projects.map(p => p.id));

      if (error) throw error;

      // Group tasks by project ID and update project state
      const tasksByProject: Record<string, ProjectTask[]> = {};
      tasksData?.forEach(task => {
        if (!tasksByProject[task.project_id]) {
          tasksByProject[task.project_id] = [];
        }
        tasksByProject[task.project_id].push({
          id: task.id,
          name: task.name,
          description: task.description || '',
          startDate: task.start_date || '',
          endDate: task.end_date || '',
          baselineStartDate: task.baseline_start_date || task.start_date || '',
          baselineEndDate: task.baseline_end_date || task.end_date || '',
          progress: task.progress || 0,
          assignedResources: task.assigned_resources || [],
          assignedStakeholders: task.assigned_stakeholders || [],
          dependencies: task.dependencies || [],
          priority: (task.priority as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
          status: (task.status as 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled' | 'Not Started') || 'Not Started',
          milestoneId: task.milestone_id,
          duration: task.duration || 1,
          parentTaskId: task.parent_task_id,
          hierarchyLevel: task.hierarchy_level || 0,
          sortOrder: task.sort_order || 0,
          manualOverrideDates: task.manual_override_dates || false
        });
      });

      // Update projects with their tasks and fetch AI data
      await loadProjectAIData(projects, tasksByProject);
    } catch (error) {
      console.error('Error loading project tasks:', error);
    }
  };

  const loadProjectAIData = async (projects: ProjectData[], tasksByProject: Record<string, ProjectTask[]>) => {
    try {
      const { data: aiData, error } = await supabase
        .from('project_ai_data')
        .select('*')
        .in('project_id', projects.map(p => p.id));

      if (error) throw error;

      // Group AI data by project ID
      const aiDataByProject: Record<string, any> = {};
      aiData?.forEach(data => {
        aiDataByProject[data.project_id] = data;
      });

      // Update projects with tasks and AI data
      setAllProjects(prev => prev.map(project => ({
        ...project,
        tasks: tasksByProject[project.id] || [],
        aiGenerated: {
          projectPlan: aiDataByProject[project.id]?.project_plan || '',
          riskAssessment: aiDataByProject[project.id]?.risk_assessment || '',
          recommendations: aiDataByProject[project.id]?.recommendations || []
        }
      })));
    } catch (error) {
      console.error('Error loading project AI data:', error);
      // Still update projects with tasks even if AI data fails
      setAllProjects(prev => prev.map(project => ({
        ...project,
        tasks: tasksByProject[project.id] || []
      })));
    }
  };

  const initializeRealisticProject = () => {
    if (!currentWorkspace) return;
    
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
      workspaceId: currentWorkspace.id,
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
          duration: 14,
          hierarchyLevel: 0,
          sortOrder: 100
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
          duration: 15,
          hierarchyLevel: 0,
          sortOrder: 200
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
          duration: 14,
          hierarchyLevel: 0,
          sortOrder: 300
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
          duration: 15,
          hierarchyLevel: 0,
          sortOrder: 400
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
          duration: 19,
          hierarchyLevel: 0,
          sortOrder: 500
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
          duration: 20,
          hierarchyLevel: 0,
          sortOrder: 600
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
          duration: 19,
          hierarchyLevel: 0,
          sortOrder: 700
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
          duration: 10,
          hierarchyLevel: 0,
          sortOrder: 800
        }
      ]
    };
    
    setAllProjects([realisticProject]);
    
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
      performanceTracker.trackPositiveActivity(
        resourceId,
        'task_completion',
        8,
        `Completed task: ${task.name}`,
        projectId,
        taskId
      );

      notificationService.onTaskCompleted(
        taskId,
        task.name,
        projectId,
        project.name,
        resourceId,
        resourceId
      );

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

  const addProject = async (projectData: Omit<ProjectData, 'id'>) => {
    if (!currentWorkspace) throw new Error('No workspace selected');
    
    setLoading(true);
    try {
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          workspace_id: currentWorkspace.id,
          priority: projectData.priority || 'Medium',
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          budget: projectData.budget,
          tags: projectData.tags || [],
          resources: projectData.resources || [],
          status: projectData.status || 'Planning',
          progress: projectData.progress || 0,
          health_status: projectData.health?.status || 'green',
          health_score: projectData.health?.score || 100,
          team_size: projectData.teamSize || 0,
          stakeholder_ids: projectData.stakeholders || [],
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await refreshProjects();
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, updates: Partial<ProjectData>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          priority: updates.priority,
          start_date: updates.startDate,
          end_date: updates.endDate,
          budget: updates.budget,
          tags: updates.tags,
          resources: updates.resources,
          status: updates.status,
          progress: updates.progress,
          health_status: updates.health?.status,
          health_score: updates.health?.score,
          team_size: updates.teamSize,
          stakeholder_ids: updates.stakeholders
        })
        .eq('id', id);

      if (error) throw error;
      
      await refreshProjects();
      eventBus.emit('project_updated', { projectId: id, updates }, 'ProjectContext');
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const addTask = async (projectId: string, task: Omit<ProjectTask, 'id'>) => {
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

  const updateTask = async (projectId: string, taskId: string, updates: Partial<ProjectTask>) => {
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

  const deleteTask = async (projectId: string, taskId: string) => {
    setAllProjects(prev => prev.map(p => 
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.filter(t => t.id !== taskId)
          }
        : p
    ));
  };

  const completeTask = async (projectId: string, taskId: string) => {
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

  const assignTaskToResource = async (projectId: string, taskId: string, resourceId: string) => {
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

  const addMilestone = async (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .insert({
          project_id: projectId,
          name: milestone.name,
          description: milestone.description,
          due_date: milestone.date,
          baseline_date: milestone.baselineDate,
          status: milestone.status,
          task_ids: milestone.tasks,
          progress: milestone.progress || 0
        });

      if (error) throw error;
      await refreshProjects();
    } catch (error) {
      console.error('Error adding milestone:', error);
      throw error;
    }
  };

  const updateMilestone = async (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => {
    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          name: updates.name,
          description: updates.description,
          due_date: updates.date,
          baseline_date: updates.baselineDate,
          status: updates.status,
          task_ids: updates.tasks,
          progress: updates.progress
        })
        .eq('id', milestoneId);

      if (error) throw error;
      
      await refreshProjects();
      eventBus.emit('milestone_reached', { milestoneId, projectId, updates }, 'ProjectContext');
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  };

  const rebaselineTasks = async (projectId: string, request: RebaselineRequest) => {
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

  // Retry AI processing function
  const retryAIProcessing = async (projectId: string) => {
    try {
      // Update status to processing
      await supabase
        .from('projects')
        .update({ 
          ai_processing_status: 'processing',
          ai_processing_started_at: new Date().toISOString()
        })
        .eq('id', projectId);

      // Trigger background AI processing
      const { error } = await supabase.functions.invoke('process-project-ai', {
        body: { projectId }
      });

      if (error) throw error;
      
      await refreshProjects();
    } catch (error) {
      console.error('Error retrying AI processing:', error);
      
      // Update status to failed
      await supabase
        .from('projects')
        .update({ 
          ai_processing_status: 'failed',
          ai_processing_completed_at: new Date().toISOString()
        })
        .eq('id', projectId);
        
      throw error;
    }
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
      assignTaskToResource,
      refreshProjects,
      retryAIProcessing
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
