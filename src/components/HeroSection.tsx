
import React from 'react';
import { ArrowRight, Play, Brain, Sparkles, Zap, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-blue-400/10 rounded-full blur-3xl opacity-60 animate-float" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-cyan-300/20 rounded-full blur-2xl opacity-50 animate-float-slow" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-gradient-to-tr from-primary/20 to-purple-400/20 rounded-full blur-2xl opacity-40 animate-float" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-16">
          {/* Left: Content */}
          <div className="flex flex-col items-start text-left space-y-8">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-card/60 backdrop-blur-md rounded-full border border-primary/20 shadow-lg">
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Enterprise AI Project Intelligence</span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-black tracking-tighter leading-none">
                <span className="block bg-gradient-to-r from-foreground via-primary to-blue-400 bg-clip-text text-transparent">
                  Engineered to Think.
                </span>
                <span className="block bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent mt-2">
                  Designed to Lead.
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
                Thrink is an enterprise-grade, AI-powered project management solution designed to empower leaders, not just task managers. Unite human intelligence with AI insights for exceptional results.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/auth?tab=signup">
                <Button className="group bg-gradient-to-r from-primary to-blue-600 text-white text-lg h-14 px-8 rounded-2xl font-bold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105">
                  <Play className="mr-3 h-5 w-5 fill-current" />
                  Start Free Trial
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Button variant="outline" className="group bg-card/60 backdrop-blur-md text-foreground hover:bg-primary/10 text-lg h-14 px-8 rounded-2xl font-bold border-primary/30 hover:border-primary/60 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <Network className="mr-3 h-5 w-5" />
                Watch Demo
                <Sparkles className="ml-3 h-5 w-5 group-hover:animate-pulse" />
              </Button>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 pt-6">
              {[
                { label: "Real-time Risk Prediction", color: "from-emerald-400 to-cyan-400" },
                { label: "Intelligent Automation", color: "from-blue-400 to-purple-400" },
                { label: "Predictive Analytics", color: "from-purple-400 to-pink-400" }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 px-4 py-2 bg-card/60 backdrop-blur-md rounded-full border border-border/50 hover:scale-105 transition-transform cursor-pointer">
                  <div className={`w-3 h-3 bg-gradient-to-r ${feature.color} rounded-full animate-pulse`} style={{ animationDelay: `${idx * 500}ms` }}></div>
                  <span className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-6">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xl">★★★★★</span>
                <span className="text-sm text-muted-foreground">4.9/5 from 2,000+ leaders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary font-bold text-lg">10,000+</span>
                <span className="text-sm text-muted-foreground">teams onboarded</span>
              </div>
            </div>
          </div>

          {/* Right: Interactive Visual */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-md h-[420px] flex items-center justify-center">
              {/* Main Visual Container */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-lg border border-primary/20 shadow-2xl overflow-hidden animate-float">
                {/* AI Side (Left) */}
                <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-br from-primary/30 to-blue-600/20 flex flex-col justify-center items-center p-6">
                  <Brain className="h-12 w-12 text-primary mb-4 animate-pulse" />
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-primary mb-2">AI Intelligence</h3>
                    <div className="space-y-2">
                      <div className="h-2 bg-primary/40 rounded animate-pulse"></div>
                      <div className="h-2 bg-primary/30 rounded animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <div className="h-2 bg-primary/20 rounded animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                  </div>
                </div>

                {/* Human Side (Right) */}
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-bl from-orange-400/30 to-amber-500/20 flex flex-col justify-center items-center p-6">
                  <Zap className="h-12 w-12 text-orange-500 mb-4 animate-bounce" />
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-orange-600 mb-2">Human Expertise</h3>
                    <div className="space-y-2">
                      <div className="h-2 bg-orange-400/40 rounded animate-pulse"></div>
                      <div className="h-2 bg-orange-400/30 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <div className="h-2 bg-orange-400/20 rounded animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                    </div>
                  </div>
                </div>

                {/* Center Connection */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-primary to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Network className="h-8 w-8 text-white" />
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-blue-400/30 rounded-2xl backdrop-blur-sm border border-primary/20 flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-amber-500/30 rounded-2xl backdrop-blur-sm border border-orange-400/20 flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                <Brain className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Animation Keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default HeroSection;
