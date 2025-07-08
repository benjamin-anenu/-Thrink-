import React from 'react';
import { TrendingUp, Shield, Users, Zap } from 'lucide-react';

interface DashboardMetricsProps {
  successRate: number;
  efficiency: number;
  riskLevel: string;
  teamProductivity: number;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  successRate,
  efficiency,
  riskLevel,
  teamProductivity,
}) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-emerald-400';
      case 'Medium': return 'text-orange-400';
      case 'High': return 'text-red-400';
      default: return 'text-emerald-400';
    }
  };

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="glass-card p-6 rounded-2xl border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <TrendingUp className="h-6 w-6 text-emerald-400" />
          <span className="text-2xl font-bold text-emerald-400">{successRate}%</span>
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground">Success Rate</h3>
        <p className="text-xs text-muted-foreground mt-1">Above target by 12%</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <Zap className="h-6 w-6 text-blue-400" />
          <span className="text-2xl font-bold text-blue-400">{efficiency}%</span>
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground">Efficiency</h3>
        <p className="text-xs text-muted-foreground mt-1">Optimal performance</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <Shield className="h-6 w-6 text-orange-400" />
          <span className={`text-2xl font-bold ${getRiskColor(riskLevel)}`}>{riskLevel}</span>
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground">Risk Level</h3>
        <p className="text-xs text-muted-foreground mt-1">AI monitoring active</p>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-primary/20">
        <div className="flex items-center justify-between mb-3">
          <Users className="h-6 w-6 text-purple-400" />
          <span className="text-2xl font-bold text-purple-400">{teamProductivity}%</span>
        </div>
        <h3 className="text-sm font-semibold text-muted-foreground">Team Productivity</h3>
        <p className="text-xs text-muted-foreground mt-1">Enhanced by AI</p>
      </div>
    </div>
  );
};

export default DashboardMetrics;