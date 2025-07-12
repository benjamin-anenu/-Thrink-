
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProjectData, ProjectTask, ProjectMilestone, RebaselineRequest } from '@/types/project';

interface ProjectContextType {
  projects: ProjectData[];
  currentProject: ProjectData | null;
  loading: boolean;
  getProject: (id: string) => ProjectData | null;
  updateProject: (id: string, updates: Partial<ProjectData>) => void;
  addTask: (projectId: string, task: Omit<ProjectTask, 'id'>) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<ProjectTask>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  addMilestone: (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => void;
  updateMilestone: (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => void;
  rebaselineTasks: (projectId: string, request: RebaselineRequest) => void;
  setCurrentProject: (projectId: string) => void;
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
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [currentProject, setCurrentProjectState] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);

  // Load projects from localStorage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
    } else {
      // Initialize with sample data
      const sampleProject: ProjectData = {
        id: '1',
        name: 'E-commerce Platform Redesign',
        description: 'Complete overhaul of the user interface and user experience for our main e-commerce platform.',
        status: 'In Progress',
        priority: 'High',
        progress: 65,
        health: { status: 'green', score: 92 },
        startDate: '2024-01-15',
        endDate: '2024-04-30',
        teamSize: 8,
        budget: '$125,000',
        tags: ['Frontend', 'UX/UI', 'E-commerce'],
        resources: ['sarah', 'michael', 'emily', 'david', 'james'],
        stakeholders: ['john-doe', 'jane-smith', 'mike-wilson'],
        milestones: [
          {
            id: 'milestone-1',
            name: 'Project Planning & Setup',
            description: 'Initial project setup and team onboarding',
            date: '2024-01-25',
            baselineDate: '2024-01-25',
            status: 'completed',
            tasks: ['task-1', 'task-2'],
            progress: 100
          },
          {
            id: 'milestone-2',
            name: 'Design Phase Complete',
            description: 'UI/UX design mockups and prototypes finalized',
            date: '2024-02-28',
            baselineDate: '2024-02-25',
            status: 'completed',
            tasks: ['task-3', 'task-4'],
            progress: 100
          },
          {
            id: 'milestone-3',
            name: 'Development Phase 1',
            description: 'Core functionality implementation',
            date: '2024-03-31',
            baselineDate: '2024-03-31',
            status: 'in-progress',
            tasks: ['task-5', 'task-6'],
            progress: 45
          },
          {
            id: 'milestone-4',
            name: 'Testing & Deployment',
            description: 'Final testing and production deployment',
            date: '2024-04-30',
            baselineDate: '2024-04-30',
            status: 'upcoming',
            tasks: ['task-7', 'task-8'],
            progress: 0
          }
        ],
        tasks: [
          {
            id: 'task-1',
            name: 'Project Setup & Documentation',
            description: 'Initialize project structure and create documentation',
            startDate: '2024-01-15',
            endDate: '2024-01-20',
            baselineStartDate: '2024-01-15',
            baselineEndDate: '2024-01-20',
            progress: 100,
            assignedResources: ['david'],
            assignedStakeholders: ['john-doe'],
            dependencies: [],
            priority: 'High',
            status: 'Completed',
            milestoneId: 'milestone-1',
            duration: 5
          },
          {
            id: 'task-2',
            name: 'Team Onboarding',
            description: 'Onboard team members and set up development environment',
            startDate: '2024-01-21',
            endDate: '2024-01-25',
            baselineStartDate: '2024-01-21',
            baselineEndDate: '2024-01-25',
            progress: 100,
            assignedResources: ['david', 'sarah'],
            assignedStakeholders: ['john-doe'],
            dependencies: ['task-1'],
            priority: 'High',
            status: 'Completed',
            milestoneId: 'milestone-1',
            duration: 4
          },
          {
            id: 'task-3',
            name: 'User Research & Analysis',
            description: 'Conduct user research and analyze current system',
            startDate: '2024-01-26',
            endDate: '2024-02-10',
            baselineStartDate: '2024-01-26',
            baselineEndDate: '2024-02-08',
            progress: 100,
            assignedResources: ['emily'],
            assignedStakeholders: ['jane-smith'],
            dependencies: ['task-2'],
            priority: 'High',
            status: 'Completed',
            milestoneId: 'milestone-2',
            duration: 15
          },
          {
            id: 'task-4',
            name: 'UI/UX Design & Prototyping',
            description: 'Create design mockups and interactive prototypes',
            startDate: '2024-02-11',
            endDate: '2024-02-28',
            baselineStartDate: '2024-02-09',
            baselineEndDate: '2024-02-25',
            progress: 100,
            assignedResources: ['emily', 'sarah'],
            assignedStakeholders: ['jane-smith'],
            dependencies: ['task-3'],
            priority: 'High',
            status: 'Completed',
            milestoneId: 'milestone-2',
            duration: 17
          },
          {
            id: 'task-5',
            name: 'Frontend Development',
            description: 'Implement frontend components and user interface',
            startDate: '2024-03-01',
            endDate: '2024-03-20',
            baselineStartDate: '2024-03-01',
            baselineEndDate: '2024-03-20',
            progress: 65,
            assignedResources: ['sarah', 'michael'],
            assignedStakeholders: ['mike-wilson'],
            dependencies: ['task-4'],
            priority: 'High',
            status: 'In Progress',
            milestoneId: 'milestone-3',
            duration: 19
          },
          {
            id: 'task-6',
            name: 'Backend Integration',
            description: 'Implement backend API and database integration',
            startDate: '2024-03-10',
            endDate: '2024-03-31',
            baselineStartDate: '2024-03-10',
            baselineEndDate: '2024-03-31',
            progress: 25,
            assignedResources: ['michael', 'james'],
            assignedStakeholders: ['mike-wilson'],
            dependencies: ['task-4'],
            priority: 'Medium',
            status: 'In Progress',
            milestoneId: 'milestone-3',
            duration: 21
          },
          {
            id: 'task-7',
            name: 'Quality Assurance Testing',
            description: 'Comprehensive testing and bug fixes',
            startDate: '2024-04-01',
            endDate: '2024-04-20',
            baselineStartDate: '2024-04-01',
            baselineEndDate: '2024-04-20',
            progress: 0,
            assignedResources: ['sarah', 'emily'],
            assignedStakeholders: ['jane-smith'],
            dependencies: ['task-5', 'task-6'],
            priority: 'High',
            status: 'Not Started',
            milestoneId: 'milestone-4',
            duration: 19
          },
          {
            id: 'task-8',
            name: 'Production Deployment',
            description: 'Deploy to production and monitor system',
            startDate: '2024-04-21',
            endDate: '2024-04-30',
            baselineStartDate: '2024-04-21',
            baselineEndDate: '2024-04-30',
            progress: 0,
            assignedResources: ['james'],
            assignedStakeholders: ['john-doe', 'mike-wilson'],
            dependencies: ['task-7'],
            priority: 'High',
            status: 'Not Started',
            milestoneId: 'milestone-4',
            duration: 9
          }
        ]
      };
      setProjects([sampleProject]);
      localStorage.setItem('projects', JSON.stringify([sampleProject]));
    }
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }, [projects]);

  const getProject = (id: string): ProjectData | null => {
    return projects.find(p => p.id === id) || null;
  };

  const setCurrentProject = (projectId: string) => {
    const project = getProject(projectId);
    setCurrentProjectState(project);
  };

  const updateProject = (id: string, updates: Partial<ProjectData>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addTask = (projectId: string, task: Omit<ProjectTask, 'id'>) => {
    const newTask: ProjectTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, tasks: [...p.tasks, newTask] }
        : p
    ));
  };

  const updateTask = (projectId: string, taskId: string, updates: Partial<ProjectTask>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
          }
        : p
    ));
  };

  const deleteTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId
        ? {
            ...p,
            tasks: p.tasks.filter(t => t.id !== taskId)
          }
        : p
    ));
  };

  const addMilestone = (projectId: string, milestone: Omit<ProjectMilestone, 'id'>) => {
    const newMilestone: ProjectMilestone = {
      ...milestone,
      id: `milestone-${Date.now()}`
    };
    
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, milestones: [...p.milestones, newMilestone] }
        : p
    ));
  };

  const updateMilestone = (projectId: string, milestoneId: string, updates: Partial<ProjectMilestone>) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId
        ? {
            ...p,
            milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, ...updates } : m)
          }
        : p
    ));
  };

  const rebaselineTasks = (projectId: string, request: RebaselineRequest) => {
    setProjects(prev => prev.map(p => {
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
      updateProject,
      addTask,
      updateTask,
      deleteTask,
      addMilestone,
      updateMilestone,
      rebaselineTasks,
      setCurrentProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
