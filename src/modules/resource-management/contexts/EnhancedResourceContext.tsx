import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dataPersistence } from '@/services/DataPersistence';
import { contextSynchronizer } from '@/services/ContextSynchronizer';
import { eventBus } from '@/services/EventBus';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// Import new types
import { 
  ResourceProfile, 
  TaskUtilizationMetrics, 
  TaskAvailability,
  SkillProficiency 
} from '../types/ResourceProfile';
import { TaskIntelligence, TaskAssignmentRecommendation } from '../types/TaskIntelligence';

// Import AI engines
import { TaskBasedUtilizationEngine } from '../services/TaskBasedUtilizationEngine';
import { TaskBasedAssignmentAI } from '../services/TaskBasedAssignmentAI';

// Legacy Resource interface for backward compatibility
export interface Resource {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  availability: number;
  currentProjects: string[];
  hourlyRate: string;
  utilization: number;
  status: 'Available' | 'Busy' | 'Overallocated';
  workspaceId: string;
  createdAt?: string;
  updatedAt?: string;
  lastActive?: string;
}

// Enhanced context interface that extends the legacy interface
interface EnhancedResourceContextType {
  // Legacy interface (maintained for backward compatibility)
  resources: Resource[];
  loading: boolean;
  getResource: (id: string) => Resource | null;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
  assignToProject: (resourceId: string, projectId: string) => void;
  removeFromProject: (resourceId: string, projectId: string) => void;
  updateUtilization: (resourceId: string, utilization: number) => void;
  getAvailableResources: () => Resource[];
  getResourcesByProject: (projectId: string) => Resource[];

  // Enhanced AI-powered features
  resourceProfiles: ResourceProfile[];
  getResourceProfile: (id: string) => ResourceProfile | null;
  updateResourceProfile: (id: string, updates: Partial<ResourceProfile>) => Promise<void>;
  addResourceProfile: (profile: Omit<ResourceProfile, 'id'>) => Promise<void>;
  
  // AI-powered utilization and assignment
  getTaskUtilization: (resourceId: string, period: 'day' | 'week' | 'month') => Promise<TaskUtilizationMetrics>;
  getTaskAvailability: (resourceId: string, period: 'day' | 'week') => Promise<TaskAvailability>;
  getAssignmentRecommendations: (projectId: string) => Promise<TaskAssignmentRecommendation[]>;
  
  // Skill management
  updateSkillProficiency: (resourceId: string, skill: SkillProficiency) => Promise<void>;
  getResourceSkills: (resourceId: string) => SkillProficiency[];
  
  // One-time setup and onboarding
  completeResourceOnboarding: (resourceId: string, preferences: ResourceOnboardingData) => Promise<void>;
  isResourceOnboarded: (resourceId: string) => boolean;
  
  // Analytics and insights
  getCrossProjectAnalytics: () => Promise<CrossProjectAnalytics>;
  getResourceEfficiencyMetrics: (resourceId: string) => Promise<ResourceEfficiencyMetrics>;
  
  // Real-time data collection status
  dataCollectionStatus: DataCollectionStatus;
  refreshDataCollection: () => Promise<void>;
}

// New interfaces for enhanced features
interface ResourceOnboardingData {
  optimal_task_count_per_day: number;
  optimal_task_count_per_week: number;
  preferred_work_style: 'Deep Focus' | 'Collaborative' | 'Mixed';
  task_switching_preference: 'Sequential' | 'Parallel' | 'Batched';
  complexity_preferences: {
    simple_tasks_percentage: number;
    medium_tasks_percentage: number;
    complex_tasks_percentage: number;
  };
  skills: SkillProficiency[];
  career_aspirations: string[];
  mentorship_capacity: boolean;
}

interface CrossProjectAnalytics {
  overloaded_resources: string[];
  underutilized_resources: string[];
  skill_gaps: SkillGap[];
  reallocation_opportunities: ReallocationOpportunity[];
  capacity_predictions: CapacityPrediction[];
}

