import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Clock, Users, DollarSign, Target, Calendar, FileText } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface ReviewStepProps {
  onBack: () => void;
  onSubmit: () => void;
  formData: any;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  onBack,
  onSubmit,
  formData
}) => {
  const formatCurrency = (amount: number) => {
    const currency = formData.currency || 'USD';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getProjectStatus = () => {
    const startDate = new Date(formData.startDate);
    const today = new Date();
    
    if (startDate > today) return { status: 'Planning', color: 'bg-blue-100 text-blue-800' };
    if (startDate <= today && new Date(formData.endDate) >= today) return { status: 'Active', color: 'bg-green-100 text-green-800' };
    return { status: 'Completed', color: 'bg-gray-100 text-gray-800' };
  };

  const projectStatus = getProjectStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Review Project Details
          </CardTitle>
          <CardDescription>
            Review all project information before creating the project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formData.duration || 0}</div>
              <div className="text-sm text-muted-foreground">Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{formData.teamSize || 0}</div>
              <div className="text-sm text-muted-foreground">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(formData.budget || 0)}
              </div>
              <div className="text-sm text-muted-foreground">Budget</div>
            </div>
          </div>

          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Project Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Project Name</Label>
                <p className="text-sm p-2 bg-muted rounded">{formData.name || 'Not set'}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority</Label>
                <Badge variant="outline">{formData.priority || 'Medium'}</Badge>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm p-2 bg-muted rounded min-h-[60px]">
                  {formData.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Date</Label>
                <p className="text-sm p-2 bg-muted rounded">{formatDate(formData.startDate)}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">End Date</Label>
                <p className="text-sm p-2 bg-muted rounded">{formatDate(formData.endDate)}</p>
              </div>
            </div>

            {formData.milestones && formData.milestones.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Milestones</Label>
                <div className="space-y-2">
                  {formData.milestones.map((milestone: any, index: number) => (
                    <div key={milestone.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{milestone.name || `Milestone ${index + 1}`}</span>
                        <Badge variant="outline">{formatDate(milestone.date)}</Badge>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mt-1">{milestone.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team & Resources
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Team Size</Label>
                <p className="text-sm p-2 bg-muted rounded">{formData.teamSize || 0} members</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Total Allocation</Label>
                <p className="text-sm p-2 bg-muted rounded">
                  {(() => {
                    const total = Object.values(formData.allocationHours || {}).reduce((sum: number, hours: unknown) => {
                      const numHours = typeof hours === 'number' ? hours : 0;
                      return sum + numHours;
                    }, 0);
                     return `${total} hours/week`;
                   })()}
                </p>
              </div>
            </div>

            {formData.stakeholders && formData.stakeholders.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Stakeholders</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.stakeholders.map((stakeholder: any) => (
                    <Badge key={stakeholder.id} variant="secondary">
                      {stakeholder.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget & Costs
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Budget Type</Label>
                <Badge variant="outline">{formData.budgetType || 'Fixed'}</Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Currency</Label>
                <Badge variant="outline">{formData.currency || 'USD'}</Badge>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Total Budget</Label>
                <p className="text-sm p-2 bg-muted rounded">{formatCurrency(formData.budget || 0)}</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Estimated Cost</Label>
                <p className="text-sm p-2 bg-muted rounded">{formatCurrency(formData.totalCost || 0)}</p>
              </div>
            </div>

            {formData.costBreakdown && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Cost Breakdown</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2 bg-muted rounded text-center">
                    <div className="text-sm font-medium">Labor</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(formData.costBreakdown.labor || 0)}</div>
                  </div>
                  <div className="p-2 bg-muted rounded text-center">
                    <div className="text-sm font-medium">Materials</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(formData.costBreakdown.materials || 0)}</div>
                  </div>
                  <div className="p-2 bg-muted rounded text-center">
                    <div className="text-sm font-medium">Overhead</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(formData.costBreakdown.overhead || 0)}</div>
                  </div>
                  <div className="p-2 bg-muted rounded text-center">
                    <div className="text-sm font-medium">Contingency</div>
                    <div className="text-xs text-muted-foreground">{formatCurrency(formData.costBreakdown.contingency || 0)}</div>
                  </div>
                </div>
              </div>
            )}

            {formData.budgetNotes && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Budget Notes</Label>
                <p className="text-sm p-2 bg-muted rounded">{formData.budgetNotes}</p>
              </div>
            )}
          </div>

          {/* Project Status */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Project Status</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={projectStatus.color}>{projectStatus.status}</Badge>
              <span className="text-sm text-blue-700">
                Project will be created with {projectStatus.status.toLowerCase()} status
              </span>
            </div>
          </div>

          {/* Validation Summary */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Ready to Create</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p>✓ All required fields completed</p>
              <p>✓ Timeline and budget validated</p>
              <p>✓ Team allocation configured</p>
              <p>✓ Project ready for creation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
          Create Project
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep; 