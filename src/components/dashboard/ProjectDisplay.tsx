import React from 'react';
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

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
}

const ProjectDisplay: React.FC<ProjectDisplayProps> = ({ projects, activeProject }) => {
  const project = projects[activeProject];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accelerated': return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'Critical Path': return <AlertTriangle className="h-5 w-5 text-orange-400" />;
      case 'Optimal': return <CheckCircle className="h-5 w-5 text-blue-400" />;
      default: return <CheckCircle className="h-5 w-5 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Active Projects</h3>
        <div className="flex items-center gap-2">
          {projects.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === activeProject ? 'bg-primary scale-125' : 'bg-primary/30'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-primary/20 transform transition-all duration-500 hover:scale-105">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-2xl font-bold text-foreground mb-2">{project.name}</h4>
            <div className="flex items-center gap-3">
              {getStatusIcon(project.status)}
              <span className="font-semibold text-muted-foreground">{project.status}</span>
              <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                project.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                project.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {project.priority}
              </div>
            </div>
          </div>
          <div className="text-right space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm">{project.team} members</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{project.deadline} remaining</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-foreground font-semibold">{project.progress}%</span>
            </div>
            <div className="h-3 bg-card rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${project.color} transition-all duration-1000 rounded-full`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 animate-pulse"></div>
              <div>
                <span className="text-sm font-semibold text-primary">AI Insight</span>
                <p className="text-sm text-muted-foreground mt-1">{project.aiInsight}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDisplay;