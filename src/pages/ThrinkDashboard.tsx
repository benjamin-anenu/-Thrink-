import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Timer, 
  Users, 
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  ChevronRight,
  Zap
} from 'lucide-react';

const ThrinkDashboard = () => {
  const [aiInsightsOpen, setAiInsightsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');

  // Core metrics data
  const metrics = [
    {
      title: 'Active Projects',
      value: '1',
      subtitle: 'across workspace data',
      trend: 'neutral',
      icon: Target,
      color: 'text-blue-400'
    },
    {
      title: 'Resource Utilization',
      value: '74%',
      trend: 'up',
      change: '+12%',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      title: 'Budget Health',
      value: '88%',
      subtitle: 'Project health average',
      trend: 'up',
      change: '+5%',
      icon: DollarSign,
      color: 'text-green-400'
    },
    {
      title: 'Risk Score',
      value: '35',
      subtitle: 'Based on overdue tasks',
      trend: 'down',
      change: '-8',
      icon: AlertTriangle,
      color: 'text-orange-400'
    }
  ];

  const aiInsights = [
    {
      type: 'forecast',
      title: 'Project Delivery Forecast',
      message: '1 projects may exceed deadlines. Current velocity analysis suggests resource reallocation needed.',
      confidence: '87% confidence',
      action: 'View Details'
    },
    {
      type: 'optimization',
      title: 'Resource Optimization',
      message: 'AI detected 23% efficiency gain opportunity in current workflow allocation.',
      confidence: '92% confidence',
      action: 'Apply Changes'
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <span className="text-xl font-semibold">Thrink</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <Button variant="ghost" size="sm">Features</Button>
                <Button variant="ghost" size="sm">Pricing</Button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm">Sign In</Button>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Hero Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-sm text-blue-300">Enterprise AI Project Intelligence</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </div>
              <h1 className="text-5xl font-bold mb-4">
                The <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Future</span> of
                <br />
                Project{' '}
                <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Intelligence
                </span>
              </h1>
              <p className="text-xl text-zinc-400 max-w-2xl">
                Harness the power of <span className="text-blue-400">advanced AI</span> to transform your 
                project management. Predict risks, optimize resources, and automate complex workflows 
                with enterprise-grade precision.
              </p>
              <div className="flex items-center gap-4 mt-6">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Get Started Free
                </Button>
                <Button variant="outline" size="lg">
                  <Activity className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Icon className={`w-5 h-5 ${metric.color}`} />
                          {metric.trend !== 'neutral' && (
                            <div className="flex items-center gap-1">
                              {metric.trend === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                              )}
                              {metric.change && (
                                <span className={`text-sm ${
                                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {metric.change}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-zinc-400">{metric.title}</h3>
                          <p className="text-2xl font-bold">{metric.value}</p>
                          {metric.subtitle && (
                            <p className="text-xs text-zinc-500">{metric.subtitle}</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-zinc-400">Real-time Risk Prediction</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span className="text-zinc-400">Intelligent Automation</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span className="text-zinc-400">Predictive Analytics</span>
              </div>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-zinc-900/50 border-zinc-800">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="predictions">Predictions</TabsTrigger>
              </TabsList>

              <TabsContent value="performance" className="mt-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center text-zinc-500">
                      <div className="text-center">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Performance metrics visualization</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Resource Allocation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center text-zinc-500">
                      <div className="text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Resource allocation dashboard</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="predictions" className="mt-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      AI Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center text-zinc-500">
                      <div className="text-center">
                        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>AI-powered predictions and insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <AnimatePresence>
          {aiInsightsOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-zinc-900/90 border-l border-zinc-800 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold">AI Insights</h3>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setAiInsightsOpen(false)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <Card key={index} className="bg-zinc-800/50 border-zinc-700">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                            <Zap className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="space-y-2 flex-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-xs text-zinc-400">{insight.message}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {insight.confidence}
                              </Badge>
                              <Button variant="ghost" size="sm" className="text-xs">
                                {insight.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Insights Toggle */}
        {!aiInsightsOpen && (
          <div className="w-12 border-l border-zinc-800 bg-zinc-900/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-16 rounded-none"
              onClick={() => setAiInsightsOpen(true)}
            >
              <Brain className="w-5 h-5 text-blue-400" />
            </Button>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-900/90 border-t border-zinc-800 backdrop-blur-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-zinc-400">Milo AI Enterprise</span>
                <Badge variant="outline" className="text-xs bg-green-900/20 text-green-400 border-green-500/30">
                  LIVE
                </Badge>
              </div>
              <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500">
                <CheckCircle className="w-4 h-4" />
                <span>Advanced Intelligence Active</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm text-zinc-400">AI Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThrinkDashboard;