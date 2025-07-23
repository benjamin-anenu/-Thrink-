import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  FileText, 
  AlertTriangle, 
  Calendar,
  MessageSquare,
  TrendingUp,
  Search,
  Sun,
  BarChart3,
  Lightbulb,
  Target,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';


const AIHub = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();

  const submodules = [
    {
      id: 'recommendations',
      title: 'AI Recommendations',
      description: 'Get intelligent suggestions for task priorities, resource allocation, and project optimization',
      icon: Lightbulb,
      color: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20',
      iconColor: 'text-yellow-600',
      stats: { pending: 3, implemented: 12 },
      comingSoon: false
    },
    {
      id: 'reports',
      title: 'Status Report Generator',
      description: 'Generate comprehensive stakeholder reports with one click using AI-powered insights',
      icon: FileText,
      color: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20',
      iconColor: 'text-blue-600',
      stats: { generated: 8, scheduled: 2 },
      comingSoon: false
    },
    {
      id: 'risk-analyzer',
      title: 'Risk & Issue Analyzer',
      description: 'Proactive risk detection and mitigation strategies powered by predictive analytics',
      icon: AlertTriangle,
      color: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
      iconColor: 'text-red-600',
      stats: { risks: 2, resolved: 15 },
      comingSoon: false
    },
    {
      id: 'smart-planner',
      title: 'Smart Planner',
      description: 'AI-assisted project planning with natural language input and timeline optimization',
      icon: Calendar,
      color: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      iconColor: 'text-green-600',
      stats: { plans: 5, optimized: 18 },
      comingSoon: false
    },
    {
      id: 'pm-assistant',
      title: 'PM Assistant (Enhanced)',
      description: 'Advanced conversational AI for project management with context-aware responses',
      icon: MessageSquare,
      color: 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20',
      iconColor: 'text-indigo-600',
      stats: { conversations: 24, resolved: 89 },
      comingSoon: false
    },
    {
      id: 'retrospective',
      title: 'AI Retrospective',
      description: 'Learn from completed projects with automated post-mortem analysis and insights',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-purple-500/20 to-violet-500/20',
      iconColor: 'text-purple-600',
      stats: { insights: 7, patterns: 12 },
      comingSoon: true
    },
    {
      id: 'search',
      title: 'Search & Discovery',
      description: 'Semantic search across all project data with intelligent content recommendations',
      icon: Search,
      color: 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20',
      iconColor: 'text-teal-600',
      stats: { searches: 156, accuracy: 94 },
      comingSoon: true
    },
    {
      id: 'briefing',
      title: 'Daily Briefing',
      description: 'Personalized morning digest with priorities, deadlines, and proactive notifications',
      icon: Sun,
      color: 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20',
      iconColor: 'text-amber-600',
      stats: { briefings: 30, actions: 67 },
      comingSoon: true
    }
  ];

  const quickStats = [
    { label: 'AI Recommendations', value: '15', change: '+3 today', icon: Target },
    { label: 'Time Saved', value: '24h', change: 'this week', icon: Clock },
    { label: 'Accuracy Rate', value: '94%', change: '+2% vs last month', icon: BarChart3 },
    { label: 'Active Insights', value: '8', change: 'across 3 projects', icon: Brain }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl">
              <Brain className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            AI Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6">
            Intelligent project management powered by advanced AI. Streamline your workflow with automated insights, 
            predictive analytics, and personalized recommendations.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>Workspace: <strong>{currentWorkspace?.name}</strong></span>
            <span>•</span>
            <span>User: <strong>{user?.email}</strong></span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-xs text-primary mt-1">{stat.change}</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Modules Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">AI-Powered Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {submodules.map((module) => (
              <Card 
                key={module.id} 
                className={`relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  module.comingSoon ? 'opacity-75' : 'hover:shadow-primary/10 cursor-pointer'
                }`}
              >
                <div className={`absolute inset-0 ${module.color}`} />
                <CardHeader className="relative z-10 pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-background/50 backdrop-blur-sm`}>
                      <module.icon className={`h-5 w-5 ${module.iconColor}`} />
                    </div>
                    {module.comingSoon && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg text-foreground">{module.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <CardDescription className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {module.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {Object.entries(module.stats).map(([key, value], index) => (
                        <span key={key}>
                          {index > 0 && ' • '}
                          {value} {key}
                        </span>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      variant={module.comingSoon ? "secondary" : "default"}
                      disabled={module.comingSoon}
                      className="text-xs"
                    >
                      {module.comingSoon ? 'Soon' : 'Open'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent AI Activity */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent AI Activity
            </CardTitle>
            <CardDescription>
              Latest AI-generated insights and actions across your projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  type: 'recommendation',
                  title: 'Resource reallocation suggested for Project Alpha',
                  description: 'AI detected potential bottleneck in development phase',
                  time: '2 hours ago',
                  confidence: 94
                },
                {
                  type: 'risk',
                  title: 'Timeline risk identified for Q1 deliverables',
                  description: 'Dependency conflicts detected in milestone planning',
                  time: '4 hours ago',
                  confidence: 87
                },
                {
                  type: 'insight',
                  title: 'Performance pattern analysis completed',
                  description: 'Team productivity insights generated for retrospective',
                  time: '1 day ago',
                  confidence: 92
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {activity.type === 'recommendation' && <Lightbulb className="h-4 w-4 text-yellow-600" />}
                    {activity.type === 'risk' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {activity.type === 'insight' && <Brain className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-foreground truncate">{activity.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {activity.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AIHub;