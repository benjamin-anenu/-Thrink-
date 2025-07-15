
import React from 'react';
import { Activity, Users, Clock, Zap, Sparkles } from 'lucide-react';

interface Project {
  name: string;
  status: string;
  progress: number;
  risk: string;
  team: number;
  deadline: string;
  aiInsight: string;
  color: string;
  priority: string;
}

interface ProjectDisplayProps {
  projects: Project[];
  activeProject: number;
  onProjectChange: (index: number) => void;
}

const ProjectDisplay: React.FC<ProjectDisplayProps> = ({ projects, activeProject, onProjectChange }) => {
  console.log('[ProjectDisplay] Rendering with:', { projectsLength: projects.length, activeProject });

  // Safety checks for empty or invalid data
  if (!projects || projects.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-bold text-foreground flex items-center gap-3">
            <Activity className="h-5 w-5 text-primary" />
            Live Project Analysis
          </h4>
        </div>
        <div className="p-8 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border">
          <div className="text-center py-12">
            <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h5 className="text-xl font-semibold text-foreground mb-2">No Projects Available</h5>
            <p className="text-muted-foreground">Create your first project to see live analysis here.</p>
          </div>
        </div>
      </div>
    );
  }

  // Ensure activeProject index is valid
  const safeActiveProject = Math.max(0, Math.min(activeProject, projects.length - 1));
  const currentProject = projects[safeActiveProject];

  if (!currentProject) {
    console.warn('[ProjectDisplay] No current project found, using fallback');
    return (
      <div className="mb-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border">
          <div className="text-center py-12">
            <Activity className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h5 className="text-xl font-semibold text-foreground mb-2">Loading Project Data</h5>
            <p className="text-muted-foreground">Please wait while we load your project information.</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('[ProjectDisplay] Current project:', currentProject.name);

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
              className={`h-3 w-12 rounded-full transition-all duration-700 cursor-pointer ${
                i === safeActiveProject ? 'bg-gradient-to-r from-primary to-purple-500 shadow-glow' : 'bg-border/40'
              }`}
              onClick={() => onProjectChange(i)}
            />
          ))}
        </div>
      </div>

      <div className={`p-8 rounded-3xl bg-gradient-to-br ${currentProject.color || 'from-primary/10 to-purple-500/10'} border border-white/10 transform transition-all duration-1000 hover:scale-[1.02] shadow-premium`}>
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

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-3">
            <span className="text-muted-foreground font-medium">Project Progress</span>
            <span className="text-foreground font-bold">{currentProject.progress}%</span>
          </div>
          <div className="h-3 bg-border/30 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${currentProject.color || 'from-primary to-purple-500'} transition-all duration-1200 ease-out shadow-glow`}
              style={{ width: `${currentProject.progress}%` }}
            />
          </div>
        </div>

        {/* AI Insight */}
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
  );
};

export default ProjectDisplay;
