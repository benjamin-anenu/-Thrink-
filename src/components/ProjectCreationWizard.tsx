import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast"

interface ProjectCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (projectData: any) => void;
}

interface ProjectDetailsStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface RequirementsGatheringStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface StakeholderManagementStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface ResourcePlanningStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface MilestonePlanningStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface AIReviewStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface ProjectInitiationStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

interface KickoffSessionStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const ProjectDetailsStep: React.FC<ProjectDetailsStepProps> = ({ data, onDataChange, onNext, onPrevious }) => {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="details">
        <div className="space-y-4">
          <div>
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="Enter project name"
              value={data.projectName || ''}
              onChange={(e) => onDataChange({ projectName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="project-description">Description</Label>
            <Input
              id="project-description"
              placeholder="Enter project description"
              value={data.projectDescription || ''}
              onChange={(e) => onDataChange({ projectDescription: e.target.value })}
            />
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={onPrevious} disabled>
              Previous
            </Button>
            <Button type="button" onClick={onNext}>
              Next
            </Button>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="team">
        <div className="space-y-4">
          <div>
            <Label htmlFor="team-name">Team Name</Label>
            <Input
              id="team-name"
              placeholder="Enter team name"
              value={data.teamName || ''}
              onChange={(e) => onDataChange({ teamName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="team-description">Description</Label>
            <Input
              id="team-description"
              placeholder="Enter team description"
              value={data.teamDescription || ''}
              onChange={(e) => onDataChange({ teamDescription: e.target.value })}
            />
          </div>
          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={onPrevious} disabled>
              Previous
            </Button>
            <Button type="button" onClick={onNext}>
              Next
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const RequirementsGatheringStep: React.FC<RequirementsGatheringStepProps> = ({ data, onDataChange, onNext, onPrevious }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="requirements">Requirements</Label>
        <Input
          id="requirements"
          placeholder="Enter requirements"
          value={data.requirements || ''}
          onChange={(e) => onDataChange({ requirements: e.target.value })}
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

const StakeholderManagementStep: React.FC<StakeholderManagementStepProps> = ({ data, onDataChange, onUpdate, onNext, onPrevious }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="stakeholders">Stakeholders</Label>
        <Input
          id="stakeholders"
          placeholder="Enter stakeholders"
          value={data.stakeholders || ''}
          onChange={(e) => onDataChange({ stakeholders: e.target.value })}
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

const ResourcePlanningStep: React.FC<ResourcePlanningStepProps> = ({ data, onDataChange, onNext, onPrevious }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="resources">Resources</Label>
        <Input
          id="resources"
          placeholder="Enter resources"
          value={data.resources || ''}
          onChange={(e) => onDataChange({ resources: e.target.value })}
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

const MilestonePlanningStep: React.FC<MilestonePlanningStepProps> = ({ data, onDataChange, onNext, onPrevious }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="milestones">Milestones</Label>
        <Input
          id="milestones"
          placeholder="Enter milestones"
          value={data.milestones || ''}
          onChange={(e) => onDataChange({ milestones: e.target.value })}
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

const AIReviewStep: React.FC<AIReviewStepProps> = ({ data, onDataChange, onNext, onPrevious }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="ai-review">AI Review</Label>
        <Input
          id="ai-review"
          placeholder="Enter AI review"
          value={data.aiReview || ''}
          onChange={(e) => onDataChange({ aiReview: e.target.value })}
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

const ProjectInitiationStep: React.FC<ProjectInitiationStepProps> = ({ data, onDataChange, onNext, onPrevious }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="project-initiation">Project Initiation</Label>
        <Input
          id="project-initiation"
          placeholder="Enter project initiation"
          value={data.projectInitiation || ''}
          onChange={(e) => onDataChange({ projectInitiation: e.target.value })}
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

const KickoffSessionStep: React.FC<KickoffSessionStepProps> = ({ data, onDataChange, onNext, onPrevious }) => {
  const { toast } = useToast()

  const handleSubmit = () => {
    toast({
      title: "Project Created",
      description: "Your project has been created.",
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="kickoff-session">Kickoff Session</Label>
        <Input
          id="kickoff-session"
          placeholder="Enter kickoff session"
          value={data.kickoffSession || ''}
          onChange={(e) => onDataChange({ kickoffSession: e.target.value })}
        />
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="button" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default function ProjectCreationWizard({ isOpen, onClose, onProjectCreated }: ProjectCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({});
  const totalSteps = 8;

  const handleStepUpdate = (stepData: any) => {
    setData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectDetailsStep
            data={data}
            onDataChange={handleStepUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <RequirementsGatheringStep
            data={data}
            onDataChange={handleStepUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <StakeholderManagementStep
            data={data}
            onDataChange={handleStepUpdate}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 4:
        return (
          <ResourcePlanningStep
            data={data}
            onDataChange={handleStepUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 5:
        return (
          <MilestonePlanningStep
            data={data}
            onDataChange={handleStepUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 6:
        return (
          <AIReviewStep
            data={data}
            onDataChange={handleStepUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 7:
        return (
          <ProjectInitiationStep
            data={data}
            onDataChange={handleStepUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 8:
        return (
          <KickoffSessionStep
            data={data}
            onDataChange={handleStepUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Step {currentStep} of {totalSteps}
          </DialogDescription>
        </DialogHeader>
        {renderStep()}
        {currentStep !== 1 && currentStep !== totalSteps && (
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handlePrevious}>
              Previous
            </Button>
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
