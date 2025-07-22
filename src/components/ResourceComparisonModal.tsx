
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEnhancedResources } from '@/hooks/useEnhancedResources';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Clock, DollarSign } from 'lucide-react';

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

          {/* Quick Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Most Available</h4>
                  {selectedResources
                    .sort((a, b) => (utilizationMetrics[a.id]?.utilization_percentage || 0) - (utilizationMetrics[b.id]?.utilization_percentage || 0))
                    .slice(0, 1)
                    .map(resource => (
                      <Badge key={resource.id} variant="outline" className="mr-2">
                        {resource.name} ({utilizationMetrics[resource.id]?.utilization_percentage || 0}% utilized)
                      </Badge>
                    ))
                  }
                </div>
                <div>
                  <h4 className="font-medium mb-2">Highest Risk</h4>
                  {selectedResources
                    .sort((a, b) => (utilizationMetrics[b.id]?.bottleneck_risk || 0) - (utilizationMetrics[a.id]?.bottleneck_risk || 0))
                    .slice(0, 1)
                    .map(resource => (
                      <Badge key={resource.id} variant="destructive" className="mr-2">
                        {resource.name} (Risk: {utilizationMetrics[resource.id]?.bottleneck_risk || 0}/10)
                      </Badge>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
