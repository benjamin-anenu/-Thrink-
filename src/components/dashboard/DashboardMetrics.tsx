
import React from 'react';
import { Shield } from 'lucide-react';

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
  teamProductivity
}) => {
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 border border-emerald-400/25 shadow-elevated hover:shadow-glow transition-all duration-300">
        <div className="text-3xl font-black text-emerald-400 mb-1">{Math.round(successRate)}%</div>
        <div className="text-xs text-muted-foreground font-medium">Success Rate</div>
        <div className="text-xs text-emerald-400 mt-1">↗ +2.3%</div>
      </div>
      <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-500/5 border border-blue-400/25 shadow-elevated hover:shadow-glow transition-all duration-300">
        <div className="text-3xl font-black text-blue-400 mb-1">{Math.round(efficiency)}%</div>
        <div className="text-xs text-muted-foreground font-medium">AI Efficiency</div>
        <div className="text-xs text-blue-400 mt-1">↗ +4.1%</div>
      </div>
      <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-500/5 border border-purple-400/25 shadow-elevated hover:shadow-glow transition-all duration-300">
        <div className="text-3xl font-black text-purple-400 mb-1">{riskLevel}</div>
        <div className="text-xs text-muted-foreground font-medium">Risk Assessment</div>
        <div className="text-xs text-purple-400 mt-1">
          <Shield className="h-3 w-3 inline mr-1" />Secured
        </div>
      </div>
      <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-cyan-500/5 border border-cyan-400/25 shadow-elevated hover:shadow-glow transition-all duration-300">
        <div className="text-3xl font-black text-cyan-400 mb-1">{Math.round(teamProductivity)}%</div>
        <div className="text-xs text-muted-foreground font-medium">Team Velocity</div>
        <div className="text-xs text-cyan-400 mt-1">↗ +12.5%</div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
