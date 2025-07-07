
import React, { useState, useEffect } from 'react';
import DashboardHeader from './dashboard/DashboardHeader';
import DashboardMetrics from './dashboard/DashboardMetrics';
import ProjectDisplay from './dashboard/ProjectDisplay';
import AIInsights from './dashboard/AIInsights';

const AIProjectDashboard = () => {
  const [activeProject, setActiveProject] = useState(0);
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

  return (
    <div className="w-full h-full bg-gradient-to-br from-card/98 to-card/95 backdrop-blur-2xl rounded-3xl border border-primary/10 overflow-hidden">
      <DashboardHeader aiConfidence={metrics.aiConfidence} />
      
      <div className="p-8 border-b border-primary/10">
        <DashboardMetrics 
          successRate={metrics.successRate}
          efficiency={metrics.efficiency}
          riskLevel={metrics.riskLevel}
          teamProductivity={metrics.teamProductivity}
        />
      </div>

      <div className="p-8">
        <ProjectDisplay projects={projects} activeProject={activeProject} />
        <AIInsights />
      </div>
    </div>
  );
};

export default AIProjectDashboard;
