
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Clock, DollarSign, Users, Award, Target } from 'lucide-react';

interface ResourceComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResourceIds: string[];
  workspaceId: string;
}

export function ResourceComparisonModal({ 
  open, 
  onOpenChange, 
  selectedResourceIds,
  workspaceId 
}: ResourceComparisonModalProps) {
  const { resources, utilizationMetrics } = useEnhancedResources();

  const selectedResources = resources.filter(r => selectedResourceIds.includes(r.id));

  if (selectedResources.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resource Comparison</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Resource</th>
                      {selectedResources.map(resource => (
                        <th key={resource.id} className="text-left p-2 font-medium">
                          {resource.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Role</td>
                      {selectedResources.map(resource => (
                        <td key={resource.id} className="p-2">{resource.role}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Department</td>
                      {selectedResources.map(resource => (
                        <td key={resource.id} className="p-2">{resource.department}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Email</td>
                      {selectedResources.map(resource => (
                        <td key={resource.id} className="p-2">{resource.email}</td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Hourly Rate</td>
                      {selectedResources.map(resource => (
                        <td key={resource.id} className="p-2">
                          {resource.hourly_rate ? `$${resource.hourly_rate}/hr` : 'Not set'}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Performance Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance & Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Metric</th>
                      {selectedResources.map(resource => (
                        <th key={resource.id} className="text-left p-2 font-medium">
                          {resource.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Utilization</td>
                      {selectedResources.map(resource => {
                        const metrics = utilizationMetrics[resource.id];
                        return (
                          <td key={resource.id} className="p-2">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={metrics?.utilization_percentage || 0} 
                                className="w-20" 
                              />
                              <span>{metrics?.utilization_percentage || 0}%</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Status</td>
                      {selectedResources.map(resource => {
                        const metrics = utilizationMetrics[resource.id];
                        return (
                          <td key={resource.id} className="p-2">
                            <Badge variant={
                              metrics?.status === 'Overloaded' ? 'destructive' :
                              metrics?.status === 'Well Utilized' ? 'default' : 'secondary'
                            }>
                              {metrics?.status || 'Available'}
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Task Count</td>
                      {selectedResources.map(resource => {
                        const metrics = utilizationMetrics[resource.id];
                        return (
                          <td key={resource.id} className="p-2">
                            {metrics?.task_count || 0} / {metrics?.task_capacity || 10}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Bottleneck Risk</td>
                      {selectedResources.map(resource => {
                        const metrics = utilizationMetrics[resource.id];
                        const risk = metrics?.bottleneck_risk || 0;
                        return (
                          <td key={resource.id} className="p-2">
                            <Badge variant={risk > 7 ? 'destructive' : risk > 4 ? 'secondary' : 'outline'}>
                              {risk}/10
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Cost Metric</th>
                      {selectedResources.map(resource => (
                        <th key={resource.id} className="text-left p-2 font-medium">
                          {resource.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Hourly Rate</td>
                      {selectedResources.map(resource => (
                        <td key={resource.id} className="p-2">
                          {resource.hourly_rate ? `$${resource.hourly_rate}` : 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Monthly Utilization Cost</td>
                      {selectedResources.map(resource => {
                        const metrics = utilizationMetrics[resource.id];
                        const monthlyHours = ((metrics?.utilization_percentage || 0) / 100) * 160; // Assuming 40hrs/week
                        const monthlyCost = resource.hourly_rate ? monthlyHours * resource.hourly_rate : 0;
                        return (
                          <td key={resource.id} className="p-2">
                            {monthlyCost > 0 ? `$${monthlyCost.toFixed(0)}` : 'N/A'}
                          </td>
                        );
                      })}
                    </tr>
                    <tr className="border-b">
                      <td className="p-2 font-medium">Cost per Task</td>
                      {selectedResources.map(resource => {
                        const metrics = utilizationMetrics[resource.id];
                        const tasksPerMonth = (metrics?.tasks_completed || 0) * 4; // Approximate monthly
                        const monthlyCost = resource.hourly_rate ? 
                          (((metrics?.utilization_percentage || 0) / 100) * 160 * resource.hourly_rate) : 0;
                        const costPerTask = tasksPerMonth > 0 ? monthlyCost / tasksPerMonth : 0;
                        return (
                          <td key={resource.id} className="p-2">
                            {costPerTask > 0 ? `$${costPerTask.toFixed(0)}` : 'N/A'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Team Synergy & Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Most Available
                  </h4>
                  {selectedResources
                    .sort((a, b) => (utilizationMetrics[a.id]?.utilization_percentage || 0) - (utilizationMetrics[b.id]?.utilization_percentage || 0))
                    .slice(0, 2)
                    .map(resource => (
                      <div key={resource.id} className="mb-2">
                        <Badge variant="outline" className="w-full justify-between">
                          <span>{resource.name}</span>
                          <span>{utilizationMetrics[resource.id]?.utilization_percentage || 0}%</span>
                        </Badge>
                      </div>
                    ))
                  }
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Best Performers
                  </h4>
                  {selectedResources
                    .sort((a, b) => (utilizationMetrics[b.id]?.tasks_completed || 0) - (utilizationMetrics[a.id]?.tasks_completed || 0))
                    .slice(0, 2)
                    .map(resource => (
                      <div key={resource.id} className="mb-2">
                        <Badge variant="default" className="w-full justify-between">
                          <span>{resource.name}</span>
                          <span>{utilizationMetrics[resource.id]?.tasks_completed || 0} tasks</span>
                        </Badge>
                      </div>
                    ))
                  }
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    At Risk
                  </h4>
                  {selectedResources
                    .filter(resource => (utilizationMetrics[resource.id]?.bottleneck_risk || 0) > 5)
                    .sort((a, b) => (utilizationMetrics[b.id]?.bottleneck_risk || 0) - (utilizationMetrics[a.id]?.bottleneck_risk || 0))
                    .slice(0, 2)
                    .map(resource => (
                      <div key={resource.id} className="mb-2">
                        <Badge variant="destructive" className="w-full justify-between">
                          <span>{resource.name}</span>
                          <span>Risk: {utilizationMetrics[resource.id]?.bottleneck_risk || 0}/10</span>
                        </Badge>
                      </div>
                    ))
                  }
                  {selectedResources.filter(r => (utilizationMetrics[r.id]?.bottleneck_risk || 0) > 5).length === 0 && (
                    <p className="text-sm text-muted-foreground">All resources are performing well</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h5 className="font-medium mb-2">💡 Smart Recommendations</h5>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {selectedResources.some(r => (utilizationMetrics[r.id]?.utilization_percentage || 0) > 90) && (
                    <li>• Consider redistributing tasks from overloaded team members</li>
                  )}
                  {selectedResources.some(r => (utilizationMetrics[r.id]?.utilization_percentage || 0) < 40) && (
                    <li>• Some team members have capacity for additional work</li>
                  )}
                  {selectedResources.length > 1 && (
                    <li>• This team composition shows good skill diversity for complex projects</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
