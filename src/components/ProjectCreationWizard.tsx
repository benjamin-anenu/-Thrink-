
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// Step components
import ProjectDetailsStep from './project-creation/ProjectDetailsStep';
import ResourcePlanningStep from './project-creation/ResourcePlanningStep';
import StakeholderManagementStep from './project-creation/StakeholderManagementStep';
import MilestonePlanningStep from './project-creation/MilestonePlanningStep';
import BudgetStep from './project-creation/BudgetStep';
import ReviewStep from './project-creation/ReviewStep';

export interface ProjectCreationData {
  name: string;
  description: string;
  objectives: string[];
  deliverables: string[];
  resources: {
    teamMembers: Array<{
      id: string;
      name: string;
      role: string;
      allocation: number;
    }>;
    skills: string[];
    budget: number;
    timeline: {
      start: string;
      end: string;
    };
  };
  stakeholders: Array<{
    id: string;
    name: string;
    role: string;
    influence: string;
    interest: string;
  }>;
  risks: Array<{
    id: string;
    description: string;
    impact: string;
    probability: string;
    mitigation: string;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    date: string;
    description: string;
  }>;
  tags: string[];
}

interface ProjectCreationWizardProps {
  onProjectCreated: (data: ProjectCreationData) => void;
  onClose: () => void;
}

const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({
  onProjectCreated,
  onClose,
}) => {
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ProjectCreationData>({
    name: '',
    description: '',
    objectives: [],
    deliverables: [],
    resources: {
      teamMembers: [],
      skills: [],
      budget: 0,
      timeline: {
        start: '',
        end: '',
      },
    },
    stakeholders: [],
    risks: [],
    milestones: [],
    tags: [],
  });

  const steps = [
    { id: 1, title: 'Project Details', component: ProjectDetailsStep },
    { id: 2, title: 'Resource Allocation', component: ResourcePlanningStep },
    { id: 3, title: 'Stakeholder Management', component: StakeholderManagementStep },
    { id: 4, title: 'Timeline & Milestones', component: MilestonePlanningStep },
    { id: 5, title: 'Budget Planning', component: BudgetStep },
    { id: 6, title: 'Review & Create', component: ReviewStep },
  ];

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const handleDataChange = (stepData: Partial<ProjectCreationData>) => {
    setData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    const projectData = {
      name: data.name,
      description: data.description,
      status: 'Planning' as const,
      priority: 'Medium' as const,
      startDate: data.resources.timeline.start,
      endDate: data.resources.timeline.end,
      budget: data.resources.budget.toString(),
      teamSize: data.resources.teamMembers.length,
      healthStatus: 'green',
      healthScore: 100,
      skills: data.resources.skills,
      resources: data.resources.teamMembers.map(m => m.id),
      stakeholders: data.stakeholders.map(s => s.id),
      workspaceId: currentWorkspace?.id || '',
      tasks: [],
      milestones: data.milestones,
      progress: 0,
      tags: data.tags,
      health: {
        status: 'green' as const,
        score: 100,
      },
    };

    onProjectCreated(projectData);
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex justify-between items-center text-sm">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  step.id === currentStep
                    ? 'text-primary font-medium'
                    : step.id < currentStep
                    ? 'text-green-600'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                    step.id === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.id}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{currentStepData?.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {CurrentStepComponent && (
                <CurrentStepComponent
                  data={data}
                  onDataChange={handleDataChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onUpdate={handleDataChange}
                />
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Previous
            </Button>

            {currentStep === steps.length ? (
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                Create Project
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreationWizard;
