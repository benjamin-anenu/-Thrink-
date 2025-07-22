import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { BasicInfoStep } from './resource-creation/BasicInfoStep';
import { SkillsProficiencyStep } from './resource-creation/SkillsProficiencyStep';
import { WorkPreferencesStep } from './resource-creation/WorkPreferencesStep';
import { AvailabilityPatternsStep } from './resource-creation/AvailabilityPatternsStep';
import { PerformanceBaselineStep } from './resource-creation/PerformanceBaselineStep';
import { ReviewStep } from './resource-creation/ReviewStep';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useEnhancedResourceCreation } from '@/hooks/useEnhancedResourceCreation';
import { toast } from 'sonner';

interface ResourceCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ResourceFormData {
  // Basic Info
  name: string;
  email: string;
  role: string;
  department: string;
  
  // Skills & Proficiencies
  skills: Array<{
    skillName: string;
    proficiencyLevel: number;
    yearsExperience: number;
    confidenceScore: number;
    certificationLevel?: string;
  }>;
  
  // Work Preferences
  optimalTaskCountPerDay: number;
  optimalTaskCountPerWeek: number;
  preferredWorkStyle: string;
  taskSwitchingPreference: string;
  timezone: string;
  workDays: string[];
  peakProductivityPeriods: string[];
  
  // Availability Patterns
  contractEndDate?: string;
  plannedTimeOff: Array<{
    startDate: string;
    endDate: string;
    reason: string;
  }>;
  recurringCommitments: Array<{
    day: string;
    timeSlot: string;
    description: string;
  }>;
  
  // Performance Baseline
  seniorityLevel: string;
  employmentType: string;
  strengthKeywords: string[];
  growthAreas: string[];
  careerAspirations: string[];
  mentorshipCapacity: boolean;
  complexityHandlingScore: number;
  collaborationEffectiveness: number;
  learningTaskSuccessRate: number;
  historicalTaskVelocity: number;
}

const STEPS = [
  { id: 'basic', title: 'Basic Information', description: 'Name, role, and department details' },
  { id: 'skills', title: 'Skills & Proficiencies', description: 'Technical and soft skills assessment' },
  { id: 'preferences', title: 'Work Preferences', description: 'Working style and productivity patterns' },
  { id: 'availability', title: 'Availability Patterns', description: 'Schedule and time-off planning' },
  { id: 'baseline', title: 'Performance Baseline', description: 'Experience and capability assessment' },
  { id: 'review', title: 'Review & Create', description: 'Final review before creating resource' }
];

export function ResourceCreationWizard({ open, onOpenChange }: ResourceCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ResourceFormData>({
    name: '',
    email: '',
    role: '',
    department: '',
    skills: [],
    optimalTaskCountPerDay: 5,
    optimalTaskCountPerWeek: 25,
    preferredWorkStyle: 'Collaborative',
    taskSwitchingPreference: 'Low',
    timezone: 'UTC',
    workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    peakProductivityPeriods: [],
    contractEndDate: undefined,
    plannedTimeOff: [],
    recurringCommitments: [],
    seniorityLevel: 'Mid-Level',
    employmentType: 'Full-time',
    strengthKeywords: [],
    growthAreas: [],
    careerAspirations: [],
    mentorshipCapacity: false,
    complexityHandlingScore: 5,
    collaborationEffectiveness: 5,
    learningTaskSuccessRate: 5,
    historicalTaskVelocity: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { currentWorkspace } = useWorkspace();
  const { createEnhancedResource } = useEnhancedResourceCreation();

  const updateFormData = (updates: Partial<ResourceFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentWorkspace) {
      toast.error('No workspace selected');
      return;
    }

    setIsSubmitting(true);
    try {
      const newResource = await createEnhancedResource(formData, currentWorkspace.id);
      
      if (newResource) {
        toast.success('Resource created successfully with enhanced profile!');
        onOpenChange(false);
        setCurrentStep(0);
        setFormData({
          name: '',
          email: '',
          role: '',
          department: '',
          skills: [],
          optimalTaskCountPerDay: 5,
          optimalTaskCountPerWeek: 25,
          preferredWorkStyle: 'Collaborative',
          taskSwitchingPreference: 'Low',
          timezone: 'UTC',
          workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          peakProductivityPeriods: [],
          contractEndDate: undefined,
          plannedTimeOff: [],
          recurringCommitments: [],
          seniorityLevel: 'Mid-Level',
          employmentType: 'Full-time',
          strengthKeywords: [],
          growthAreas: [],
          careerAspirations: [],
          mentorshipCapacity: false,
          complexityHandlingScore: 5,
          collaborationEffectiveness: 5,
          learningTaskSuccessRate: 5,
          historicalTaskVelocity: 5,
        });
      }
    } catch (error) {
      console.error('Failed to create resource:', error);
      toast.error('Failed to create resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <SkillsProficiencyStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <WorkPreferencesStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <AvailabilityPatternsStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <PerformanceBaselineStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <ReviewStep formData={formData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Enhanced Resource Creation Wizard
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span>Step {currentStep + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {STEPS.map((step, index) => (
            <Badge
              key={step.id}
              variant={index === currentStep ? "default" : index < currentStep ? "secondary" : "outline"}
              className="whitespace-nowrap"
            >
              {step.title}
            </Badge>
          ))}
        </div>

        {/* Current Step Header */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold">{STEPS[currentStep].title}</h3>
          <p className="text-muted-foreground">{STEPS[currentStep].description}</p>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        {currentStep < STEPS.length - 1 && (
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button onClick={nextStep}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}