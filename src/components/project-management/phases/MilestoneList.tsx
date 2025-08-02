import React from 'react';
import { ProjectMilestone } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Target } from 'lucide-react';

interface MilestoneListProps {
  milestones: ProjectMilestone[];
  phaseId: string;
  onAddMilestone: (phaseId: string) => void;
}

const statusColors = {
  upcoming: 'bg-secondary text-secondary-foreground',
  'in-progress': 'bg-warning text-warning-foreground',
  completed: 'bg-accent text-accent-foreground',
  overdue: 'bg-destructive text-destructive-foreground'
};

export const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  phaseId,
  onAddMilestone
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (milestones.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No milestones in this phase</p>
        <Button onClick={() => onAddMilestone(phaseId)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add First Milestone
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground">
          Milestones ({milestones.length})
        </h4>
        <Button onClick={() => onAddMilestone(phaseId)} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Milestone
        </Button>
      </div>

      <div className="space-y-2">
        {milestones.map((milestone) => (
          <div
            key={milestone.id}
            className="flex items-center justify-between p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-medium text-sm">{milestone.name}</h5>
                <Badge className={statusColors[milestone.status]}>
                  {milestone.status}
                </Badge>
              </div>
              
              {milestone.description && (
                <p className="text-xs text-muted-foreground mb-2">
                  {milestone.description}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(milestone.date)}</span>
                </div>
                <div>
                  Tasks: {milestone.tasks?.length || 0}
                </div>
                <div>
                  Progress: {milestone.progress}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};