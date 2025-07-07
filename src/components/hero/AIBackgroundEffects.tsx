
import React from 'react';
import { Brain, Cpu, Network, GitBranch, Layers, Zap, Bot } from 'lucide-react';

interface AIBackgroundEffectsProps {
  mousePosition: { x: number; y: number };
  scrollY: number;
}

const AIBackgroundEffects: React.FC<AIBackgroundEffectsProps> = ({ mousePosition, scrollY }) => {
  const parallaxOffset = scrollY * 0.3;

  return (
    <div 
      className="ai-processing-bg" 
      style={{ transform: `translateY(${parallaxOffset}px)` }}
    >
      <div className="neural-grid absolute inset-0"></div>
      
      {/* Premium Interactive AI Nodes */}
      <div 
        className="ai-node-interactive" 
        style={{ 
          top: '15%', 
          left: '8%', 
          transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.025}px)`,
          animationDelay: '0s' 
        }}
      >
        <Brain className="h-5 w-5 text-white" />
      </div>
      <div 
        className="ai-node-interactive" 
        style={{ 
          top: '35%', 
          left: '85%', 
          transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * 0.03}px)`,
          animationDelay: '1.2s' 
        }}
      >
        <Cpu className="h-4 w-4 text-white animate-spin" />
      </div>
      <div 
        className="ai-node-interactive" 
        style={{ 
          top: '75%', 
          left: '12%', 
          transform: `translate(${mousePosition.x * 0.035}px, ${mousePosition.y * -0.025}px)`,
          animationDelay: '2.4s' 
        }}
      >
        <Network className="h-5 w-5 text-white" />
      </div>
      <div 
        className="ai-node-interactive" 
        style={{ 
          top: '55%', 
          left: '75%', 
          transform: `translate(${mousePosition.x * -0.03}px, ${mousePosition.y * -0.02}px)`,
          animationDelay: '1.8s' 
        }}
      >
        <GitBranch className="h-4 w-4 text-white" />
      </div>
      <div 
        className="ai-node-interactive" 
        style={{ 
          top: '25%', 
          left: '45%', 
          transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.035}px)`,
          animationDelay: '0.6s' 
        }}
      >
        <Layers className="h-5 w-5 text-white" />
      </div>
      
      {/* Enhanced Premium Connections */}
      <div className="ai-connection-glow" style={{ top: '20%', left: '15%', width: '280px', transform: 'rotate(25deg)' }}></div>
      <div className="ai-connection-glow" style={{ top: '40%', left: '50%', width: '320px', transform: 'rotate(-15deg)', animationDelay: '1.5s' }}></div>
      <div className="ai-connection-glow" style={{ top: '70%', left: '25%', width: '350px', transform: 'rotate(35deg)', animationDelay: '3s' }}></div>
      
      {/* Premium Floating Intelligence Cards */}
      <div className="project-intelligence-float" style={{ top: '12%', right: '18%', animationDelay: '0s' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm text-primary font-semibold">AI Health Monitor</div>
        </div>
        <div className="text-xs text-muted-foreground mb-1">Project Analysis Complete</div>
        <div className="text-xs text-green-400 font-medium">✓ Optimal Performance</div>
        <div className="text-xs text-blue-400">Timeline: 94% Confidence</div>
      </div>
      
      <div className="project-intelligence-float" style={{ top: '40%', left: '3%', animationDelay: '2.5s' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm text-emerald-400 font-semibold">Smart Automation</div>
        </div>
        <div className="text-xs text-muted-foreground mb-1">Resource optimization active</div>
        <div className="text-xs text-emerald-400 font-medium">+47% Efficiency Gain</div>
        <div className="text-xs text-purple-400">Next optimization in 2h</div>
      </div>
      
      <div className="project-intelligence-float" style={{ bottom: '25%', right: '8%', animationDelay: '5s' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm text-purple-400 font-semibold">Predictive Analytics</div>
        </div>
        <div className="text-xs text-muted-foreground mb-1">Risk assessment complete</div>
        <div className="text-xs text-green-400 font-medium">Low Risk Detected</div>
        <div className="text-xs text-blue-400">Delivery: 3 days early</div>
      </div>
      
      {/* Premium Code Fragments */}
      <div className="code-fragment-enhanced" style={{ top: '20%', animationDelay: '0s' }}>
        <span className="text-blue-400">const</span> <span className="text-yellow-300">aiResult</span> <span className="text-purple-400">=</span> <span className="text-emerald-400">await</span> <span className="text-blue-400">milo</span><span className="text-foreground">.</span><span className="text-cyan-400">analyzeProjekt</span><span className="text-foreground">();</span>
      </div>
      <div className="code-fragment-enhanced" style={{ top: '50%', animationDelay: '4s' }}>
        <span className="text-purple-400">if</span> <span className="text-foreground">(</span><span className="text-yellow-300">project.risk</span> <span className="text-purple-400">&gt;</span> <span className="text-orange-400">0.7</span><span className="text-foreground">) &#123;</span> <span className="text-emerald-400">autoOptimize</span><span className="text-foreground">();</span> <span className="text-foreground">&#125;</span>
      </div>
      <div className="code-fragment-enhanced" style={{ top: '80%', animationDelay: '8s' }}>
        <span className="text-blue-400">milo</span><span className="text-foreground">.</span><span className="text-cyan-400">predictDelivery</span><span className="text-foreground">(</span><span className="text-yellow-300">timeline</span><span className="text-foreground">,</span> <span className="text-green-400">resources</span><span className="text-foreground">)</span>
      </div>
    </div>
  );
};

export default AIBackgroundEffects;
