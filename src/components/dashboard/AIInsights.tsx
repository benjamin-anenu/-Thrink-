
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, Zap, TrendingUp, AlertTriangle, Lightbulb, 
  Target, Users, Clock, DollarSign, Sparkles,
  ChevronRight, RefreshCw, Eye, ThumbsUp, ThumbsDown
} from 'lucide-react';

interface AIInsight {
  id: string;
  type: 'prediction' | 'optimization' | 'risk' | 'opportunity' | 'alert';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: 'schedule' | 'budget' | 'resources' | 'quality' | 'client';
  actionable: boolean;
  metrics?: {
    current: number;
    projected: number;
    improvement?: number;
  };
  recommendations?: string[];
  timestamp: Date;
}

const AIInsights = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const generateInsights = (): AIInsight[] => [
    {
      id: '1',
      type: 'prediction',
      title: 'Project Delivery Timeline Forecast',
      description: 'Based on current velocity and team capacity, 2 projects are likely to exceed their deadlines by 3-5 days.',
      confidence: 87,
      impact: 'medium',
      category: 'schedule',
      actionable: true,
      metrics: {
        current: 78,
        projected: 68,
        improvement: -10
      },
      recommendations: [
        'Reallocate 1 senior developer from Project Alpha',
        'Consider extending deadline for non-critical features',
        'Implement daily standups for at-risk projects'
      ],
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'optimization',
      title: 'Resource Allocation Optimization',
      description: 'AI analysis suggests moving 2 developers to Project Beta could improve overall delivery efficiency by 15%.',
      confidence: 92,
      impact: 'high',
      category: 'resources',
      actionable: true,
      metrics: {
        current: 72,
        projected: 87,
        improvement: 15
      },
      recommendations: [
        'Move Sarah and Mike to Project Beta team',
        'Cross-train team members for flexibility',
        'Implement pair programming for knowledge transfer'
      ],
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'risk',
      title: 'Budget Variance Alert',
      description: 'E-commerce Platform project showing 18% budget variance. Risk of cost overrun detected.',
      confidence: 94,
      impact: 'high',
      category: 'budget',
      actionable: true,
      metrics: {
        current: 118,
        projected: 125
      },
      recommendations: [
        'Review scope and remove non-essential features',
        'Negotiate with vendors for better rates',
        'Implement stricter change control process'
      ],
      timestamp: new Date()
    },
    {
      id: '4',
      type: 'opportunity',
      title: 'Automation Opportunity Identified',
      description: 'Implementing automated testing could reduce QA time by 35% and improve quality metrics.',
      confidence: 88,
      impact: 'medium',
      category: 'quality',
      actionable: true,
      metrics: {
        current: 40,
        projected: 26,
        improvement: -35
      },
      recommendations: [
        'Implement Cypress for end-to-end testing',
        'Set up automated unit test coverage',
        'Create CI/CD pipeline for automated deployments'
      ],
      timestamp: new Date()
    },
    {
      id: '5',
      type: 'alert',
      title: 'Client Satisfaction Trend',
      description: 'Client satisfaction scores have improved by 12% this quarter. Momentum should be maintained.',
      confidence: 91,
      impact: 'medium',
      category: 'client',
      actionable: false,
      metrics: {
        current: 4.8,
        projected: 4.9,
        improvement: 12
      },
      timestamp: new Date()
    }
  ];

  useEffect(() => {
    setInsights(generateInsights());
  }, []);

  const refreshInsights = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setInsights(generateInsights());
    setRefreshing(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'prediction': return TrendingUp;
      case 'optimization': return Zap;
      case 'risk': return AlertTriangle;
      case 'opportunity': return Lightbulb;
      case 'alert': return Sparkles;
      default: return Brain;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'prediction': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'optimization': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'risk': return 'text-red-600 bg-red-50 border-red-200';
      case 'opportunity': return 'text-green-600 bg-green-50 border-green-200';
      case 'alert': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'schedule': return Clock;
      case 'budget': return DollarSign;
      case 'resources': return Users;
      case 'quality': return Target;
      case 'client': return ThumbsUp;
      default: return Brain;
    }
  };

  const categories = ['all', 'schedule', 'budget', 'resources', 'quality', 'client'];
  
  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">AI Insights Dashboard</CardTitle>
                <CardDescription className="text-blue-700">
                  Predictive analytics and intelligent recommendations
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshInsights}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const CategoryIcon = category === 'all' ? Brain : getCategoryIcon(category);
          return (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="flex items-center gap-2 capitalize"
            >
              <CategoryIcon className="h-4 w-4" />
              {category}
            </Button>
          );
        })}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map((insight) => {
          const TypeIcon = getTypeIcon(insight.type);
          
          return (
            <Card key={insight.id} className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${getTypeColor(insight.type)}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getImpactColor(insight.impact)}>
                          {insight.impact} impact
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{insight.description}</p>
                
                {insight.metrics && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Current:</span>
                        <span className="ml-2 font-semibold">{insight.metrics.current}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Projected:</span>
                        <span className="ml-2 font-semibold">{insight.metrics.projected}%</span>
                      </div>
                    </div>
                    {insight.metrics.improvement && (
                      <div className="mt-2">
                        <Progress 
                          value={Math.abs(insight.metrics.improvement)} 
                          className={`h-2 ${insight.metrics.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}
                        />
                        <p className={`text-xs mt-1 ${insight.metrics.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {insight.metrics.improvement > 0 ? '+' : ''}{insight.metrics.improvement}% change
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {insight.recommendations && insight.actionable && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Recommended Actions:</h4>
                    <ul className="space-y-1">
                      {insight.recommendations.slice(0, 2).map((rec, index) => (
                        <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                  
                  {insight.actionable && (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredInsights.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No insights available</h3>
            <p className="text-muted-foreground mb-4">
              No AI insights found for the selected category.
            </p>
            <Button onClick={refreshInsights} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Insights
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIInsights;
