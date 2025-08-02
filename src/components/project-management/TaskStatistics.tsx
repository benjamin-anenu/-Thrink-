
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useTasks } from '@/hooks/useTasks';

const TaskStatistics: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { tasks, loading } = useTasks();
  
  // Filter tasks for current project
  const projectTasks = tasks.filter(task => task.projectId === projectId);
  
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = projectTasks.filter(task => task.status === 'In Progress').length;
  const overdueTasks = projectTasks.filter(task => {
    const endDate = new Date(task.endDate);
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-8 bg-muted rounded w-16 mb-2"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statisticCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskStatistics;
