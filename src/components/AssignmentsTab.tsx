
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useResources } from '@/contexts/ResourceContext';
import { useProject } from '@/contexts/ProjectContext';
import { useResourceAssignments } from '@/hooks/useResourceAssignments';
import { Users, Clock, Target, TrendingUp, Brain, Lightbulb, AlertTriangle } from 'lucide-react';

interface AssignmentsTabProps {
  onShowAssignmentModal: () => void;
}

const AssignmentsTab = ({ onShowAssignmentModal }: AssignmentsTabProps) => {
  const { resources } = useResources();
  const { projects } = useProject();
  const { metrics, suggestions } = useResourceAssignments();

  // Get recent assignments (resources with current projects)
  const recentAssignments = resources
    .filter(r => r.currentProjects.length > 0)
    .slice(0, 5)
    .map(resource => ({
      resourceName: resource.name,
      projectName: resource.currentProjects[0], // Show first project
      role: resource.role,
      utilization: resource.utilization,
      status: resource.status
    }));

  return (
    <div className="space-y-6">
      {/* Enhanced Assignment Overview with Real Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Resources</p>
                <p className="font-bold text-2xl text-blue-900 dark:text-blue-100">{metrics.totalResources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-green-700 dark:text-green-300">Available</p>
                <p className="font-bold text-2xl text-green-900 dark:text-green-100">{metrics.availableCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300">Overallocated</p>
                <p className="font-bold text-2xl text-orange-900 dark:text-orange-100">{metrics.overallocatedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300">Avg Utilization</p>
                <p className="font-bold text-2xl text-purple-900 dark:text-purple-100">{metrics.avgUtilization}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Powered Assignment Management Card */}
      <Card className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-2 border-indigo-200 dark:border-indigo-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
            <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            AI Assignment Insights
          </CardTitle>
          <CardDescription className="text-indigo-700 dark:text-indigo-300">
            Smart recommendations based on skills, availability, and workload analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 dark:bg-gray-900/70 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Workload Distribution</span>
                <TrendingUp className="h-4 w-4 text-indigo-500" />
              </div>
              <Progress value={metrics.avgUtilization} className="mb-2" />
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                {metrics.overallocatedCount > 0 
                  ? `${metrics.overallocatedCount} resources need rebalancing`
                  : 'Workload is well distributed'
                }
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-900/70 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Resource Efficiency</span>
                <Target className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-1">
                {Math.round((metrics.availableCount / Math.max(metrics.totalResources, 1)) * 100)}%
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Resources available for new assignments
              </p>
            </div>

            <div className="bg-white/70 dark:bg-gray-900/70 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Skill Matching</span>
                <Lightbulb className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-1">
                {suggestions.length}
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                AI-generated assignment suggestions
              </p>
            </div>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Smart Assignment Suggestions
              </h4>
              <div className="space-y-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="bg-white/80 dark:bg-gray-900/80 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-indigo-900 dark:text-indigo-100">{suggestion.suggestedResourceName}</h5>
                          <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700 border-indigo-300">
                            {suggestion.confidence}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-1">{suggestion.reason}</p>
                        <div className="flex gap-1">
                          {suggestion.skillMatch.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Insights Explanation */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/50 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <h4 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">How AI Insights Work</h4>
            <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
              <li>• Analyzes resource skills, availability, and current workload</li>
              <li>• Identifies overallocated resources that need workload rebalancing</li>
              <li>• Suggests optimal resource-task matches based on expertise</li>
              <li>• Considers project deadlines and resource capacity</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
          <CardDescription>
            Current resource assignments and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAssignments.length > 0 ? (
            <div className="space-y-4">
              {recentAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{assignment.resourceName}</p>
                      <p className="text-sm text-muted-foreground">{assignment.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{assignment.projectName}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={assignment.utilization} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">{assignment.utilization}%</span>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={
                        assignment.status === 'Available' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                        assignment.status === 'Busy' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No current assignments found.
              </p>
              <Button onClick={onShowAssignmentModal}>
                Create New Assignment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Management</CardTitle>
          <CardDescription>
            Manage task assignments and workload distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={onShowAssignmentModal} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Users className="h-4 w-4 mr-2" />
              Create New Assignment
            </Button>
            <Button variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
              <TrendingUp className="h-4 w-4 mr-2" />
              View All Assignments
            </Button>
            <Button variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              <Brain className="h-4 w-4 mr-2" />
              Resource Utilization Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentsTab;
