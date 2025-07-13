
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import KickoffSessionStep from '@/components/project-creation/KickoffSessionStep';
import RequirementsGatheringStep from '@/components/project-creation/RequirementsGatheringStep';
import ResourcePlanningStep from '@/components/project-creation/ResourcePlanningStep';
import StakeholderManagementStep from '@/components/project-creation/StakeholderManagementStep';
import MilestonePlanningStep from '@/components/project-creation/MilestonePlanningStep';
import AIReviewStep from '@/components/project-creation/AIReviewStep';
import ProjectInitiationStep from '@/components/project-creation/ProjectInitiationStep';

interface ProjectCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: any) => void;
}

interface ProjectData {
  name: string;
  description: string;
  kickoffData: {
    documents: File[];
    meetingMinutes: string;
    objectives: string[];
  };
  requirements: {
    functional: string[];
    nonFunctional: string[];
    constraints: string[];
    stakeholderSignoffs: boolean[];
  };
  resources: {
    teamMembers: any[];
    budget: string;
    timeline: { start: string; end: string };
  };
  stakeholders: any[];
  escalationMatrix: any[];
  milestones: any[];
  aiGenerated: {
    projectPlan: string;
    riskAssessment: string;
    recommendations: string[];
  };
  initiation: {
    document: string;
    signatures: any[];
    approved: boolean;
  };
}

const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    description: '',
    kickoffData: {
      documents: [],
      meetingMinutes: '',
      objectives: []
    },
    requirements: {
      functional: [],
      nonFunctional: [],
      constraints: [],
      stakeholderSignoffs: []
    },
    resources: {
      teamMembers: [],
      budget: '',
      timeline: { start: '', end: '' }
    },
    stakeholders: [],
    escalationMatrix: [],
    milestones: [],
    aiGenerated: {
      projectPlan: '',
      riskAssessment: '',
      recommendations: []
    },
    initiation: {
      document: '',
      signatures: [],
      approved: false
    }
  });

  const steps = [
    { number: 1, title: 'Kickoff Session', component: KickoffSessionStep },
    { number: 2, title: 'Requirements Gathering', component: RequirementsGatheringStep },
    { number: 3, title: 'Resource Planning', component: ResourcePlanningStep },
    { number: 4, title: 'Stakeholder Management', component: StakeholderManagementStep },
    { number: 5, title: 'Milestone Planning', component: MilestonePlanningStep },
    { number: 6, title: 'AI Review & Planning', component: AIReviewStep },
    { number: 7, title: 'Project Initiation', component: ProjectInitiationStep }
  ];

  const currentStepData = steps[currentStep - 1];
  const StepComponent = currentStepData.component;
  const progress = (currentStep / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepData = (stepData: any) => {
    setProjectData(prev => ({ ...prev, ...stepData }));
  };

  const handleFinish = () => {
    onProjectCreated(projectData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {steps.length}: {currentStepData.title}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          <StepComponent
            data={projectData}
            onDataChange={handleStepData}
          />
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={handleNext} className="flex items-center gap-2">
                Next
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="bg-primary">
                Create Project
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreationWizard;
