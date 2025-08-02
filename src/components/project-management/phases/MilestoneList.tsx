
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Plus, Clock } from 'lucide-react';
import { EnhancedMilestone } from '@/hooks/useEnhancedMilestones';

interface MilestoneListProps {
  milestones: EnhancedMilestone[];
  phaseId: string;
  onAddMilestone: (phaseId: string) => void;
}

export const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  phaseId,
  onAddMilestone
}) => {
  const phaseMilestones = milestones.filter(m => m.phase_id === phaseId);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateRange = (milestone: EnhancedMilestone) => {
    if (milestone.computed_start_date && milestone.computed_end_date) {
      const start = new Date(milestone.computed_start_date).toLocaleDateString();
      const end = new Date(milestone.computed_end_date).toLocaleDateString();
      return `${start} - ${end}`;
    }
    if (milestone.due_date) {
      return `Due: ${new Date(milestone.due_date).toLocaleDateString()}`;
    }
    return 'No dates set';
  };

  if (phaseMilestones.length === 0) {
    return (
      <div className="text-center py-6">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Milestones</h3>
        <p className="text-gray-600 mb-4">Add milestones to track key deliverables in this phase.</p>
        <Button onClick={() => onAddMilestone(phaseId)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">
          Milestones ({phaseMilestones.length})
        </h4>
        <Button onClick={() => onAddMilestone(phaseId)} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      <div className="space-y-3">
        {phaseMilestones.map((milestone) => (
          <Card key={milestone.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{milestone.name}</h5>
                  {milestone.description && (
                    <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                  )}
                </div>
                <Badge className={getStatusColor(milestone.status)}>
                  {milestone.status.charAt(0).toUpperCase() + milestone.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDateRange(milestone)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  {milestone.task_count} Tasks
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {milestone.progress}% Complete
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Progress</span>
                  <span>{milestone.progress}%</span>
                </div>
                <Progress value={milestone.progress} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
