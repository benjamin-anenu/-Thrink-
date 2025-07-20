
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  DollarSign, 
  Target,
  FileText,
  Briefcase
} from 'lucide-react';

interface ReviewStepProps {
  formData: any;
  onBack: () => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  onBack,
  onSubmit,
  loading = false
}) => {
  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderValue = (value: any): React.ReactNode => {
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'None specified';
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return value || 'Not specified';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Review & Submit
          </CardTitle>
          <CardDescription>
            Review your project details before creating
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <h3 className="text-lg font-medium">Project Overview</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Project Name</Label>
                <p className="font-medium">{formData.name || 'Untitled Project'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="text-sm">{formData.description || 'No description provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                <Badge variant={
                  formData.priority === 'High' ? 'destructive' : 
                  formData.priority === 'Medium' ? 'default' : 'secondary'
                }>
                  {formData.priority || 'Medium'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant="outline">{formData.status || 'Planning'}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          {(formData.timeline || formData.startDate || formData.endDate) && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Timeline</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Start Date</Label>
                    <p>{formData.startDate || formData.timeline?.start || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">End Date</Label>
                    <p>{formData.endDate || formData.timeline?.end || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Resources */}
          {formData.resources && formData.resources.length > 0 && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Team & Resources</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Team Size</Label>
                    <p>{formData.teamSize || formData.resources.length} members</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Selected Resources</Label>
                    <p className="text-sm">{renderValue(formData.resources)}</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Budget */}
          {formData.budget && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Budget</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Total Budget</Label>
                    <p>{typeof formData.budget === 'string' ? formData.budget : renderValue(formData.budget)}</p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Milestones */}
          {formData.milestones && formData.milestones.length > 0 && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <h3 className="text-lg font-medium">Milestones</h3>
                </div>
                <div className="space-y-2">
                  {formData.milestones.map((milestone: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{milestone.name || `Milestone ${index + 1}`}</p>
                        <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      </div>
                      <Badge variant="secondary">{milestone.dueDate || 'No date'}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Stakeholders */}
          {formData.stakeholders && formData.stakeholders.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <h3 className="text-lg font-medium">Stakeholders</h3>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Selected Stakeholders</Label>
                <p className="text-sm">{formData.stakeholders.length} stakeholders selected</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating Project...' : 'Create Project'}
        </Button>
      </div>
    </div>
  );
};

// Helper component for labels
const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <span className={className}>{children}</span>
);

export default ReviewStep;
