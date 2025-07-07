
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import TaskBoard from './TaskBoard';
import MiloAssistant from './MiloAssistant';
import { MessageSquare, ArrowRight, Sparkles, Zap, Brain, Bot, Cpu, Network } from 'lucide-react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-background">
      {/* AI Processing Background */}
      <div className="ai-processing-bg">
        <div className="neural-grid absolute inset-0"></div>
        
        {/* Animated AI Nodes */}
        <div className="ai-node" style={{ top: '20%', left: '10%', animationDelay: '0s' }}></div>
        <div className="ai-node" style={{ top: '40%', left: '80%', animationDelay: '1s' }}></div>
        <div className="ai-node" style={{ top: '70%', left: '15%', animationDelay: '2s' }}></div>
        <div className="ai-node" style={{ top: '60%', left: '70%', animationDelay: '1.5s' }}></div>
        <div className="ai-node" style={{ top: '30%', left: '45%', animationDelay: '0.5s' }}></div>
        
        {/* AI Connections */}
        <div className="ai-connection" style={{ top: '25%', left: '12%', width: '200px', transform: 'rotate(25deg)' }}></div>
        <div className="ai-connection" style={{ top: '45%', left: '45%', width: '250px', transform: 'rotate(-15deg)', animationDelay: '1s' }}></div>
        <div className="ai-connection" style={{ top: '65%', left: '20%', width: '300px', transform: 'rotate(35deg)', animationDelay: '2s' }}></div>
        
        {/* Floating Project Cards */}
        <div className="project-card-float" style={{ top: '15%', right: '20%', animationDelay: '0s' }}>
          <div className="text-xs text-primary">Task Analysis</div>
          <div className="text-[10px] text-muted-foreground">95% Complete</div>
        </div>
        <div className="project-card-float" style={{ top: '45%', left: '5%', animationDelay: '2s' }}>
          <div className="text-xs text-green-400">Risk Assessment</div>
          <div className="text-[10px] text-muted-foreground">Low Risk</div>
        </div>
        <div className="project-card-float" style={{ bottom: '30%', right: '10%', animationDelay: '4s' }}>
          <div className="text-xs text-yellow-400">Resource Optimization</div>
          <div className="text-[10px] text-muted-foreground">In Progress</div>
        </div>
        
        {/* Floating Code Fragments */}
        <div className="code-fragment" style={{ top: '25%', animationDelay: '0s' }}>
          if (project.status === 'critical') &#123;
        </div>
        <div className="code-fragment" style={{ top: '55%', animationDelay: '3s' }}>
          AI.optimizeWorkflow(team);
        </div>
        <div className="code-fragment" style={{ top: '75%', animationDelay: '6s' }}>
          predictRisk(timeline, resources);
        </div>
      </div>

      {/* Main Content - Split Screen */}
      <div className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="hero-split">
            {/* Left Side - Content */}
            <div className={`space-y-8 transition-all duration-1200 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="flex items-center gap-3">
                <div className="ai-brain">
                  <div className="brain-node" style={{ top: '20%', left: '30%' }}></div>
                  <div className="brain-node" style={{ top: '40%', left: '10%', animationDelay: '0.5s' }}></div>
                  <div className="brain-node" style={{ top: '60%', left: '50%', animationDelay: '1s' }}></div>
                  <div className="brain-node" style={{ top: '30%', left: '70%', animationDelay: '1.5s' }}></div>
                  <div className="brain-node" style={{ top: '70%', left: '20%', animationDelay: '2s' }}></div>
                  <div className="brain-connection" style={{ top: '35%', left: '25%', width: '40px', transform: 'rotate(45deg)' }}></div>
                  <div className="brain-connection" style={{ top: '55%', left: '35%', width: '35px', transform: 'rotate(-30deg)', animationDelay: '1s' }}></div>
                </div>
              </div>
              
              <div className="space-y-6">
                <span className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-full glass-card text-primary">
                  <Bot className="h-4 w-4 animate-pulse" />
                  AI-Powered Project Intelligence
                  <Cpu className="h-4 w-4 animate-pulse" />
                </span>
                
                <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none">
                  <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                    Smart Projects
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Powered by AI
                  </span>
                </h1>
                
                <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                  Transform your project management with <span className="text-primary font-semibold">Milo AI</span> - 
                  the intelligent system that predicts risks, optimizes resources, and automates workflows 
                  before problems arise.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button className="group bg-gradient-to-r from-primary to-blue-400 text-primary-foreground hover:from-primary/90 hover:to-blue-400/90 text-lg h-14 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                    <Brain className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                    Start AI Analysis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button variant="outline" className="group glass-card text-foreground hover:bg-primary/10 text-lg h-14 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                    <Network className="mr-2 h-5 w-5 group-hover:animate-spin" />
                    Watch AI Demo
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-6 pt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-muted-foreground">Real-time Risk Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-500"></div>
                    <span className="text-muted-foreground">Intelligent Resource Allocation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-1000"></div>
                    <span className="text-muted-foreground">Predictive Project Analytics</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - AI Dashboard Visualization */}
            <div className={`transition-all duration-1500 delay-500 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <div className="relative rounded-2xl overflow-hidden glass-card shadow-2xl">
                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-lg p-6 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <span className="text-foreground font-semibold text-lg">Milo AI Dashboard</span>
                        <div className="text-xs text-muted-foreground">Project Intelligence Active</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="h-8 px-3 rounded-lg bg-gradient-to-r from-green-400/20 to-green-400/10 border border-green-400/30 flex items-center text-green-400 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                        AI Active
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 bg-gradient-to-br from-background/50 to-background/30 min-h-[600px]">
                  <div className="mb-6">
                    <h3 className="font-semibold text-xl text-foreground mb-2">AI Project Analysis</h3>
                    <div className="flex gap-4 text-sm">
                      <span className="bg-primary/20 px-3 py-1 rounded-full text-primary">15 Projects Monitored</span>
                      <span className="bg-green-400/20 px-3 py-1 rounded-full text-green-400">98% Success Rate</span>
                    </div>
                  </div>
                  
                  {/* Task Board */}
                  <TaskBoard />
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
