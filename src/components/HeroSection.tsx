
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import AIProjectDashboard from './AIProjectDashboard';
import MiloAssistant from './MiloAssistant';
import { MessageSquare, ArrowRight, Sparkles, Zap, Brain, Bot, Cpu, Network, Layers, GitBranch, Play, ChevronRight } from 'lucide-react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const parallaxOffset = scrollY * 0.3;

  return (
    <section ref={heroRef} className="relative w-full min-h-screen overflow-hidden bg-background">
      {/* Enhanced AI Processing Background with Parallax */}
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
          <span className="text-purple-400">if</span> <span className="text-foreground">(</span><span className="text-yellow-300">project.risk</span> <span className="text-purple-400">></span> <span className="text-orange-400">0.7</span><span className="text-foreground">) {</span> <span className="text-emerald-400">autoOptimize</span><span className="text-foreground">();</span> <span className="text-foreground">}</span>
        </div>
        <div className="code-fragment-enhanced" style={{ top: '80%', animationDelay: '8s' }}>
          <span className="text-blue-400">milo</span><span className="text-foreground">.</span><span className="text-cyan-400">predictDelivery</span><span className="text-foreground">(</span><span className="text-yellow-300">timeline</span><span className="text-foreground">,</span> <span className="text-green-400">resources</span><span className="text-foreground">)</span>
        </div>
      </div>

      {/* Main Content - Premium Split Screen */}
      <div className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="hero-split">
            {/* Left Side - Enhanced Premium Content */}
            <div className={`space-y-10 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              
              {/* Premium Badge */}
              <div className="flex items-center gap-4">
                <span 
                  className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-full glass-card text-primary cursor-pointer transform transition-all duration-400 hover:scale-105 hover:shadow-glow border border-primary/20"
                  onMouseEnter={() => setHoveredElement('badge')}
                  onMouseLeave={() => setHoveredElement(null)}
                >
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
                  <Bot className={`h-4 w-4 ${hoveredElement === 'badge' ? 'animate-spin' : ''}`} />
                  Enterprise AI Project Intelligence
                  <ChevronRight className={`h-4 w-4 ${hoveredElement === 'badge' ? 'translate-x-1' : ''} transition-transform`} />
                </span>
              </div>
              
              <div className="space-y-8">
                <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none">
                  <span className="block bg-gradient-to-r from-foreground via-primary to-blue-400 bg-clip-text text-transparent hover:from-primary hover:via-purple-400 hover:to-cyan-400 transition-all duration-700 cursor-default">
                    The Future of
                  </span>
                  <span className="block bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:from-cyan-400 hover:via-primary hover:to-purple-400 transition-all duration-700 cursor-default mt-2">
                    Project Intelligence
                  </span>
                </h1>
                
                <p className="text-2xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
                  Harness the power of <span className="text-gradient-primary font-bold">advanced AI</span> to transform 
                  your project management. Predict risks, optimize resources, and automate complex workflows 
                  with enterprise-grade precision.
                </p>
                
                {/* Premium CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 pt-8">
                  <Button 
                    className="group btn-premium text-white text-lg h-16 px-10 rounded-2xl font-bold transform transition-all duration-300 hover:scale-105 shadow-elevated"
                    onMouseEnter={() => setHoveredElement('cta1')}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    <Play className={`mr-3 h-6 w-6 ${hoveredElement === 'cta1' ? 'scale-110' : ''} transition-transform fill-current`} />
                    Start AI Analysis
                    <ArrowRight className={`ml-3 h-6 w-6 ${hoveredElement === 'cta1' ? 'translate-x-2' : ''} transition-transform`} />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="group glass-card text-foreground hover:bg-primary/10 text-lg h-16 px-10 rounded-2xl font-bold border-primary/30 hover:border-primary/60 transition-all duration-300 transform hover:scale-105 shadow-elevated"
                    onMouseEnter={() => setHoveredElement('cta2')}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    <Network className={`mr-3 h-6 w-6 ${hoveredElement === 'cta2' ? 'animate-spin' : ''} transition-transform`} />
                    Watch Live Demo
                    <Sparkles className={`ml-3 h-6 w-6 ${hoveredElement === 'cta2' ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
                
                {/* Premium Feature Pills */}
                <div className="flex flex-wrap gap-6 pt-8">
                  <div className="flex items-center gap-3 cursor-pointer transform transition-all duration-300 hover:scale-105 px-4 py-2 rounded-full glass-card">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-muted-foreground hover:text-emerald-400 transition-colors font-medium">Real-time Risk Prediction</span>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer transform transition-all duration-300 hover:scale-105 px-4 py-2 rounded-full glass-card">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse animation-delay-500"></div>
                    <span className="text-muted-foreground hover:text-blue-400 transition-colors font-medium">Intelligent Automation</span>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer transform transition-all duration-300 hover:scale-105 px-4 py-2 rounded-full glass-card">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse animation-delay-1000"></div>
                    <span className="text-muted-foreground hover:text-purple-400 transition-colors font-medium">Predictive Analytics</span>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="pt-8 space-y-4">
                  <p className="text-sm text-muted-foreground font-medium">Trusted by leading enterprises worldwide</p>
                  <div className="flex items-center gap-8 opacity-60">
                    <div className="text-lg font-bold tracking-wide">MICROSOFT</div>
                    <div className="text-lg font-bold tracking-wide">GOOGLE</div>
                    <div className="text-lg font-bold tracking-wide">AMAZON</div>
                    <div className="text-lg font-bold tracking-wide">META</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Premium AI Dashboard */}
            <div className={`transition-all duration-1200 delay-300 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <div className="relative rounded-3xl overflow-hidden glass-card shadow-premium hover:shadow-glow transition-all duration-500 transform hover:scale-[1.02] border border-primary/20">
                {/* Premium Dashboard Header */}
                <div className="bg-gradient-to-r from-card/95 to-card/80 backdrop-blur-3xl p-8 border-b border-primary/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-5">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-glow">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="text-foreground font-bold text-xl">Milo AI Enterprise</span>
                        <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span>Advanced Intelligence Active</span>
                          <div className="px-2 py-1 bg-emerald-400/20 text-emerald-400 rounded-md text-xs font-semibold">LIVE</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 flex items-center text-emerald-400 text-sm font-bold shadow-elevated">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3 animate-pulse"></div>
                        AI Processing
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* AI Project Dashboard */}
                <div className="h-[650px] relative">
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
