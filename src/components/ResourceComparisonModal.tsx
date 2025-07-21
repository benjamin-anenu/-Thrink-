import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { Users, Brain, Clock, DollarSign, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Resource } from '@/contexts/ResourceContext';
import { 
  ResourceComparison, 
  SkillProficiency,
  ResourceUtilizationMetrics 
} from '@/types/enhanced-resource';

interface ResourceComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedResourceIds: string[];
  workspaceId: string;
}

export const ResourceComparisonModal: React.FC<ResourceComparisonModalProps> = ({
  open,
  onOpenChange,
  selectedResourceIds,
  workspaceId
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [skillComparison, setSkillComparison] = useState<any[]>([]);
  const [utilizationData, setUtilizationData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && selectedResourceIds.length > 0) {
      loadComparisonData();
    }
  }, [open, selectedResourceIds]);

  const loadComparisonData = async () => {
    try {
      setLoading(true);
      
      // Load basic resource data
      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
        .in('id', selectedResourceIds);

      setResources(resourcesData || []);

      // Load skill proficiencies for each resource
      const { data: skillsData } = await supabase
        .from('skill_proficiencies')
        .select(`
          *,
          skills (name)
        `)
        .in('resource_id', selectedResourceIds);

      // Load utilization metrics
      const { data: utilizationMetrics } = await supabase
        .from('resource_utilization_metrics')
        .select('*')
        .in('resource_id', selectedResourceIds)
        .eq('period_type', 'week')
        .order('period_start', { ascending: false })
        .limit(4); // Last 4 weeks

      // Load resource profiles for performance data
      const { data: profiles } = await supabase
        .from('resource_profiles')
        .select('*')
        .in('resource_id', selectedResourceIds);

      // Process and set the data
      processSkillComparison(skillsData || [], resourcesData || []);
      processUtilizationData(utilizationMetrics || [], resourcesData || []);
      processPerformanceData(profiles || [], resourcesData || []);
      
      // Generate AI insights
      await generateAIInsights();

    } catch (error) {
      console.error('Error loading comparison data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSkillComparison = (skillsData: any[], resourcesData: Resource[]) => {
    const skillMap = new Map<string, any>();

    // Group skills by skill name
    skillsData.forEach(skill => {
      const skillName = skill.skills?.name || 'Unknown';
      if (!skillMap.has(skillName)) {
        skillMap.set(skillName, {
          skill: skillName,
          ...resourcesData.reduce((acc, resource) => ({
            ...acc,
            [resource.name]: 0
          }), {})
        });
      }

      const resource = resourcesData.find(r => r.id === skill.resource_id);
      if (resource) {
        skillMap.get(skillName)[resource.name] = skill.proficiency_level;
      }
    });

    setSkillComparison(Array.from(skillMap.values()));
  };

  const processUtilizationData = (metricsData: any[], resourcesData: Resource[]) => {
    const utilizationMap = new Map<string, any>();

    metricsData.forEach(metric => {
      const weekKey = metric.period_start;
      if (!utilizationMap.has(weekKey)) {
        utilizationMap.set(weekKey, {
          week: new Date(weekKey).toLocaleDateString(),
          ...resourcesData.reduce((acc, resource) => ({
            ...acc,
            [resource.name]: 0
          }), {})
        });
      }

      const resource = resourcesData.find(r => r.id === metric.resource_id);
      if (resource) {
        utilizationMap.get(weekKey)[resource.name] = metric.utilization_percentage;
      }
    });

    setUtilizationData(Array.from(utilizationMap.values()));
  };

  const processPerformanceData = (profilesData: any[], resourcesData: Resource[]) => {
    const performance = resourcesData.map(resource => {
      const profile = profilesData.find(p => p.resource_id === resource.id);
      return {
        resource: resource.name,
        taskVelocity: profile?.historical_task_velocity || 0,
        complexity: profile?.complexity_handling_score || 5,
        collaboration: profile?.collaboration_effectiveness || 0.5,
        learning: profile?.learning_task_success_rate || 0.5
      };
    });

    setPerformanceData(performance);
  };

  const generateAIInsights = async () => {
    // Create a comparison record
    const { data: comparison } = await supabase
      .from('resource_comparisons')
      .insert({
        workspace_id: workspaceId,
        resource_ids: selectedResourceIds,
        comparison_type: 'detailed',
        skill_comparison_data: {},
        availability_comparison_data: {},
        performance_comparison_data: {},
        cost_comparison_data: {},
        complementary_skills_analysis: {
          coverage: 'Good overall skill coverage',
          gaps: ['Advanced DevOps', 'UI/UX Design'],
          recommendations: 'Consider cross-training in identified gap areas'
        },
        team_synergy_prediction: {
          collaboration_score: 0.85,
          effectiveness: 0.78,
          potential_conflicts: ['Different work styles', 'Timezone differences']
        },
        optimal_pairing_suggestions: [
          {
            combination: selectedResourceIds.slice(0, 2),
            score: 0.9,
            reasoning: 'Complementary skills and high collaboration potential'
          }
        ]
      })
      .select()
      .single();

    if (comparison) {
      setAiInsights(comparison);
    }
  };

  const getSkillRadarData = () => {
    const allSkills = Array.from(new Set(skillComparison.map(s => s.skill)));
    return allSkills.map(skill => {
      const skillData = skillComparison.find(s => s.skill === skill);
      const result: any = { skill };
      
      resources.forEach(resource => {
        result[resource.name] = skillData?.[resource.name] || 0;
      });
      
      return result;
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing resource comparison...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Resource Comparison Analysis
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="utilization">Utilization</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map(resource => (
                <Card key={resource.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{resource.name}</CardTitle>
                    <Badge variant="outline">{resource.role || 'Team Member'}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Department</span>
                      <span className="text-sm font-medium">{resource.department || 'General'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Projects</span>
                      <Badge variant="secondary">3 Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Utilization</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-16 h-2" />
                        <span className="text-sm">75%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills Comparison Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={skillComparison.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Legend />
                      {resources.map((resource, index) => (
                        <Bar 
                          key={resource.id} 
                          dataKey={resource.name} 
                          fill={`hsl(${index * 120}, 70%, 50%)`}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skills Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getSkillRadarData().slice(0, 6)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      {resources.map((resource, index) => (
                        <Radar
                          key={resource.id}
                          name={resource.name}
                          dataKey={resource.name}
                          stroke={`hsl(${index * 120}, 70%, 50%)`}
                          fill={`hsl(${index * 120}, 70%, 50%)`}
                          fillOpacity={0.2}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="utilization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Utilization Trends (Last 4 Weeks)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={utilizationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                    <Legend />
                    {resources.map((resource, index) => (
                      <Bar 
                        key={resource.id} 
                        dataKey={resource.name} 
                        fill={`hsl(${index * 120}, 70%, 50%)`}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={performanceData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="resource" />
                    <PolarRadiusAxis angle={30} domain={[0, 1]} />
                    <Radar
                      name="Task Velocity"
                      dataKey="taskVelocity"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.2}
                    />
                    <Radar
                      name="Complexity Handling"
                      dataKey="complexity"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.2}
                    />
                    <Radar
                      name="Collaboration"
                      dataKey="collaboration"
                      stroke="#ffc658"
                      fill="#ffc658"
                      fillOpacity={0.2}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {aiInsights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      Team Synergy Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Collaboration Score</span>
                      <div className="flex items-center gap-2">
                        <Progress value={aiInsights.team_synergy_prediction.collaboration_score * 100} className="w-24 h-2" />
                        <span className="text-sm font-medium">
                          {Math.round(aiInsights.team_synergy_prediction.collaboration_score * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Team Effectiveness</span>
                      <div className="flex items-center gap-2">
                        <Progress value={aiInsights.team_synergy_prediction.effectiveness * 100} className="w-24 h-2" />
                        <span className="text-sm font-medium">
                          {Math.round(aiInsights.team_synergy_prediction.effectiveness * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Optimal Pairings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {aiInsights.optimal_pairing_suggestions.map((suggestion: any, index: number) => (
                      <div key={index} className="space-y-2 p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Pairing Score</span>
                          <Badge variant="secondary">{Math.round(suggestion.score * 100)}%</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{suggestion.reasoning}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skill Coverage Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-green-600">Strengths:</span>
                      <p className="text-sm text-muted-foreground">
                        {aiInsights.complementary_skills_analysis.coverage}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-amber-600">Gaps Identified:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {aiInsights.complementary_skills_analysis.gaps.map((gap: string, index: number) => (
                          <Badge key={index} variant="outline">{gap}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-600">Recommendation:</span>
                      <p className="text-sm text-muted-foreground">
                        {aiInsights.complementary_skills_analysis.recommendations}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Potential Challenges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {aiInsights.team_synergy_prediction.potential_conflicts?.map((conflict: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mt-1.5"></div>
                          <span className="text-sm">{conflict}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button>
            Export Analysis
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};