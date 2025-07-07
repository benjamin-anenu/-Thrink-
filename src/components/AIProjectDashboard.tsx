
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Users, Clock, Target, Zap, CheckCircle, Activity } from 'lucide-react';

const AIProjectDashboard = () => {
  const [activeProject, setActiveProject] = useState(0);
  const [aiPulse, setAiPulse] = useState(0);
  const [metrics, setMetrics] = useState({
    successRate: 94,
    efficiency: 87,
    riskLevel: 'Low',
    teamProductivity: 142
  });

  const projects = [
    {
      name: "Mobile App Redesign",
      status: "On Track",
      progress: 78,
      risk: "Low",
      team: 8,
      deadline: "5 days",
      aiInsight: "Predicted to finish 2 days early",
      color: "from-green-400 to-emerald-500"
    },
    {
      name: "Backend API Migration",
      status: "Critical",
      progress: 45,
      risk: "High",
      team: 12,
      deadline: "12 days",
      aiInsight: "Resource bottleneck detected",
      color: "from-red-400 to-rose-500"
    },
    {
      name: "Data Analytics Platform",
      status: "Accelerated",
      progress: 92,
      risk: "Low",
      team: 6,
      deadline: "3 days",
      aiInsight: "Exceeding velocity targets",
      color: "from-blue-400 to-cyan-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProject((prev) => (prev + 1) % projects.length);
      setAiPulse((prev) => prev + 1);
      
      // Simulate dynamic metrics
      setMetrics(prev => ({
        successRate: Math.min(99, prev.successRate + Math.random() * 2 - 1),
        efficiency: Math.min(100, prev.efficiency + Math.random() * 3 - 1.5),
        riskLevel: Math.random() > 0.7 ? 'Medium' : 'Low',
        teamProductivity: Math.min(200, prev.teamProductivity + Math.random() * 10 - 5)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentProject = projects[activeProject];

  return (
    <div className="w-full h-full bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-xl rounded-2xl border border-border/20 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/10 bg-gradient-to-r from-card/50 to-card/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center animate-pulse">
              <Brain className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Project Intelligence</h3>
              <p className="text-xs text-muted-foreground">Real-time analysis active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400 font-medium">Live AI Processing</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-400/10 to-green-400/5 border border-green-400/20">
            <div className="text-2xl font-bold text-green-400">{Math.round(metrics.successRate)}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-400/10 to-blue-400/5 border border-blue-400/20">
            <div className="text-2xl font-bold text-blue-400">{Math.round(metrics.efficiency)}%</div>
            <div className="text-xs text-muted-foreground">Efficiency</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-purple-400/10 to-purple-400/5 border border-purple-400/20">
            <div className="text-2xl font-bold text-purple-400">{metrics.riskLevel}</div>
            <div className="text-xs text-muted-foreground">Risk Level</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20">
            <div className="text-2xl font-bold text-yellow-400">{Math.round(metrics.teamProductivity)}%</div>
            <div className="text-xs text-muted-foreground">Productivity</div>
          </div>
        </div>
      </div>

      {/* Active Project Display */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-foreground">Active Project Analysis</h4>
            <div className="flex gap-1">
              {projects.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-2 w-8 rounded-full transition-all duration-500 ${
                    i === activeProject ? 'bg-primary' : 'bg-border/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className={`p-6 rounded-2xl bg-gradient-to-br ${currentProject.color}/10 border border-white/10 transform transition-all duration-700 hover:scale-[1.02]`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h5 className="text-xl font-semibold text-foreground mb-2">{currentProject.name}</h5>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{currentProject.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{currentProject.team} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{currentProject.deadline}</span>
                  </div>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentProject.risk === 'Low' ? 'bg-green-400/20 text-green-400' :
                currentProject.risk === 'Medium' ? 'bg-yellow-400/20 text-yellow-400' :
                'bg-red-400/20 text-red-400'
              }`}>
                {currentProject.risk} Risk
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-foreground font-medium">{currentProject.progress}%</span>
              </div>
              <div className="h-2 bg-border/30 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${currentProject.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${currentProject.progress}%` }}
                />
              </div>
            </div>

            {/* AI Insight */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-blue-400/10 border border-primary/20">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center animate-pulse">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <div className="text-xs text-primary font-medium mb-1">AI Prediction</div>
                <div className="text-sm text-foreground">{currentProject.aiInsight}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Notifications */}
        <div className="space-y-3">
          <h6 className="text-sm font-medium text-foreground mb-3">Live AI Insights</h6>
          
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-400/10 to-green-400/5 border border-green-400/20 animate-fade-in">
            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
            <div className="text-sm">
              <span className="text-green-400 font-medium">Task auto-assigned</span>
              <span className="text-muted-foreground"> - Frontend optimization to Sarah</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-400/10 to-blue-400/5 border border-blue-400/20 animate-fade-in animation-delay-500">
            <TrendingUp className="h-4 w-4 text-blue-400 flex-shrink-0" />
            <div className="text-sm">
              <span className="text-blue-400 font-medium">Velocity increase detected</span>
              <span className="text-muted-foreground"> - Team productivity up 23%</span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 animate-fade-in animation-delay-1000">
            <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <div className="text-sm">
              <span className="text-yellow-400 font-medium">Resource optimization</span>
              <span className="text-muted-foreground"> - Suggested team rebalancing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIProjectDashboard;
