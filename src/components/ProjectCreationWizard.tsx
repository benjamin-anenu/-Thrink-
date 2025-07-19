import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { ProjectCreationService, ProjectCreationData } from '@/services/ProjectCreationService';
import { ProjectDraftService, ProjectDraft } from '@/services/ProjectDraftService';
import { DraftManagementModal } from './DraftManagementModal';
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
  const [currentDraft, setCurrentDraft] = useState<ProjectDraft | null>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
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
    const newData = { ...projectData, ...stepData };
    setProjectData(newData);
    
    // Auto-save if we have a current workspace and project data
    if (currentWorkspace && (newData.name || currentDraft)) {
      autoSaveDraft(newData);
    }
  };

  const autoSaveDraft = async (data: ProjectCreationData) => {
    if (!currentWorkspace || autoSaving) return;
    
    const draftName = data.name || currentDraft?.draft_name || `Draft ${new Date().toLocaleString()}`;
    
    setAutoSaving(true);
    try {
      const draft = await ProjectDraftService.autoSaveDraft(
        draftName,
        currentWorkspace.id,
        data,
        currentStep,
        currentDraft?.id
      );
      setCurrentDraft(draft);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!currentWorkspace) {
      toast({
        title: "Error",
        description: "Please select a workspace first",
        variant: "destructive"
      });
      return;
    }

    const draftName = projectData.name || `Draft ${new Date().toLocaleString()}`;
    
    try {
      const draft = await ProjectDraftService.saveDraft(
        draftName,
        currentWorkspace.id,
        projectData,
        currentStep,
        currentDraft?.id
      );
      setCurrentDraft(draft);
      toast({
        title: "Success",
        description: "Draft saved successfully"
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Error",
        description: "Failed to save draft",
        variant: "destructive"
      });
    }
  };

  const handleLoadDraft = (draft: ProjectDraft) => {
    setProjectData(draft.draft_data);
    setCurrentStep(draft.current_step);
    setCurrentDraft(draft);
    toast({
      title: "Success",
      description: "Draft loaded successfully"
    });
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setProjectData({
      name: '',
      description: '',
      workspaceId: currentWorkspace?.id || '',
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
    setCurrentDraft(null);
    setIsCreating(false);
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
      
      // Delete the draft if it exists since project was created
      if (currentDraft) {
        try {
          await ProjectDraftService.deleteDraft(currentDraft.id);
        } catch (error) {
          console.error('Error deleting draft after project creation:', error);
        }
      }
      
      resetWizard();
      onClose();
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

  // Clear auto-save when component unmounts or dialog closes
  useEffect(() => {
    return () => {
      if (currentDraft) {
        ProjectDraftService.clearAutoSave(currentDraft.id);
      }
    };
  }, [currentDraft]);

  // Reset when dialog opens
  useEffect(() => {
    if (isOpen && !currentDraft) {
      resetWizard();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="project-creation-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">Create New Project</DialogTitle>
              <p id="project-creation-description" className="text-muted-foreground">
                Follow this guided wizard to set up your new project with all necessary details and configurations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {autoSaving && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                  Saving...
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDraftModal(true)}
              >
                <FolderOpen className="h-4 w-4 mr-1" />
                Load Draft
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={!currentWorkspace}
              >
                <Save className="h-4 w-4 mr-1" />
                Save Draft
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Step {currentStep} of {steps.length}: {currentStepData.title}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {currentStep === 5 ? (
            <StakeholderManagementStep
              data={projectData}
              onUpdate={handleStepData}
              onNext={handleNext}
              onPrevious={handleBack}
            />
          ) : (
            <StepComponent
              data={projectData}
              onDataChange={handleStepData}
            />
          )}
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

      <DraftManagementModal
        isOpen={showDraftModal}
        onClose={() => setShowDraftModal(false)}
        onLoadDraft={handleLoadDraft}
      />
    </Dialog>
  );
};

export default ProjectCreationWizard;
