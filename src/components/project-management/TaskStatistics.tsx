
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';

const TaskStatistics: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { tasks, loading } = useTasks(projectId);
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const overdueTasks = tasks.filter(task => {
    const endDate = new Date(task.end_date);
    const today = new Date();
    return task.status !== 'Completed' && endDate < today;
  }).length;

  const statisticCards = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: FileText,
      color: 'text-blue-500',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: AlertCircle,
      color: 'text-red-500',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse h-24 md:h-auto">
            <CardContent className="pt-3 md:pt-6 p-3 md:p-6">
              <div className="h-4 md:h-8 bg-muted rounded w-12 md:w-16 mb-2"></div>
              <div className="h-3 md:h-4 bg-muted rounded w-20 md:w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
      {statisticCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="h-24 md:h-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium leading-tight">{stat.title}</CardTitle>
              <Icon className={`h-3 md:h-4 w-3 md:w-4 ${stat.color} flex-shrink-0`} />
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskStatistics;
