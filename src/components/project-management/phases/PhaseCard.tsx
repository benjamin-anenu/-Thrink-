import React, { useState } from 'react';
import { ProjectPhase } from '@/types/project';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Edit, Trash2 } from 'lucide-react';
import { MilestoneList } from './MilestoneList';

interface PhaseCardProps {
  phase: ProjectPhase;
  isExpanded: boolean;
  onToggleExpand: (phaseId: string) => void;
  onEdit: (phase: ProjectPhase) => void;
  onDelete: (phaseId: string) => void;
  onAddMilestone: (phaseId: string) => void;
  onAssignMilestones: (phaseId: string) => void;
}

const statusColors = {
  planned: 'bg-secondary text-secondary-foreground',
  active: 'bg-primary text-primary-foreground',
  completed: 'bg-accent text-accent-foreground',
  paused: 'bg-muted text-muted-foreground',
  cancelled: 'bg-destructive text-destructive-foreground'
};

const priorityColors = {
  Low: 'bg-secondary text-secondary-foreground',
  Medium: 'bg-warning text-warning-foreground',
  High: 'bg-accent text-accent-foreground',
  Critical: 'bg-destructive text-destructive-foreground'
};

export const PhaseCard: React.FC<PhaseCardProps> = ({
  phase,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddMilestone,
  onAssignMilestones
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString?: string, computed?: string) => {
    if (computed) {
      return `${new Date(computed).toLocaleDateString()} (auto)`;
    }
    if (!dateString) return 'Calculated from tasks';
    return new Date(dateString).toLocaleDateString();
  };

  const milestoneCount = phase.milestones?.length || 0;
  const completedMilestones = phase.milestones?.filter(m => m.status === 'completed').length || 0;

  return (
    <Card 
      className="transition-all duration-200 hover:shadow-md"
      style={{ borderLeft: `4px solid ${phase.color || '#3b82f6'}` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpand(phase.id)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground">{phase.name}</h3>
              {phase.description && (
                <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={statusColors[phase.status]}>
              {phase.status}
            </Badge>
            <Badge variant="outline" className={priorityColors[phase.priority]}>
              {phase.priority}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(phase);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Phase
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddMilestone(phase.id);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssignMilestones(phase.id);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Existing Milestones
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(phase.id);
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Phase
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div>
            <p className="text-xs text-muted-foreground">Start Date</p>
            <p className="text-sm font-medium">{formatDate(phase.startDate, phase.computedStartDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">End Date</p>
            <p className="text-sm font-medium">{formatDate(phase.endDate, phase.computedEndDate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Milestones</p>
            <p className="text-sm font-medium">{completedMilestones}/{milestoneCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Progress</p>
            <div className="flex items-center gap-2">
              <Progress value={phase.progress} className="flex-1 h-2" />
              <span className="text-sm font-medium">{phase.progress}%</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="border-t pt-4">
            <MilestoneList 
              milestones={phase.milestones || []}
              phaseId={phase.id}
              onAddMilestone={onAddMilestone}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
};