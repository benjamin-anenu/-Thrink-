import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useToast } from "@/components/ui/use-toast"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useProject } from '@/contexts/ProjectContext';
import { useResources } from '@/contexts/ResourceContext';
import { useSkills } from '@/hooks/useSkills';
import SkillSelect from '@/components/ui/skill-select';
import { addDays } from 'date-fns';
import { Stakeholder } from '@/types/project';
import { supabase } from '@/integrations/supabase/client';

interface ProjectData {
  name: string;
  description: string;
  status: string;
  priority: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: number;
  teamSize: number;
  healthStatus: string;
  healthScore: number;
  skills: string[];
  resources: string[];
  stakeholders: string[];
}

const ProjectCreationWizard = () => {
  const router = useRouter();
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<ProjectData>>({
    name: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    startDate: undefined,
    endDate: undefined,
    budget: 50000,
    teamSize: 5,
    healthStatus: 'green',
    healthScore: 85,
    skills: [],
    resources: [],
    stakeholders: []
  });
  const { currentWorkspace } = useWorkspace();
	const { addProject } = useProject();
  const { resources } = useResources();
  const { skills } = useSkills();
  const [availableStakeholders, setAvailableStakeholders] = useState<Stakeholder[]>([]);

  useEffect(() => {
    const fetchStakeholders = async () => {
      try {
        const { data: stakeholders, error } = await supabase
          .from('stakeholders')
          .select('*')
          .eq('workspace_id', currentWorkspace?.id);

        if (error) {
          console.error("Error fetching stakeholders:", error);
          return;
        }

        if (stakeholders) {
          setAvailableStakeholders(stakeholders);
        }
      } catch (error) {
        console.error("Error fetching stakeholders:", error);
      }
    };

    fetchStakeholders();
  }, [currentWorkspace?.id]);

  const totalSteps = 7;

  const onDataChange = (newData: Partial<ProjectData>) => {
    setData({ ...data, ...newData });
  };

  const handleCreateProject = async () => {
    if (!data.name || !data.description || !data.startDate || !data.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return;
    }

    const newProject = {
      name: data.name,
      description: data.description,
      status: data.status || 'Planning',
      priority: data.priority || 'Medium',
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      budget: data.budget || 50000,
      teamSize: data.teamSize || 5,
      healthStatus: data.healthStatus || 'green',
      healthScore: data.healthScore || 85,
      skills: data.skills || [],
      resources: data.resources || [],
      stakeholders: data.stakeholders || [],
			workspaceId: currentWorkspace?.id || 'ws-1'
    };

    const success = await addProject(newProject);
    if (success) {
      toast({
        title: "Success",
        description: "Project created successfully.",
      })
      router.push('/dashboard');
    } else {
      toast({
        title: "Error",
        description: "Failed to create project.",
        variant: "destructive",
      })
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-6 border-b border-border">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Create New Project</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-6">
        <div className="mb-8">
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {currentStep === 1 && (
          <ProjectDetailsStep
            data={data}
            onDataChange={onDataChange}
            onNext={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 2 && (
          <TimelineSetupStep
            data={data}
            onDataChange={onDataChange}
            onNext={() => setCurrentStep(3)}
            onPrevious={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <BudgetAllocationStep
            data={data}
            onDataChange={onDataChange}
            onNext={() => setCurrentStep(4)}
            onPrevious={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <TeamConfigurationStep
            data={data}
            onDataChange={onDataChange}
            onNext={() => setCurrentStep(5)}
            onPrevious={() => setCurrentStep(3)}
            availableResources={resources.map(resource => ({
              id: resource.id,
              name: resource.name,
              role: resource.role
            }))}
          />
        )}

        {currentStep === 5 && (
          <SkillsIdentificationStep
            data={data}
            onDataChange={onDataChange}
            onNext={() => setCurrentStep(6)}
            onPrevious={() => setCurrentStep(4)}
            availableSkills={skills.map(skill => ({
              id: skill.id,
              name: skill.name
            }))}
          />
        )}

        {currentStep === 6 && (
          <StakeholderManagementStep 
            data={data} 
            onDataChange={onDataChange}
            onUpdate={(stepData) => onDataChange(stepData)}
            onNext={() => setCurrentStep(7)}
            onPrevious={() => setCurrentStep(5)}
          />
        )}

        {currentStep === 7 && (
          <ConfirmationStep
            data={data}
            onPrevious={() => setCurrentStep(6)}
            onCreate={handleCreateProject}
          />
        )}
      </main>

      <footer className="py-4 px-6 border-t border-border">
        <div className="container mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <div>
            {currentStep > 1 && (
              <Button
                variant="secondary"
                className="mr-2"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next
              </Button>
            ) : (
              <Button onClick={handleCreateProject}>
                Create Project
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

interface ProjectDetailsStepProps {
  data: Partial<ProjectData>;
  onDataChange: (newData: Partial<ProjectData>) => void;
  onNext: () => void;
}

const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ data, onDataChange, onNext }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onDataChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
        <CardDescription>
          Enter basic information about your project.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Project Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            placeholder="Project Name"
            value={data.name || ''}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Project Description"
            value={data.description || ''}
            onChange={handleChange}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </Card>
  );
};

interface TimelineSetupStepProps {
  data: Partial<ProjectData>;
  onDataChange: (newData: Partial<ProjectData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const TimelineSetupStep: React.FC<TimelineSetupStepProps> = ({ data, onDataChange, onNext, onPrevious }) => {
  const handleStartDateChange = (date: Date | undefined) => {
    onDataChange({ ...data, startDate: date });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onDataChange({ ...data, endDate: date });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Setup</CardTitle>
        <CardDescription>
          Define the start and end dates for your project.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !data.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.startDate ? (
                    format(data.startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.startDate}
                  onSelect={handleStartDateChange}
                  disabled={(date) =>
                    date < new Date()
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !data.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.endDate ? (
                    format(data.endDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={data.endDate}
                  onSelect={handleEndDateChange}
                  disabled={(date) =>
                    date < new Date() || (data.startDate && date < data.startDate)
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>Previous</Button>
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </Card>
  );
};

interface BudgetAllocationStepProps {
  data: Partial<ProjectData>;
  onDataChange: (newData: Partial<ProjectData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const BudgetAllocationStep: React.FC<BudgetAllocationStepProps> = ({ data, onDataChange, onNext, onPrevious }) => {
  const handleBudgetChange = (value: number[]) => {
    onDataChange({ ...data, budget: value[0] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Allocation</CardTitle>
        <CardDescription>
          Set the budget for your project.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="budget">Budget</Label>
          <Slider
            defaultValue={[data.budget || 50000]}
            max={100000}
            step={1000}
            onValueChange={handleBudgetChange}
          />
          <p className="text-sm text-muted-foreground">
            ${data.budget || 50000}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>Previous</Button>
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </Card>
  );
};

interface TeamConfigurationStepProps {
  data: Partial<ProjectData>;
  onDataChange: (newData: Partial<ProjectData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  availableResources: Array<{ id: string; name: string; role: string }>;
}

const TeamConfigurationStep: React.FC<TeamConfigurationStepProps> = ({ data, onDataChange, onNext, onPrevious, availableResources }) => {
  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onDataChange({ ...data, teamSize: value });
  };

  const handleResourceToggle = (resourceId: string) => {
    const currentResources = data.resources || [];
    if (currentResources.includes(resourceId)) {
      onDataChange({
        ...data,
        resources: currentResources.filter((id) => id !== resourceId),
      });
    } else {
      onDataChange({
        ...data,
        resources: [...currentResources, resourceId],
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Configuration</CardTitle>
        <CardDescription>
          Configure the team size and assign resources to your project.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <Input
            type="number"
            id="teamSize"
            name="teamSize"
            placeholder="Team Size"
            value={data.teamSize?.toString() || ''}
            onChange={handleTeamSizeChange}
          />
        </div>

        <div className="grid gap-2">
          <Label>Assign Resources</Label>
          <div className="flex flex-wrap gap-2">
            {availableResources.map((resource) => (
              <div key={resource.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`resource-${resource.id}`}
                  checked={data.resources?.includes(resource.id) || false}
                  onCheckedChange={() => handleResourceToggle(resource.id)}
                />
                <Label htmlFor={`resource-${resource.id}`}>
                  {resource.name} ({resource.role})
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>Previous</Button>
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </Card>
  );
};

interface SkillsIdentificationStepProps {
  data: Partial<ProjectData>;
  onDataChange: (newData: Partial<ProjectData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  availableSkills: Array<{ id: string; name: string }>;
}

const SkillsIdentificationStep: React.FC<SkillsIdentificationStepProps> = ({ data, onDataChange, onNext, onPrevious, availableSkills }) => {
  const handleSkillToggle = (skillId: string) => {
    const currentSkills = data.skills || [];
    if (currentSkills.includes(skillId)) {
      onDataChange({
        ...data,
        skills: currentSkills.filter((id) => id !== skillId),
      });
    } else {
      onDataChange({
        ...data,
        skills: [...currentSkills, skillId],
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills Identification</CardTitle>
        <CardDescription>
          Identify the required skills for your project.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label>Required Skills</Label>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map((skill) => (
              <div key={skill.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`skill-${skill.id}`}
                  checked={data.skills?.includes(skill.id) || false}
                  onCheckedChange={() => handleSkillToggle(skill.id)}
                />
                <Label htmlFor={`skill-${skill.id}`}>
                  {skill.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>Previous</Button>
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </Card>
  );
};

interface StakeholderManagementStepProps {
  data: Partial<ProjectData>;
  onDataChange: (newData: Partial<ProjectData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onUpdate: (stepData: Partial<ProjectData>) => void;
}

const StakeholderManagementStep: React.FC<StakeholderManagementStepProps> = ({ data, onDataChange, onNext, onPrevious, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    influence: 'medium' as 'low' | 'medium' | 'high'
  });
	const { currentWorkspace } = useWorkspace();
  const [availableStakeholders, setAvailableStakeholders] = useState<Stakeholder[]>([]);

  useEffect(() => {
    const fetchStakeholders = async () => {
      try {
        const { data: stakeholders, error } = await supabase
          .from('stakeholders')
          .select('*')
          .eq('workspace_id', currentWorkspace?.id);

        if (error) {
          console.error("Error fetching stakeholders:", error);
          return;
        }

        if (stakeholders) {
          setAvailableStakeholders(stakeholders);
        }
      } catch (error) {
        console.error("Error fetching stakeholders:", error);
      }
    };

    fetchStakeholders();
  }, [currentWorkspace?.id]);

  const addStakeholder = async (newStakeholder: any) => {
    try {
      const { data, error } = await supabase
        .from('stakeholders')
        .insert([newStakeholder])
        .select();

      if (error) {
        console.error("Error adding stakeholder:", error);
        return false;
      }

      if (data) {
        setAvailableStakeholders(prev => [...prev, data[0]]);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error adding stakeholder:", error);
      return false;
    }
  };

  const handleStakeholderToggle = (stakeholderId: string) => {
    const currentStakeholders = data.stakeholders || [];
    if (currentStakeholders.includes(stakeholderId)) {
      onDataChange({
        ...data,
        stakeholders: currentStakeholders.filter((id) => id !== stakeholderId),
      });
    } else {
      onDataChange({
        ...data,
        stakeholders: [...currentStakeholders, stakeholderId],
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (formData.name && formData.email && formData.role && formData.influence) {
      const newStakeholder = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        influence: formData.influence,
        workspace_id: currentWorkspace?.id || '',
        interest: 'medium' as const,
        notes: '',
        projects: [],
        phone: '',
        department: '',
        communicationPreference: 'Email' as const,
        organization: '',
        influenceLevel: formData.influence,
        escalationLevel: 1,
        contactInfo: {}
      };

      const success = await addStakeholder(newStakeholder);
      if (success) {
        setFormData({
          name: '',
          email: '',
          role: '',
          influence: 'medium'
        });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stakeholder Management</CardTitle>
        <CardDescription>
          Manage stakeholders involved in your project.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="stakeholderName">Stakeholder Name</Label>
            <Input
              type="text"
              id="stakeholderName"
              name="name"
              placeholder="Stakeholder Name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stakeholderEmail">Stakeholder Email</Label>
            <Input
              type="email"
              id="stakeholderEmail"
              name="email"
              placeholder="Stakeholder Email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="stakeholderRole">Stakeholder Role</Label>
            <Input
              type="text"
              id="stakeholderRole"
              name="role"
              placeholder="Stakeholder Role"
              value={formData.role}
              onChange={handleInputChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stakeholderInfluence">Influence Level</Label>
            <Select name="influence" value={formData.influence} onValueChange={(value) => setFormData({ ...formData, influence: value as 'low' | 'medium' | 'high' })}>
              <SelectTrigger>
                <SelectValue placeholder="Influence Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSubmit}>Add Stakeholder</Button>

        <div className="grid gap-2">
          <Label>Project Stakeholders</Label>
          <div className="flex flex-wrap gap-2">
            {availableStakeholders.map((stakeholder) => (
              <div key={stakeholder.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`stakeholder-${stakeholder.id}`}
                  checked={data.stakeholders?.includes(stakeholder.id) || false}
                  onCheckedChange={() => handleStakeholderToggle(stakeholder.id)}
                />
                <Label htmlFor={`stakeholder-${stakeholder.id}`}>
                  {stakeholder.name} ({stakeholder.role})
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>Previous</Button>
        <Button onClick={onNext}>Next</Button>
      </CardFooter>
    </Card>
  );
};

interface ConfirmationStepProps {
  data: Partial<ProjectData>;
  onPrevious: () => void;
  onCreate: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({ data, onPrevious, onCreate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirmation</CardTitle>
        <CardDescription>
          Review your project details and confirm to create the project.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label>Project Name</Label>
          <p>{data.name}</p>
        </div>
        <div className="grid gap-2">
          <Label>Description</Label>
          <p>{data.description}</p>
        </div>
        <div className="grid gap-2">
          <Label>Start Date</Label>
          <p>{data.startDate?.toLocaleDateString()}</p>
        </div>
        <div className="grid gap-2">
          <Label>End Date</Label>
          <p>{data.endDate?.toLocaleDateString()}</p>
        </div>
        <div className="grid gap-2">
          <Label>Budget</Label>
          <p>${data.budget}</p>
        </div>
        <div className="grid gap-2">
          <Label>Team Size</Label>
          <p>{data.teamSize}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>Previous</Button>
        <Button onClick={onCreate}>Create Project</Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCreationWizard;
