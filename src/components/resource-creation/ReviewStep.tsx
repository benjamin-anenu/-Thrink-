import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, User, Zap, Settings, Calendar, Target, Loader2 } from 'lucide-react';
import { ResourceFormData } from '../ResourceCreationWizard';

interface ReviewStepProps {
  formData: ResourceFormData;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewStep({ formData, onSubmit, isSubmitting }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Review & Create Resource
          </CardTitle>
          <CardDescription>
            Please review all information before creating the resource profile
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Name:</span>
              <p className="font-medium">{formData.name}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email:</span>
              <p className="font-medium">{formData.email}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Role:</span>
              <p className="font-medium">{formData.role}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Department:</span>
              <p className="font-medium">{formData.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Proficiencies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4" />
            Skills & Proficiencies ({formData.skills.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {formData.skills.length > 0 ? (
            <div className="space-y-3">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{skill.skillName}</span>
                    <div className="text-sm text-muted-foreground">
                      Level: {skill.proficiencyLevel}/10 • 
                      Experience: {skill.yearsExperience} years • 
                      Confidence: {skill.confidenceScore}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No skills added</p>
          )}
        </CardContent>
      </Card>

      {/* Work Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4" />
            Work Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Daily Tasks:</span>
              <p className="font-medium">{formData.optimalTaskCountPerDay}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Weekly Tasks:</span>
              <p className="font-medium">{formData.optimalTaskCountPerWeek}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Work Style:</span>
              <p className="font-medium">{formData.preferredWorkStyle}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Task Switching:</span>
              <p className="font-medium">{formData.taskSwitchingPreference}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Timezone:</span>
              <p className="font-medium">{formData.timezone}</p>
            </div>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">Work Days:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.workDays.map((day) => (
                <Badge key={day} variant="secondary" className="text-xs">
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          {formData.peakProductivityPeriods.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Peak Productivity:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.peakProductivityPeriods.map((period) => (
                  <Badge key={period} variant="outline" className="text-xs">
                    {period}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Availability & Commitments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.contractEndDate && (
            <div>
              <span className="text-sm text-muted-foreground">Contract End:</span>
              <p className="font-medium">{formData.contractEndDate}</p>
            </div>
          )}

          {formData.plannedTimeOff.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Planned Time Off:</span>
              <div className="mt-1 space-y-1">
                {formData.plannedTimeOff.map((timeOff, index) => (
                  <div key={index} className="text-sm">
                    {timeOff.reason}: {timeOff.startDate} to {timeOff.endDate}
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.recurringCommitments.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Recurring Commitments:</span>
              <div className="mt-1 space-y-1">
                {formData.recurringCommitments.map((commitment, index) => (
                  <div key={index} className="text-sm">
                    {commitment.description}: {commitment.day}s at {commitment.timeSlot}
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.plannedTimeOff.length === 0 && formData.recurringCommitments.length === 0 && (
            <p className="text-muted-foreground">No specific availability constraints</p>
          )}
        </CardContent>
      </Card>

      {/* Performance Baseline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4" />
            Performance Baseline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Seniority:</span>
              <p className="font-medium">{formData.seniorityLevel}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Employment:</span>
              <p className="font-medium">{formData.employmentType}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Mentorship:</span>
              <p className="font-medium">{formData.mentorshipCapacity ? 'Available' : 'Not Available'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Complexity Handling:</span>
              <p className="font-medium">{formData.complexityHandlingScore}/10</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Collaboration:</span>
              <p className="font-medium">{formData.collaborationEffectiveness}/10</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Learning Success:</span>
              <p className="font-medium">{formData.learningTaskSuccessRate}/10</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Task Velocity:</span>
              <p className="font-medium">{formData.historicalTaskVelocity}/10</p>
            </div>
          </div>

          {formData.strengthKeywords.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Strengths:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.strengthKeywords.map((strength) => (
                  <Badge key={strength} variant="default" className="text-xs">
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.growthAreas.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Growth Areas:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.growthAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {formData.careerAspirations.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">Career Aspirations:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.careerAspirations.map((aspiration) => (
                  <Badge key={aspiration} variant="outline" className="text-xs">
                    {aspiration}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Create Button */}
      <div className="flex justify-center pt-4">
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          size="lg"
          className="w-full max-w-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Enhanced Resource Profile...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Enhanced Resource Profile
            </>
          )}
        </Button>
      </div>
    </div>
  );
}