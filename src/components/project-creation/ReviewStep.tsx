import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Calendar, DollarSign, Target } from 'lucide-react';

interface ReviewStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data }) => {
  const totalBudget = data.budget?.total || '0';
  const totalExpenses = (data.budget?.expenses || []).reduce((sum: number, expense: any) => {
    return sum + (parseFloat(expense.amount) || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Project Review
          </CardTitle>
          <CardDescription>
            Review all project details before creation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-4 w-4" />
              Project Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Project Name</p>
                <p className="text-muted-foreground">{data.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="font-medium">Description</p>
                <p className="text-muted-foreground">{data.description || 'Not specified'}</p>
              </div>
            </div>
            
            {data.objectives && data.objectives.length > 0 && (
              <div>
                <p className="font-medium mb-2">Objectives</p>
                <div className="flex flex-wrap gap-2">
                  {data.objectives.map((objective: string, index: number) => (
                    <Badge key={index} variant="outline">{objective}</Badge>
                  ))}
                </div>
              </div>
            )}

            {data.deliverables && data.deliverables.length > 0 && (
              <div>
                <p className="font-medium mb-2">Deliverables</p>
                <div className="flex flex-wrap gap-2">
                  {data.deliverables.map((deliverable: string, index: number) => (
                    <Badge key={index} variant="outline">{deliverable}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Team & Resources */}
          {data.resources?.teamMembers && data.resources.teamMembers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members
              </h3>
              <div className="space-y-2">
                {data.resources.teamMembers.map((member: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <Badge variant="outline">{member.allocation}%</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {data.resources?.timeline && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-muted-foreground">
                    {data.resources.timeline.start || 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">End Date</p>
                  <p className="text-muted-foreground">
                    {data.resources.timeline.end || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Budget
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <p className="font-medium">Total Budget</p>
                <p className="text-2xl font-bold">${totalBudget}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Allocated</p>
                <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Remaining</p>
                <p className={`text-2xl font-bold ${
                  (parseFloat(totalBudget) || 0) - totalExpenses >= 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  ${((parseFloat(totalBudget) || 0) - totalExpenses).toFixed(2)}
                </p>
              </div>
            </div>

            {data.budget?.expenses && data.budget.expenses.length > 0 && (
              <div>
                <p className="font-medium mb-2">Budget Breakdown</p>
                <div className="space-y-2">
                  {data.budget.expenses.map((expense: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{expense.category}</p>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      </div>
                      <p className="font-medium">${expense.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stakeholders */}
          {data.stakeholders && data.stakeholders.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Stakeholders</h3>
              <div className="space-y-2">
                {data.stakeholders.map((stakeholder: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{stakeholder.name}</p>
                      <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="mb-1">{stakeholder.influence}</Badge>
                      <br />
                      <Badge variant="outline">{stakeholder.interest}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {data.tags && data.tags.length > 0 && (
            <div>
              <p className="font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;