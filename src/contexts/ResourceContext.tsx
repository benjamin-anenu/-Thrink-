
import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

interface ResourceContextType {
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
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (!context) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};

export const ResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to ensure resource has required array properties
  const sanitizeResource = (resource: any): Resource => {
    return {
      ...resource,
      skills: Array.isArray(resource.skills) ? resource.skills : [],
      currentProjects: Array.isArray(resource.currentProjects) ? resource.currentProjects : []
    };
  };

  // Load resources from localStorage on mount
  useEffect(() => {
    const savedResources = localStorage.getItem('resources');
    if (savedResources) {
      try {
        const parsedResources = JSON.parse(savedResources);
        // Sanitize loaded resources to ensure arrays exist
        const sanitizedResources = parsedResources.map(sanitizeResource);
        setResources(sanitizedResources);
      } catch (error) {
        console.error('Error parsing saved resources:', error);
        // Fall back to sample data if localStorage is corrupted
        initializeSampleData();
      }
    } else {
      // Initialize with sample data
      initializeSampleData();
    }
  }, []);

  const initializeSampleData = () => {
    const sampleResources: Resource[] = [
      {
        id: 'sarah',
        name: 'Sarah Johnson',
        role: 'Senior Frontend Developer',
        department: 'Engineering',
        email: 'sarah.johnson@company.com',
        phone: '+1 (555) 123-4567',
        location: 'New York, NY',
        skills: ['React', 'TypeScript', 'CSS', 'UI/UX'],
        availability: 75,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$85/hr',
        utilization: 85,
        status: 'Available'
      },
      {
        id: 'michael',
        name: 'Michael Chen',
        role: 'Backend Developer',
        department: 'Engineering',
        email: 'michael.chen@company.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
        availability: 40,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$90/hr',
        utilization: 95,
        status: 'Busy'
      },
      {
        id: 'emily',
        name: 'Emily Rodriguez',
        role: 'UX Designer',
        department: 'Design',
        email: 'emily.rodriguez@company.com',
        phone: '+1 (555) 345-6789',
        location: 'Austin, TX',
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        availability: 90,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$75/hr',
        utilization: 60,
        status: 'Available'
      },
      {
        id: 'david',
        name: 'David Kim',
        role: 'Project Manager',
        department: 'Operations',
        email: 'david.kim@company.com',
        phone: '+1 (555) 456-7890',
        location: 'Seattle, WA',
        skills: ['Agile', 'Scrum', 'Risk Management', 'Stakeholder Management'],
        availability: 60,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$70/hr',
        utilization: 80,
        status: 'Available'
      },
      {
        id: 'james',
        name: 'James Wilson',
        role: 'DevOps Engineer',
        department: 'Engineering',
        email: 'james.wilson@company.com',
        phone: '+1 (555) 678-9012',
        location: 'Denver, CO',
        skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
        availability: 20,
        currentProjects: ['Project Alpha'],
        hourlyRate: '$95/hr',
        utilization: 100,
        status: 'Overallocated'
      }
    ];
    setResources(sampleResources);
    localStorage.setItem('resources', JSON.stringify(sampleResources));
  };

  // Save resources to localStorage whenever resources change
  useEffect(() => {
    if (resources.length > 0) {
      localStorage.setItem('resources', JSON.stringify(resources));
    }
  }, [resources]);

  const getResource = (id: string): Resource | null => {
    return resources.find(r => r.id === id) || null;
  };

  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(prev => prev.map(r => r.id === id ? sanitizeResource({ ...r, ...updates }) : r));
  };

  const addResource = (resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = sanitizeResource({
      ...resource,
      id: `resource-${Date.now()}`
    });
    setResources(prev => [...prev, newResource]);
  };

  const assignToProject = (resourceId: string, projectId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { ...r, currentProjects: [...r.currentProjects, projectId] }
        : r
    ));
  };

  const removeFromProject = (resourceId: string, projectId: string) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { ...r, currentProjects: r.currentProjects.filter(p => p !== projectId) }
        : r
    ));
  };

  const updateUtilization = (resourceId: string, utilization: number) => {
    setResources(prev => prev.map(r => 
      r.id === resourceId 
        ? { 
            ...r, 
            utilization,
            status: utilization > 100 ? 'Overallocated' : utilization > 80 ? 'Busy' : 'Available'
          }
        : r
    ));
  };

  const getAvailableResources = (): Resource[] => {
    return resources.filter(r => r.status === 'Available');
  };

  const getResourcesByProject = (projectId: string): Resource[] => {
    return resources.filter(r => r.currentProjects.includes(projectId));
  };

  return (
    <ResourceContext.Provider value={{
      resources,
      loading,
      getResource,
      updateResource,
      addResource,
      assignToProject,
      removeFromProject,
      updateUtilization,
      getAvailableResources,
      getResourcesByProject
    }}>
      {children}
    </ResourceContext.Provider>
  );
};