interface SkillGap {
  skill_name: string;
  required_proficiency: number;
  current_avg_proficiency: number;
  affected_projects: string[];
}

interface ReallocationOpportunity {
  resource_id: string;
  from_project: string;
  to_project: string;
  impact_score: number;
  reasoning: string;
}

interface CapacityPrediction {
  period: string;
  predicted_overload: string[];
  predicted_availability: string[];
  confidence: number;
}

interface ResourceEfficiencyMetrics {
  task_completion_rate: number;
  quality_score: number;
  learning_growth_rate: number;
  collaboration_effectiveness: number;
  optimal_utilization_adherence: number;
  recommendations: string[];
}

interface DataCollectionStatus {
  git_integration: 'connected' | 'disconnected' | 'error';
  task_tracking: 'active' | 'inactive' | 'error';
  communication_tracking: 'enabled' | 'disabled' | 'error';
  last_updated: Date;
  data_completeness: number; // 0-1 score
}

const EnhancedResourceContext = createContext<EnhancedResourceContextType | undefined>(undefined);

export const useEnhancedResources = () => {
  const context = useContext(EnhancedResourceContext);
  if (!context) {
    throw new Error('useEnhancedResources must be used within an EnhancedResourceProvider');
  }
  return context;
};

// Legacy hook for backward compatibility
export const useResources = () => {
  const context = useEnhancedResources();
  
  // Return only the legacy interface
  return {
    resources: context.resources,
    loading: context.loading,
    getResource: context.getResource,
    updateResource: context.updateResource,
    addResource: context.addResource,
    assignToProject: context.assignToProject,
    removeFromProject: context.removeFromProject,
    updateUtilization: context.updateUtilization,
    getAvailableResources: context.getAvailableResources,
    getResourcesByProject: context.getResourcesByProject,
  };
};

export const EnhancedResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State management
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceProfiles, setResourceProfiles] = useState<ResourceProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataCollectionStatus, setDataCollectionStatus] = useState<DataCollectionStatus>({
    git_integration: 'disconnected',
    task_tracking: 'inactive',
    communication_tracking: 'disabled',
    last_updated: new Date(),
    data_completeness: 0
  });

  // AI engines
  const [utilizationEngine] = useState(() => new TaskBasedUtilizationEngine());
  const [assignmentAI] = useState(() => new TaskBasedAssignmentAI());

  const { workspace } = useWorkspace();

  // Initialize data on workspace change
  useEffect(() => {
    if (workspace?.id) {
      loadResourceData();
      initializeDataCollection();
    }
  }, [workspace?.id]);

  // Load resource data (both legacy and enhanced)
  const loadResourceData = useCallback(async () => {
    if (!workspace?.id) return;

    setLoading(true);
    try {
      // Load legacy resources for backward compatibility
      const legacyResources = await dataPersistence.loadResources(workspace.id);
      setResources(legacyResources);

      // Load enhanced resource profiles
      const profiles = await dataPersistence.loadResourceProfiles(workspace.id);
      setResourceProfiles(profiles);

      // Sync any missing data between legacy and enhanced formats
      await syncLegacyWithEnhanced(legacyResources, profiles);
      
    } catch (error) {
      console.error('Error loading resource data:', error);
    } finally {
      setLoading(false);
    }
  }, [workspace?.id]);

  // Sync legacy resources with enhanced profiles
  const syncLegacyWithEnhanced = async (legacyResources: Resource[], profiles: ResourceProfile[]) => {
    const profileMap = new Map(profiles.map(p => [p.id, p]));
    
    for (const legacyResource of legacyResources) {
      if (!profileMap.has(legacyResource.id)) {
        // Create enhanced profile from legacy resource
        const enhancedProfile = await migrateResourceToEnhanced(legacyResource);
        setResourceProfiles(prev => [...prev, enhancedProfile]);
      }
    }
  };

  // Migrate legacy resource to enhanced profile
  const migrateResourceToEnhanced = async (resource: Resource): Promise<ResourceProfile> => {
    return {
      id: resource.id,
      employee_id: resource.id, // Use ID as employee_id for legacy data
      name: resource.name,
      email: resource.email,
      department_id: '', // Would need to map from department string
      role: resource.role,
      seniority_level: 'Mid', // Default value
      
      // Task handling patterns (defaults that can be customized)
      optimal_task_count_per_day: 3,
      optimal_task_count_per_week: 15,
      timezone: 'UTC',
      work_days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      preferred_work_style: 'Mixed',
      task_switching_preference: 'Sequential',
      
      // Performance metrics (to be calculated)
      historical_task_velocity: 0,
      complexity_handling_score: 5.0,
      collaboration_effectiveness: 0.5,
      learning_task_success_rate: 0.5,
      
      // Task productivity patterns (to be learned)
      peak_productivity_periods: [],
      task_switching_penalty_score: 5.0,
      new_project_ramp_up_tasks: 3,
      optimal_task_complexity_mix: {
        simple_tasks_percentage: 0.4,
        medium_tasks_percentage: 0.4,
        complex_tasks_percentage: 0.2
      },
      
      // Contract & availability
      employment_type: 'Full-time',
      contract_end_date: undefined,
      planned_time_off: [],
      recurring_commitments: [],
      
      // AI enhancement data
      strength_keywords: [],
      growth_areas: [],
      career_aspirations: [],
      mentorship_capacity: false,
      
      // Skills (convert from legacy string array)
      primary_skills: resource.skills.map((skill, index) => ({
        skill_id: `skill_${index}`,
        skill_name: skill,
        proficiency_level: 5, // Default medium proficiency
        years_experience: 1,
        last_used: new Date(),
        confidence_score: 5,
        improvement_trend: 'Stable' as const
      })),
      secondary_skills: [],
      learning_skills: [],
      
      // Tracking fields
      current_projects: resource.currentProjects,
      last_activity: new Date(),
      status: resource.status === 'Overallocated' ? 'Overloaded' : resource.status,
      
      // Workspace integration
      workspace_id: resource.workspaceId,
      created_at: new Date(resource.createdAt || Date.now()),
      updated_at: new Date(resource.updatedAt || Date.now())
    };
  };

  // Initialize automated data collection
  const initializeDataCollection = async () => {
    try {
      // Check and initialize various data collection integrations
      const gitStatus = await checkGitIntegration();
      const taskStatus = await checkTaskTrackingIntegration();
      const commStatus = await checkCommunicationIntegration();
      
      setDataCollectionStatus({
        git_integration: gitStatus,
        task_tracking: taskStatus,
        communication_tracking: commStatus,
        last_updated: new Date(),
        data_completeness: calculateDataCompleteness(gitStatus, taskStatus, commStatus)
      });
      
    } catch (error) {
      console.error('Error initializing data collection:', error);
    }
  };

  // Legacy methods (maintained for backward compatibility)
  const getResource = useCallback((id: string): Resource | null => {
    return resources.find(r => r.id === id) || null;
  }, [resources]);

  const updateResource = useCallback(async (id: string, updates: Partial<Resource>) => {
    setResources(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    await dataPersistence.updateResource(id, updates);
    
    // Also update enhanced profile if needed
    const profile = resourceProfiles.find(p => p.id === id);
    if (profile) {
      await updateResourceProfile(id, mapLegacyUpdatesToEnhanced(updates));
    }
  }, [resourceProfiles]);

  const addResource = useCallback(async (resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = {
      ...resource,
      id: `resource_${Date.now()}`
    };
    setResources(prev => [...prev, newResource]);
    await dataPersistence.addResource(newResource);
    
    // Also create enhanced profile
    const enhancedProfile = await migrateResourceToEnhanced(newResource);
    await addResourceProfile(enhancedProfile);
  }, []);

  const assignToProject = useCallback(async (resourceId: string, projectId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { ...r, currentProjects: [...r.currentProjects, projectId] }
        : r
    ));
    
    // Update enhanced profile
    setResourceProfiles(prev => prev.map(p =>
      p.id === resourceId
        ? { ...p, current_projects: [...p.current_projects, projectId] }
        : p
    ));
  }, []);

  const removeFromProject = useCallback(async (resourceId: string, projectId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { ...r, currentProjects: r.currentProjects.filter(pid => pid !== projectId) }
        : r
    ));
    
    // Update enhanced profile
    setResourceProfiles(prev => prev.map(p =>
      p.id === resourceId
        ? { ...p, current_projects: p.current_projects.filter(pid => pid !== projectId) }
        : p
    ));
  }, []);

  const updateUtilization = useCallback(async (resourceId: string, utilization: number) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, utilization } : r
    ));
  }, []);

  const getAvailableResources = useCallback((): Resource[] => {
    return resources.filter(r => r.status === 'Available');
  }, [resources]);

  const getResourcesByProject = useCallback((projectId: string): Resource[] => {
    return resources.filter(r => r.currentProjects.includes(projectId));
  }, [resources]);

  // Enhanced methods
  const getResourceProfile = useCallback((id: string): ResourceProfile | null => {
    return resourceProfiles.find(p => p.id === id) || null;
  }, [resourceProfiles]);

  const updateResourceProfile = useCallback(async (id: string, updates: Partial<ResourceProfile>) => {
    setResourceProfiles(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates, updated_at: new Date() } : p
    ));
    await dataPersistence.updateResourceProfile(id, updates);
  }, []);

  const addResourceProfile = useCallback(async (profile: Omit<ResourceProfile, 'id'>) => {
    const newProfile: ResourceProfile = {
      ...profile,
      id: `profile_${Date.now()}`
    };
    setResourceProfiles(prev => [...prev, newProfile]);
    await dataPersistence.addResourceProfile(newProfile);
  }, []);

  // AI-powered methods
  const getTaskUtilization = useCallback(async (
    resourceId: string, 
    period: 'day' | 'week' | 'month'
  ): Promise<TaskUtilizationMetrics> => {
    return await utilizationEngine.calculateTaskUtilization(resourceId, period);
  }, [utilizationEngine]);

  const getTaskAvailability = useCallback(async (
    resourceId: string, 
    period: 'day' | 'week'
  ): Promise<TaskAvailability> => {
    return await utilizationEngine.calculateTaskAvailability(resourceId, period);
  }, [utilizationEngine]);

  const getAssignmentRecommendations = useCallback(async (
    projectId: string
  ): Promise<TaskAssignmentRecommendation[]> => {
    const availableResources = resourceProfiles.filter(p => p.status === 'Available');
    return await assignmentAI.suggestOptimalAssignment(projectId, availableResources);
  }, [assignmentAI, resourceProfiles]);

  // Skill management
  const updateSkillProficiency = useCallback(async (
    resourceId: string, 
    skill: SkillProficiency
  ) => {
    setResourceProfiles(prev => prev.map(p => {
      if (p.id !== resourceId) return p;
      
      const updatedPrimarySkills = p.primary_skills.map(s => 
        s.skill_id === skill.skill_id ? skill : s
      );
      
      // If skill not found in primary, add it
      if (!updatedPrimarySkills.find(s => s.skill_id === skill.skill_id)) {
        updatedPrimarySkills.push(skill);
      }
      
      return { ...p, primary_skills: updatedPrimarySkills };
    }));
  }, []);

  const getResourceSkills = useCallback((resourceId: string): SkillProficiency[] => {
    const profile = getResourceProfile(resourceId);
    return profile ? [...profile.primary_skills, ...profile.secondary_skills] : [];
  }, [getResourceProfile]);

  // Onboarding
  const completeResourceOnboarding = useCallback(async (
    resourceId: string, 
    preferences: ResourceOnboardingData
  ) => {
    await updateResourceProfile(resourceId, {
      optimal_task_count_per_day: preferences.optimal_task_count_per_day,
      optimal_task_count_per_week: preferences.optimal_task_count_per_week,
      preferred_work_style: preferences.preferred_work_style,
      task_switching_preference: preferences.task_switching_preference,
      optimal_task_complexity_mix: preferences.complexity_preferences,
      primary_skills: preferences.skills,
      career_aspirations: preferences.career_aspirations,
      mentorship_capacity: preferences.mentorship_capacity
    });
  }, [updateResourceProfile]);

  const isResourceOnboarded = useCallback((resourceId: string): boolean => {
    const profile = getResourceProfile(resourceId);
    return profile ? profile.primary_skills.length > 0 && profile.career_aspirations.length > 0 : false;
  }, [getResourceProfile]);

  // Analytics
  const getCrossProjectAnalytics = useCallback(async (): Promise<CrossProjectAnalytics> => {
    // Implementation would analyze across all projects and resources
    return {
      overloaded_resources: [],
      underutilized_resources: [],
      skill_gaps: [],
      reallocation_opportunities: [],
      capacity_predictions: []
    };
  }, []);

  const getResourceEfficiencyMetrics = useCallback(async (
    resourceId: string
  ): Promise<ResourceEfficiencyMetrics> => {
    // Implementation would calculate efficiency metrics from historical data
    return {
      task_completion_rate: 0.85,
      quality_score: 8.2,
      learning_growth_rate: 0.15,
      collaboration_effectiveness: 0.75,
      optimal_utilization_adherence: 0.80,
      recommendations: [
        'Consider increasing complexity of assigned tasks',
        'Good collaboration patterns detected',
        'Schedule more learning opportunities'
      ]
    };
  }, []);

  const refreshDataCollection = useCallback(async () => {
    await initializeDataCollection();
  }, []);

  // Helper functions
  const mapLegacyUpdatesToEnhanced = (updates: Partial<Resource>): Partial<ResourceProfile> => {
    const mapped: Partial<ResourceProfile> = {};
    
    if (updates.name) mapped.name = updates.name;
    if (updates.email) mapped.email = updates.email;
    if (updates.role) mapped.role = updates.role;
    if (updates.status) {
      mapped.status = updates.status === 'Overallocated' ? 'Overloaded' : updates.status;
    }
    
    return mapped;
  };

  const checkGitIntegration = async (): Promise<'connected' | 'disconnected' | 'error'> => {
    // Implementation would check git integration status
    return 'disconnected';
  };

  const checkTaskTrackingIntegration = async (): Promise<'active' | 'inactive' | 'error'> => {
    // Implementation would check task tracking integration
    return 'inactive';
  };

  const checkCommunicationIntegration = async (): Promise<'enabled' | 'disabled' | 'error'> => {
    // Implementation would check communication integration
    return 'disabled';
  };

  const calculateDataCompleteness = (
    git: string, 
    task: string, 
    comm: string
  ): number => {
    let score = 0;
    if (git === 'connected') score += 0.4;
    if (task === 'active') score += 0.4;
    if (comm === 'enabled') score += 0.2;
    return score;
  };

  const contextValue: EnhancedResourceContextType = {
    // Legacy interface
    resources,
    loading,
    getResource,
    updateResource,
    addResource,
    assignToProject,
    removeFromProject,
    updateUtilization,
    getAvailableResources,
    getResourcesByProject,

    // Enhanced features
    resourceProfiles,
    getResourceProfile,
    updateResourceProfile,
    addResourceProfile,
    getTaskUtilization,
    getTaskAvailability,
    getAssignmentRecommendations,
    updateSkillProficiency,
    getResourceSkills,
    completeResourceOnboarding,
    isResourceOnboarded,
    getCrossProjectAnalytics,
    getResourceEfficiencyMetrics,
    dataCollectionStatus,
    refreshDataCollection,
  };

  return (
    <EnhancedResourceContext.Provider value={contextValue}>
      {children}
    </EnhancedResourceContext.Provider>
  );
};