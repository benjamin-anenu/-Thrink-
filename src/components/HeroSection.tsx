
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AIProjectDashboard from './AIProjectDashboard';
import MiloAssistant from './MiloAssistant';
import { MessageSquare, ArrowRight, Sparkles, Zap, Brain, Bot, Cpu, Network, Layers, GitBranch } from 'lucide-react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-background">
      {/* Enhanced AI Processing Background */}
      <div className="ai-processing-bg">
        <div className="neural-grid absolute inset-0"></div>
        
        {/* Interactive AI Nodes with Mouse Following */}
        <div 
          className="ai-node-interactive" 
          style={{ 
            top: '20%', 
            left: '10%', 
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            animationDelay: '0s' 
          }}
        >
          <Brain className="h-4 w-4 text-primary animate-pulse" />
        </div>
        <div 
          className="ai-node-interactive" 
          style={{ 
            top: '40%', 
            left: '80%', 
            transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * 0.025}px)`,
            animationDelay: '1s' 
          }}
        >
          <Cpu className="h-3 w-3 text-blue-400 animate-spin" />
        </div>
        <div 
          className="ai-node-interactive" 
          style={{ 
            top: '70%', 
            left: '15%', 
            transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * -0.02}px)`,
            animationDelay: '2s' 
          }}
        >
          <Network className="h-4 w-4 text-purple-400 animate-pulse" />
        </div>
        <div 
          className="ai-node-interactive" 
          style={{ 
            top: '60%', 
            left: '70%', 
            transform: `translate(${mousePosition.x * -0.025}px, ${mousePosition.y * -0.015}px)`,
            animationDelay: '1.5s' 
          }}
        >
          <GitBranch className="h-3 w-3 text-green-400 animate-bounce" />
        </div>
        <div 
          className="ai-node-interactive" 
          style={{ 
            top: '30%', 
            left: '45%', 
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.03}px)`,
            animationDelay: '0.5s' 
          }}
        >
          <Layers className="h-4 w-4 text-yellow-400 animate-pulse" />
        </div>
        
        {/* Enhanced AI Connections with Glow */}
        <div className="ai-connection-glow" style={{ top: '25%', left: '12%', width: '200px', transform: 'rotate(25deg)' }}></div>
        <div className="ai-connection-glow" style={{ top: '45%', left: '45%', width: '250px', transform: 'rotate(-15deg)', animationDelay: '1s' }}></div>
        <div className="ai-connection-glow" style={{ top: '65%', left: '20%', width: '300px', transform: 'rotate(35deg)', animationDelay: '2s' }}></div>
        
        {/* Floating Project Intelligence Cards */}
        <div className="project-intelligence-float" style={{ top: '15%', right: '20%', animationDelay: '0s' }}>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-3 w-3 text-primary" />
            <div className="text-xs text-primary font-medium">AI Analysis</div>
          </div>
          <div className="text-[10px] text-muted-foreground">Project health: Excellent</div>
          <div className="text-[10px] text-green-400">Risk level: Low</div>
        </div>
        <div className="project-intelligence-float" style={{ top: '45%', left: '5%', animationDelay: '2s' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-3 w-3 text-yellow-400" />
            <div className="text-xs text-yellow-400 font-medium">Auto-Optimization</div>
          </div>
          <div className="text-[10px] text-muted-foreground">Resource allocation improved</div>
          <div className="text-[10px] text-blue-400">Efficiency +34%</div>
        </div>
        <div className="project-intelligence-float" style={{ bottom: '30%', right: '10%', animationDelay: '4s' }}>
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-3 w-3 text-purple-400" />
            <div className="text-xs text-purple-400 font-medium">Predictive Insights</div>
          </div>
          <div className="text-[10px] text-muted-foreground">Timeline prediction</div>
          <div className="text-[10px] text-green-400">Early completion likely</div>
        </div>
        
        {/* Enhanced Code Fragments with Syntax */}
        <div className="code-fragment-enhanced" style={{ top: '25%', animationDelay: '0s' }}>
          <span className="text-blue-400">if</span> <span className="text-foreground">(</span><span className="text-yellow-400">project.risk</span> <span className="text-purple-400">===</span> <span className="text-green-400">'critical'</span><span className="text-foreground">)</span>
        </div>
        <div className="code-fragment-enhanced" style={{ top: '55%', animationDelay: '3s' }}>
          <span className="text-purple-400">AI</span><span className="text-foreground">.</span><span className="text-blue-400">optimizeWorkflow</span><span className="text-foreground">(</span><span className="text-yellow-400">team</span><span className="text-foreground">);</span>
        </div>
        <div className="code-fragment-enhanced" style={{ top: '75%', animationDelay: '6s' }}>
          <span className="text-blue-400">predictRisk</span><span className="text-foreground">(</span><span className="text-yellow-400">timeline</span><span className="text-foreground">,</span> <span className="text-green-400">resources</span><span className="text-foreground">);</span>
        </div>
      </div>

      {/* Main Content - Enhanced Split Screen */}
      <div className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="hero-split">
            {/* Left Side - Enhanced Content */}
            <div className={`space-y-8 transition-all duration-1200 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="flex items-center gap-3">
                <div className="ai-brain-enhanced">
                  <div className="brain-node" style={{ top: '20%', left: '30%' }}></div>
                  <div className="brain-node" style={{ top: '40%', left: '10%', animationDelay: '0.5s' }}></div>
                  <div className="brain-node" style={{ top: '60%', left: '50%', animationDelay: '1s' }}></div>
                  <div className="brain-node" style={{ top: '30%', left: '70%', animationDelay: '1.5s' }}></div>
                  <div className="brain-node" style={{ top: '70%', left: '20%', animationDelay: '2s' }}></div>
                  <div className="brain-connection-glow" style={{ top: '35%', left: '25%', width: '40px', transform: 'rotate(45deg)' }}></div>
                  <div className="brain-connection-glow" style={{ top: '55%', left: '35%', width: '35px', transform: 'rotate(-30deg)', animationDelay: '1s' }}></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <span 
                  className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-full glass-card text-primary cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
                  onMouseEnter={() => setHoveredElement('badge')}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <Bot className={`h-4 w-4 ${hoveredElement === 'badge' ? 'animate-spin' : 'animate-pulse'}`} />
                  AI-Powered Project Intelligence
                  <Cpu className={`h-4 w-4 ${hoveredElement === 'badge' ? 'animate-bounce' : 'animate-pulse'}`} />
                </span>
                
                <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none">
                  <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent hover:from-primary hover:via-blue-400 hover:to-purple-400 transition-all duration-500 cursor-default">
                    Smart Projects
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-purple-400 hover:via-primary hover:to-blue-400 transition-all duration-500 cursor-default">
                    Powered by AI
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Transform your project management with <span className="text-primary font-semibold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Milo AI</span> - 
                  the intelligent system that predicts risks, optimizes resources, and automates workflows 
                  before problems arise.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    className="group bg-gradient-to-r from-primary to-blue-400 text-primary-foreground hover:from-primary/90 hover:to-blue-400/90 text-lg h-14 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
                    onMouseEnter={() => setHoveredElement('cta1')}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    <Brain className={`mr-2 h-5 w-5 ${hoveredElement === 'cta1' ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
                    Start AI Analysis
                    <ArrowRight className={`ml-2 h-5 w-5 ${hoveredElement === 'cta1' ? 'translate-x-2' : 'group-hover:translate-x-1'} transition-transform`} />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="group glass-card text-foreground hover:bg-primary/10 text-lg h-14 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
                    onMouseEnter={() => setHoveredElement('cta2')}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    <Network className={`mr-2 h-5 w-5 ${hoveredElement === 'cta2' ? 'animate-bounce' : 'group-hover:animate-spin'}`} />
                    Watch AI Demo
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-6 pt-6 text-sm">
                  <div className="flex items-center gap-2 cursor-pointer transform transition-all duration-300 hover:scale-105">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-muted-foreground hover:text-green-400 transition-colors">Real-time Risk Detection</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer transform transition-all duration-300 hover:scale-105">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-500"></div>
                    <span className="text-muted-foreground hover:text-blue-400 transition-colors">Intelligent Resource Allocation</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer transform transition-all duration-300 hover:scale-105">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-1000"></div>
                    <span className="text-muted-foreground hover:text-purple-400 transition-colors">Predictive Project Analytics</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Enhanced AI Dashboard */}
            <div className={`transition-all duration-1500 delay-500 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative rounded-2xl overflow-hidden glass-card shadow-2xl hover:shadow-3xl hover:shadow-primary/20 transition-all duration-500 transform hover:scale-[1.02]">
                {/* Enhanced Dashboard Header */}
                <div className="bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-lg p-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center shadow-lg hover:shadow-primary/50 transition-shadow duration-300">
                        <Brain className="h-5 w-5 text-primary-foreground animate-pulse" />
                      </div>
                      <div>
                        <span className="text-foreground font-semibold text-lg">Milo AI Dashboard</span>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          Project Intelligence Active
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-8 px-3 rounded-lg bg-gradient-to-r from-green-400/20 to-green-400/10 border border-green-400/30 flex items-center text-green-400 text-sm hover:shadow-lg hover:shadow-green-400/20 transition-all duration-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        AI Active
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* AI Project Dashboard */}
                <div className="h-[600px] relative">
                  <AIProjectDashboard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MiloAssistant />
    </section>
  );
};

export default HeroSection;
