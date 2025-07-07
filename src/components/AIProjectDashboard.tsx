
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Users, Clock, Target, Zap, CheckCircle, Activity, Shield, Sparkles } from 'lucide-react';

const AIProjectDashboard = () => {
  const [activeProject, setActiveProject] = useState(0);
  const [aiPulse, setAiPulse] = useState(0);
  const [metrics, setMetrics] = useState({
    successRate: 96,
    efficiency: 89,
    riskLevel: 'Low',
    teamProductivity: 147,
    aiConfidence: 94
  });

  const projects = [
    {
      name: "Enterprise Mobile Platform",
      status: "Accelerated",
      progress: 82,
      risk: "Low",
      team: 12,
      deadline: "4 days",
      aiInsight: "AI predicts 3-day early completion with 94% confidence",
      color: "from-emerald-500 to-cyan-500",
      priority: "High"
    },
    {
      name: "Cloud Infrastructure Migration",
      status: "Critical Path",
      progress: 67,
      risk: "Medium",
      team: 18,
      deadline: "8 days",
      aiInsight: "Resource bottleneck detected - auto-rebalancing initiated",
      color: "from-orange-500 to-red-500",
      priority: "Critical"
    },
    {
      name: "AI Analytics Dashboard",
      status: "Optimal",
      progress: 94,
      risk: "Low",
      team: 8,
      deadline: "2 days",
      aiInsight: "Performance exceeding targets by 23% - early delivery likely",
      color: "from-blue-500 to-purple-500",
      priority: "Medium"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProject((prev) => (prev + 1) % projects.length);
      setAiPulse((prev) => prev + 1);
      
      // Enhanced dynamic metrics simulation
      setMetrics(prev => ({
        successRate: Math.min(99, Math.max(90, prev.successRate + (Math.random() - 0.5) * 2)),
        efficiency: Math.min(100, Math.max(80, prev.efficiency + (Math.random() - 0.5) * 3)),
        riskLevel: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'Medium' : 'High') : 'Low',
        teamProductivity: Math.min(200, Math.max(120, prev.teamProductivity + (Math.random() - 0.5) * 8)),
        aiConfidence: Math.min(99, Math.max(85, prev.aiConfidence + (Math.random() - 0.5) * 2))
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentProject = projects[activeProject];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-emerald-400 bg-emerald-400/20 border-emerald-400/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'High': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-2xl rounded-3xl border border-primary/10 overflow-hidden">
      {/* Premium Header */}
      <div className="p-8 border-b border-primary/10 bg-gradient-to-r from-card/80 to-card/60">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow animate-pulse">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">AI Project Intelligence</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                Advanced real-time analysis active
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-emerald-400 rounded-full animate-pulse shadow-glow"></div>
            <span className="text-sm text-emerald-400 font-bold">AI Processing</span>
            <div className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-xs font-bold border border-primary/30">
              {metrics.aiConfidence}% Confidence
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-4 gap-6">
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-400/25 shadow-elevated hover:shadow-glow transition-all duration-300">
            <div className="text-3xl font-black text-emerald-400 mb-1">{Math.round(metrics.successRate)}%</div>
            <div className="text-xs text-muted-foreground font-medium">Success Rate</div>
            <div className="text-xs text-emerald-400 mt-1">↗ +2.3%</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 border border-blue-400/25 shadow-elevated hover:shadow-glow transition-all duration-300">
            <div className="text-3xl font-black text-blue-400 mb-1">{Math.round(metrics.efficiency)}%</div>
            <div className="text-xs text-muted-foreground font-medium">AI Efficiency</div>
            <div className="text-xs text-blue-400 mt-1">↗ +4.1%</div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 border border-purple-400/25 shadow-elevated hover:shadow-glow transition-all duration-300">
            <div className="text-3xl font-black text-purple-400 mb-1">{metrics.riskLevel}</div>
            <div className="text-xs text-muted-foreground font-medium">Risk Assessment</div>
            <div className="text-xs text-purple-400 mt-1">
              <Shield className="h-3 w-3 inline mr-1" />Secured
            </div>
          </div>
          <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-400/25 shadow-elevated hover:shadow-glow transition-all duration-300">
            <div className="text-3xl font-black text-cyan-400 mb-1">{Math.round(metrics.teamProductivity)}%</div>
            <div className="text-xs text-muted-foreground font-medium">Team Velocity</div>
            <div className="text-xs text-cyan-400 mt-1">↗ +12.5%</div>
          </div>
        </div>
      </div>

      {/* Premium Active Project Display */}
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-foreground flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary animate-pulse" />
              Live Project Analysis
            </h4>
            <div className="flex gap-2">
              {projects.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-3 w-12 rounded-full transition-all duration-700 ${
                    i === activeProject ? 'bg-gradient-to-r from-primary to-purple-500 shadow-glow' : 'bg-border/40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className={`p-8 rounded-3xl bg-gradient-to-br ${currentProject.color}/10 border border-white/10 transform transition-all duration-1000 hover:scale-[1.02] shadow-premium`}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h5 className="text-2xl font-bold text-foreground">{currentProject.name}</h5>
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(currentProject.priority)}`}>
                    {currentProject.priority}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">{currentProject.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">{currentProject.team} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground font-medium">{currentProject.deadline} remaining</span>
                  </div>
                </div>
              </div>
              
              <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${getRiskColor(currentProject.risk)}`}>
                {currentProject.risk} Risk
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-3">
                <span className="text-muted-foreground font-medium">Project Progress</span>
                <span className="text-foreground font-bold">{currentProject.progress}%</span>
              </div>
              <div className="h-3 bg-border/30 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full bg-gradient-to-r ${currentProject.color} transition-all duration-1200 ease-out shadow-glow`}
                  style={{ width: `${currentProject.progress}%` }}
                />
              </div>
            </div>

            {/* Premium AI Insight */}
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-r from-primary/15 to-purple-500/15 border border-primary/25 shadow-elevated">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow animate-pulse">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-primary font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  AI Predictive Analysis
                </div>
                <div className="text-sm text-foreground font-medium">{currentProject.aiInsight}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Real-time Notifications */}
        <div className="space-y-4">
          <h6 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary animate-pulse" />
            Live AI Insights
          </h6>
          
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-400/25 animate-fade-in shadow-elevated">
            <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <div className="text-sm flex-1">
              <span className="text-emerald-400 font-bold">Smart Assignment Complete</span>
              <span className="text-muted-foreground"> - AI assigned critical path tasks to optimal team members</span>
            </div>
            <div className="text-xs text-emerald-400 font-medium">Just now</div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-400/25 animate-fade-in animation-delay-500 shadow-elevated">
            <TrendingUp className="h-5 w-5 text-blue-400 flex-shrink-0" />
            <div className="text-sm flex-1">
              <span className="text-blue-400 font-bold">Performance Boost Detected</span>
              <span className="text-muted-foreground"> - Team velocity increased 34% after AI optimization</span>
            </div>
            <div className="text-xs text-blue-400 font-medium">2 min ago</div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-400/25 animate-fade-in animation-delay-1000 shadow-elevated">
            <AlertTriangle className="h-5 w-5 text-purple-400 flex-shrink-0" />
            <div className="text-sm flex-1">
              <span className="text-purple-400 font-bold">Proactive Risk Mitigation</span>
              <span className="text-muted-foreground"> - AI identified and resolved potential bottleneck</span>
            </div>
            <div className="text-xs text-purple-400 font-medium">5 min ago</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProjectDashboard;
