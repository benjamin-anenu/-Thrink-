
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Milestone } from '@/types/milestone';
import { format, isAfter, isBefore, differenceInDays } from 'date-fns';

interface MilestoneCardProps {
  milestone: Milestone;
  progress: number;
  className?: string;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, progress, className }) => {
  const today = new Date();
  const dueDate = new Date(milestone.date);
  const isOverdue = milestone.status !== 'completed' && isAfter(today, dueDate);
  const isCompleted = milestone.status === 'completed';
  const daysRemaining = differenceInDays(dueDate, today);

  const getStatusColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (isOverdue) return 'bg-red-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    if (isCompleted) return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    if (isOverdue) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isOverdue) return 'Delayed';
    return milestone.status.toUpperCase();
  };

  return (
    <Card className={`relative ${className}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor()} rounded-l-md`} />
      
      <CardContent className="p-4 pl-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h3 className="font-semibold text-sm">{milestone.name}</h3>
          </div>
          <Badge variant={isCompleted ? 'default' : isOverdue ? 'destructive' : 'secondary'}>
            {getStatusText()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Due: {format(dueDate, 'MMM dd, yyyy')}</span>
            {!isCompleted && (
              <span className={`ml-2 ${isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {milestone.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {milestone.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MilestoneCard;
