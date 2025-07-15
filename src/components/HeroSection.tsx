import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain } from 'lucide-react';

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth?tab=signup');
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center px-6 md:px-12 bg-background">
      {/* Simple Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-background"></div>
      
      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Simple Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Brain className="h-4 w-4" />
              AI-Powered Project Management
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  The Future of
                </span>
                <br />
                <span className="text-primary">
                  Project Intelligence
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Transform your project management with AI-powered insights, automated workflows, and predictive analytics.
              </p>
            </div>
            
            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                onClick={handleGetStarted} 
                className="group"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
          
          {/* Right Side - Simple Dashboard Mockup */}
          <div className="relative">
            <div className="bg-card border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold">AI Project Dashboard</span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary">24</div>
                    <div className="text-sm text-muted-foreground">Active Projects</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-500">94%</div>
                    <div className="text-sm text-muted-foreground">On Schedule</div>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-sm text-muted-foreground mb-2">AI Risk Analysis</div>
                  <div className="w-full bg-background rounded-full h-2 mb-2">
                    <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                  </div>
                  <div className="text-xs text-green-500">Low Risk - Projects on track</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
