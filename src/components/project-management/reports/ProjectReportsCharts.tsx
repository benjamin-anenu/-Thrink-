
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

const ProjectReportsCharts: React.FC = () => {
  const progressData = useMemo(() => [
    { week: 'Week 1', planned: 20, actual: 15, efficiency: 75 },
    { week: 'Week 2', planned: 40, actual: 35, efficiency: 88 },
    { week: 'Week 3', planned: 60, actual: 58, efficiency: 97 },
    { week: 'Week 4', planned: 80, actual: 75, efficiency: 94 },
    { week: 'Week 5', planned: 100, actual: 85, efficiency: 85 },
  ], []);

  const resourceData = useMemo(() => [
    { name: 'Frontend Dev', value: 85, color: 'hsl(var(--primary))' },
    { name: 'Backend Dev', value: 72, color: 'hsl(var(--secondary))' },
    { name: 'Design', value: 90, color: 'hsl(var(--accent))' },
    { name: 'QA Testing', value: 65, color: 'hsl(var(--muted))' },
    { name: 'DevOps', value: 78, color: 'hsl(var(--destructive))' },
  ], []);

  const timelineData = useMemo(() => [
    { month: 'Jan', planned: 100, actual: 95, variance: -5 },
    { month: 'Feb', planned: 150, actual: 140, variance: -10 },
    { month: 'Mar', planned: 120, actual: 135, variance: 15 },
    { month: 'Apr', planned: 180, actual: 170, variance: -10 },
    { month: 'May', planned: 200, actual: 185, variance: -15 },
    { month: 'Jun', planned: 160, actual: 175, variance: 15 },
  ], []);

  const budgetData = useMemo(() => [
    { category: 'Development', budgeted: 50000, spent: 45000, remaining: 5000 },
    { category: 'Design', budgeted: 15000, spent: 14500, remaining: 500 },
    { category: 'Testing', budgeted: 20000, spent: 18000, remaining: 2000 },
    { category: 'Infrastructure', budgeted: 10000, spent: 9500, remaining: 500 },
    { category: 'Marketing', budgeted: 25000, spent: 20000, remaining: 5000 },
  ], []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progress Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="planned" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Planned Progress (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  name="Actual Progress (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Resource Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <RechartsPieChart data={resourceData} cx="50%" cy="50%" outerRadius={80}>
                  {resourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Utilization']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline Variance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="planned" 
                  fill="hsl(var(--primary))" 
                  name="Planned Hours"
                />
                <Bar 
                  dataKey="actual" 
                  fill="hsl(var(--secondary))" 
                  name="Actual Hours"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Budget Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  formatter={(value) => [`$${value.toLocaleString()}`, '']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="budgeted" 
                  fill="hsl(var(--primary))" 
                  name="Budgeted"
                />
                <Bar 
                  dataKey="spent" 
                  fill="hsl(var(--secondary))" 
                  name="Spent"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectReportsCharts;
