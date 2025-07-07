
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import TaskBoard from './TaskBoard';
import MiloAssistant from './MiloAssistant';
import { MessageSquare, ArrowRight, Sparkles, Zap, Brain } from 'lucide-react';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full min-h-screen py-12 md:py-20 px-6 md:px-12 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced 3D Cosmic Grid */}
      <div className="absolute inset-0">
        <div className="cosmic-grid opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent animate-gradient-shift"></div>
      </div>
      
      {/* 3D Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-primary/30 rounded-full animate-float blur-sm"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-primary/40 rounded-full animate-float animation-delay-1000 blur-sm"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-primary/50 rounded-full animate-float animation-delay-2000 blur-sm"></div>
        <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-primary/30 rounded-full animate-float animation-delay-3000 blur-sm"></div>
      </div>
      
      {/* Enhanced Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full">
        <div className="w-full h-full opacity-15 bg-gradient-radial from-primary via-primary/50 to-transparent blur-[150px] animate-pulse-slow"></div>
      </div>
      
      <div className={`relative z-10 max-w-5xl text-center space-y-8 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-primary backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            Next-Gen AI Project Intelligence
            <Brain className="h-4 w-4 text-primary animate-pulse" />
          </span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-balance bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
          Project Management
          <br />
          <span className="bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent">
            Reimagined
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed">
          Experience the future of project management with <span className="text-primary font-semibold">Milo AI</span> - your intelligent companion that transforms chaos into clarity through advanced automation and predictive insights.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 items-center">
          <Button className="group bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 text-lg h-14 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary/25">
            <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
            Launch Milo AI
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" className="group border-2 border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 text-lg h-14 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm">
            <MessageSquare className="mr-2 h-5 w-5 group-hover:animate-bounce" />
            See It In Action
          </Button>
        </div>
        
        <div className="pt-8 flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>AI-Powered Insights</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-500"></div>
            <span>Real-time Collaboration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse animation-delay-1000"></div>
            <span>Predictive Analytics</span>
          </div>
        </div>
      </div>
      
      {/* Enhanced 3D Dashboard */}
      <div className={`w-full max-w-7xl mt-16 z-10 transition-all duration-1500 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-32'}`}>
        <div className="relative rounded-2xl overflow-hidden border border-border/50 backdrop-blur-xl bg-card/80 shadow-2xl transform perspective-1000 hover:shadow-primary/20 transition-all duration-500">
          {/* 3D Glass Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none"></div>
          
          {/* Dashboard Header with enhanced styling */}
          <div className="bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-lg w-full border-b border-border/50">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-lg">P</span>
                </div>
                <div>
                  <span className="text-foreground font-semibold text-lg">Planova Intelligence Hub</span>
                  <div className="text-xs text-muted-foreground">Powered by Milo AI</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-card shadow-lg"></div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-card shadow-lg"></div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-card shadow-lg"></div>
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-card flex items-center justify-center text-xs text-white font-medium border-2 border-card shadow-lg">+12</div>
                </div>
                
                <div className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center text-primary text-sm font-medium backdrop-blur-sm">
                  <Brain className="mr-2 h-4 w-4" />
                  AI Active
                </div>
              </div>
            </div>
            
            {/* Enhanced Dashboard Content */}
            <div className="flex h-[650px] overflow-hidden">
              {/* Sidebar with 3D effects */}
              <div className="w-72 border-r border-border/50 p-6 space-y-6 hidden md:block bg-gradient-to-b from-card/50 to-card/30 backdrop-blur-sm">
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Smart Navigation</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-foreground shadow-sm">
                      <div className="h-4 w-4 rounded-md bg-primary shadow-sm"></div>
                      <span className="font-medium">Active Projects</span>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent/50 transition-all duration-200 hover:shadow-sm">
                      <div className="h-4 w-4 rounded-md bg-muted-foreground/30"></div>
                      <span>Team Resources</span>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent/50 transition-all duration-200 hover:shadow-sm">
                      <div className="h-4 w-4 rounded-md bg-muted-foreground/30"></div>
                      <span>Stakeholder Hub</span>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent/50 transition-all duration-200 hover:shadow-sm">
                      <div className="h-4 w-4 rounded-md bg-muted-foreground/30"></div>
                      <span>Analytics Suite</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 pt-6 border-t border-border/30">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">AI Intelligence</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent/50 transition-all duration-200">
                      <div className="h-4 w-4 rounded-full bg-green-400 shadow-sm animate-pulse"></div>
                      <span>Project Health</span>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent/50 transition-all duration-200">
                      <div className="h-4 w-4 rounded-full bg-yellow-400 shadow-sm animate-pulse animation-delay-500"></div>
                      <span>Risk Predictions</span>
                    </div>
                    <div className="flex items-center gap-4 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent/50 transition-all duration-200">
                      <div className="h-4 w-4 rounded-full bg-blue-400 shadow-sm animate-pulse animation-delay-1000"></div>
                      <span>Smart Insights</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Main Content */}
              <div className="flex-1 p-6 bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-sm overflow-hidden">
                <div className="flex items-center justify-between mb-8 min-w-0">
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <h3 className="font-semibold text-xl text-foreground">Project Intelligence Dashboard</h3>
                    <span className="text-sm bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 px-3 py-1 rounded-full text-primary font-medium">24 Active</span>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/30 flex items-center justify-center text-accent-foreground hover:shadow-lg transition-all duration-200">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M12 9L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:shadow-lg transition-all duration-200">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div className="h-10 px-6 rounded-xl bg-gradient-to-r from-foreground to-foreground/90 text-background flex items-center justify-center text-sm font-semibold whitespace-nowrap shadow-lg hover:shadow-xl transition-all duration-200">
                      <Brain className="mr-2 h-4 w-4" />
                      Ask Milo AI
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Kanban Board */}
                <div className="overflow-hidden rounded-xl">
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
