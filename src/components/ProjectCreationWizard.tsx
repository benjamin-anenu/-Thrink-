
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { ProjectCreationService, ProjectCreationData } from '@/services/ProjectCreationService';
import ProjectDetailsStep from '@/components/project-creation/ProjectDetailsStep';
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

const ProjectCreationWizard: React.FC<ProjectCreationWizardProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [projectData, setProjectData] = useState<ProjectCreationData>({
    name: '',
    description: '',
    workspaceId: '',
    kickoffData: {
      meetingMinutes: '',
      objectives: [],
      documents: []
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

  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();

  // Set workspace ID when component mounts or workspace changes
  React.useEffect(() => {
    if (currentWorkspace) {
      setProjectData(prev => ({ ...prev, workspaceId: currentWorkspace.id }));
    }
  }, [currentWorkspace]);

  const steps = [
    { number: 1, title: 'Project Details', component: ProjectDetailsStep },
    { number: 2, title: 'Kickoff Session', component: KickoffSessionStep },
    { number: 3, title: 'Requirements Gathering', component: RequirementsGatheringStep },
    { number: 4, title: 'Resource Planning', component: ResourcePlanningStep },
    { number: 5, title: 'Stakeholder Management', component: StakeholderManagementStep },
    { number: 6, title: 'Milestone Planning', component: MilestonePlanningStep },
    { number: 7, title: 'AI Review & Planning', component: AIReviewStep },
    { number: 8, title: 'Project Initiation', component: ProjectInitiationStep }
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

  const handleFinish = async () => {
    if (!currentWorkspace) {
      toast({
        title: "Error",
        description: "No workspace selected. Please select a workspace first.",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    
    try {
      const project = await ProjectCreationService.createProject({
        ...projectData,
        workspaceId: currentWorkspace.id
      });

      toast({
        title: "Success!",
        description: `Project "${project.name}" has been created successfully.`,
      });

      onProjectCreated(project);
      onClose();
      
      // Reset form
      setCurrentStep(1);
      setProjectData({
        name: '',
        description: '',
        workspaceId: currentWorkspace.id,
        kickoffData: {
          meetingMinutes: '',
          objectives: [],
          documents: []
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
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="project-creation-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
          <p id="project-creation-description" className="text-muted-foreground">
            Follow this guided wizard to set up your new project with all necessary details and configurations.
          </p>
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
            disabled={currentStep === 1 || isCreating}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </Button>
            {currentStep < steps.length ? (
              <Button 
                onClick={handleNext} 
                className="flex items-center gap-2"
                disabled={isCreating}
              >
                Next
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button 
                onClick={handleFinish} 
                className="bg-primary"
                disabled={isCreating || !projectData.name}
              >
                {isCreating ? 'Creating Project...' : 'Create Project'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectCreationWizard;
