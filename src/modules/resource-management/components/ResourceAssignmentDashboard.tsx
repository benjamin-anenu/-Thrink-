import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEnhancedResources } from '../contexts/EnhancedResourceContext';
import { TaskAssignmentRecommendation, TaskUtilizationMetrics } from '../types/TaskIntelligence';
import { ResourceProfile } from '../types/ResourceProfile';

interface ResourceAssignmentDashboardProps {
  projectId: string;
}

export const ResourceAssignmentDashboard: React.FC<ResourceAssignmentDashboardProps> = ({
  projectId
}) => {
  const {
    resourceProfiles,
    getAssignmentRecommendations,
    getTaskUtilization,
    loading
  } = useEnhancedResources();

  const [recommendations, setRecommendations] = useState<TaskAssignmentRecommendation[]>([]);
  const [utilizationMetrics, setUtilizationMetrics] = useState<Map<string, TaskUtilizationMetrics>>(new Map());
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Load AI recommendations and utilization data
  useEffect(() => {
    if (projectId) {
      loadAssignmentData();
    }
  }, [projectId]);

  const loadAssignmentData = async () => {
    setLoadingRecommendations(true);
    try {
      // Get AI-powered assignment recommendations
      const recs = await getAssignmentRecommendations(projectId);
      setRecommendations(recs);

      // Load utilization metrics for each resource
      const metrics = new Map();
      for (const rec of recs) {
        const utilization = await getTaskUtilization(rec.resource_id, 'week');
        metrics.set(rec.resource_id, utilization);
      }
      setUtilizationMetrics(metrics);

    } catch (error) {
      console.error('Error loading assignment data:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Underutilized': 'bg-blue-100 text-blue-800',
      'Moderately Utilized': 'bg-green-100 text-green-800',
      'Well Utilized': 'bg-green-100 text-green-800',
      'Optimally Loaded': 'bg-yellow-100 text-yellow-800',
      'Overloaded': 'bg-red-100 text-red-800',
      'Severely Overloaded': 'bg-red-200 text-red-900'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      'Low': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'High': 'bg-red-100 text-red-800'
    };
    return colors[risk as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getResourceProfile = (resourceId: string): ResourceProfile | undefined => {
    return resourceProfiles.find(r => r.id === resourceId);
  };

  const calculateOverallFitScore = (recommendation: TaskAssignmentRecommendation): number => {
    // Calculate weighted score similar to the AI engine
    return Math.round(
      (recommendation.task_capacity_fit.capacity_fit_score * 0.25 +
       recommendation.complexity_handling_fit * 0.20 +
       (recommendation.quality_prediction / 10) * 0.20 +
       recommendation.learning_growth_potential * 0.15 +
       recommendation.collaboration_task_fit * 0.10 +
       (recommendation.available_task_slots / 10) * 0.10) * 100
    );
  };

  if (loading || loadingRecommendations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading AI-powered assignment recommendations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Resource Assignment</h2>
          <p className="text-gray-600">
            Smart recommendations based on task capacity, skills, and historical performance
          </p>
        </div>
        <Button onClick={loadAssignmentData} disabled={loadingRecommendations}>
          Refresh Recommendations
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {recommendations.length}
            </div>
            <div className="text-sm text-gray-600">Available Resources</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {recommendations.filter(r => calculateOverallFitScore(r) > 75).length}
            </div>
            <div className="text-sm text-gray-600">High-Fit Matches</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {recommendations.reduce((sum, r) => sum + r.available_task_slots, 0)}
            </div>
            <div className="text-sm text-gray-600">Available Task Slots</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(recommendations.reduce((sum, r) => sum + r.quality_prediction, 0) / recommendations.length * 10) / 10}
            </div>
            <div className="text-sm text-gray-600">Avg Quality Prediction</div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {recommendations.map((recommendation) => {
          const resource = getResourceProfile(recommendation.resource_id);
          const utilization = utilizationMetrics.get(recommendation.resource_id);
          const overallFit = calculateOverallFitScore(recommendation);

          if (!resource) return null;

          return (
            <Card key={recommendation.resource_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {resource.name}
                      <Badge variant="outline">{resource.role}</Badge>
                    </CardTitle>
                    <div className="text-sm text-gray-600 mt-1">
                      {resource.seniority_level} • {resource.employment_type}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{overallFit}%</div>
                    <div className="text-xs text-gray-500">Overall Fit</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Utilization Status */}
                {utilization && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Current Utilization</span>
                      <Badge className={getStatusColor(utilization.status)}>
                        {utilization.status}
                      </Badge>
                    </div>
                    <Progress 
                      value={utilization.utilization_percentage} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{utilization.task_count} tasks</span>
                      <span>{Math.round(utilization.utilization_percentage)}%</span>
                    </div>
                  </div>
                )}

                {/* Capacity & Availability */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium mb-1">Available Slots</div>
                    <div className="text-xl font-bold text-green-600">
                      {recommendation.available_task_slots}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Capacity Fit</div>
                    <div className="text-xl font-bold text-blue-600">
                      {Math.round(recommendation.task_capacity_fit.capacity_fit_score * 100)}%
                    </div>
                  </div>
                </div>

                {/* Skills & Performance Predictions */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-600">
                      {Math.round(recommendation.complexity_handling_fit * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Complexity Fit</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {recommendation.quality_prediction.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-500">Quality Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(recommendation.learning_growth_potential * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">Learning Value</div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="flex gap-2">
                  <Badge className={getRiskColor(recommendation.task_overload_risk)}>
                    {recommendation.task_overload_risk} Overload Risk
                  </Badge>
                  {recommendation.skill_gap_risks.length > 0 && (
                    <Badge variant="outline" className="text-orange-600">
                      {recommendation.skill_gap_risks.length} Skill Gaps
                    </Badge>
                  )}
                </div>

                {/* Recommended Tasks */}
                {recommendation.recommended_task_assignment.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">Recommended Tasks</div>
                    <div className="space-y-1">
                      {recommendation.recommended_task_assignment.slice(0, 3).map((task, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span>Task {index + 1}</span>
                          <span className="text-gray-500">
                            Fit: {Math.round(task.fit_score * 100)}% | 
                            Confidence: {Math.round(task.completion_confidence * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => setSelectedResource(recommendation.resource_id)}
                    className="flex-1"
                  >
                    View Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      // Handle assignment action
                      console.log('Assigning tasks to:', resource.name);
                    }}
                  >
                    Assign Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Resource View Modal/Panel */}
      {selectedResource && (
        <DetailedResourceView 
          resourceId={selectedResource}
          recommendation={recommendations.find(r => r.resource_id === selectedResource)}
          onClose={() => setSelectedResource(null)}
        />
      )}

      {/* Empty State */}
      {recommendations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500 mb-4">
              No assignment recommendations available for this project.
            </div>
            <Button onClick={loadAssignmentData}>
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Detailed Resource View Component
interface DetailedResourceViewProps {
  resourceId: string;
  recommendation?: TaskAssignmentRecommendation;
  onClose: () => void;
}

const DetailedResourceView: React.FC<DetailedResourceViewProps> = ({
  resourceId,
  recommendation,
  onClose
}) => {
  const { getResourceProfile, getResourceSkills } = useEnhancedResources();
  
  const resource = getResourceProfile(resourceId);
  const skills = getResourceSkills(resourceId);

  if (!resource || !recommendation) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Resource Details: {resource.name}</CardTitle>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Resource Profile */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Profile Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Role</div>
                <div className="font-medium">{resource.role}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Seniority</div>
                <div className="font-medium">{resource.seniority_level}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Work Style</div>
                <div className="font-medium">{resource.preferred_work_style}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Task Switching</div>
                <div className="font-medium">{resource.task_switching_preference}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Optimal Tasks/Week</div>
                <div className="font-medium">{resource.optimal_task_count_per_week}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Complexity Score</div>
                <div className="font-medium">{resource.complexity_handling_score}/10</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Skills & Proficiencies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">{skill.skill_name}</div>
                    <div className="text-sm text-gray-500">
                      {skill.years_experience} years • Confidence: {skill.confidence_score}/10
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{skill.proficiency_level}/10</div>
                    <Badge variant="outline" className="mt-1">
                      {skill.improvement_trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Reasoning */}
          {recommendation.reasoning && (
            <div>
              <h3 className="text-lg font-semibold mb-3">AI Assignment Reasoning</h3>
              <div className="space-y-4">
                {/* Success Probability */}
                <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <span className="font-medium">Success Probability</span>
                  <span className="text-lg font-bold text-green-600">
                    {Math.round(recommendation.reasoning.success_probability * 100)}%
                  </span>
                </div>

                {/* Capacity Analysis */}
                <div className="p-3 bg-blue-50 rounded">
                  <div className="font-medium mb-2">Capacity Analysis</div>
                  <div className="text-sm space-y-1">
                    <div>Current Load: {recommendation.reasoning.capacity_analysis.current_load}%</div>
                    <div>Optimal Range: {recommendation.reasoning.capacity_analysis.optimal_load_range.join('-')}%</div>
                    <div>Risk Level: {recommendation.reasoning.capacity_analysis.overload_risk}</div>
                  </div>
                </div>

                {/* Recommendations */}
                {recommendation.reasoning.capacity_analysis.recommendations.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded">
                    <div className="font-medium mb-2">Recommendations</div>
                    <ul className="text-sm space-y-1">
                      {recommendation.reasoning.capacity_analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Potential Blockers */}
                {recommendation.reasoning.potential_blockers.length > 0 && (
                  <div className="p-3 bg-red-50 rounded">
                    <div className="font-medium mb-2">Potential Blockers</div>
                    <ul className="text-sm space-y-1">
                      {recommendation.reasoning.potential_blockers.map((blocker, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-600">⚠</span>
                          <span>{blocker}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourceAssignmentDashboard;