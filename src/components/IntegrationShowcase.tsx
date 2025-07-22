
import React from 'react';
import { Network, Workflow, GitBranch, Database, Cloud, Zap } from 'lucide-react';

const integrations = [
  { name: "Slack", logo: "💬" },
  { name: "Microsoft Teams", logo: "🏢" },
  { name: "Jira", logo: "🎯" },
  { name: "GitHub", logo: "🐙" },
  { name: "Azure", logo: "☁️" },
  { name: "AWS", logo: "📦" }
];

const IntegrationShowcase = () => {
  return (
    <section className="w-full py-24 px-4 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-orange-500/5" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, ${getComputedStyle(document.documentElement).getPropertyValue('--primary')}/10 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, ${getComputedStyle(document.documentElement).getPropertyValue('--primary')}/10 0%, transparent 50%)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-md rounded-full border border-primary/20">
            <Network className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Seamless Integration</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Connects with Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Existing Workflow
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Thrink integrates seamlessly with your current tools, enhancing rather than replacing your established processes.
          </p>
        </div>

        {/* Central Integration Hub */}
        <div className="flex items-center justify-center mb-16">
          <div className="relative">
            {/* Central Hub */}
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 relative z-10">
              <Workflow className="h-12 w-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl" />
            </div>

            {/* Integration Nodes */}
            {integrations.map((integration, idx) => {
              const angle = (idx * 60) * (Math.PI / 180); // 60 degrees apart
              const radius = 120;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              return (
                <div
                  key={idx}
                  className="absolute w-16 h-16 bg-card/80 backdrop-blur-md rounded-2xl border border-border/50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 cursor-pointer group"
                  style={{
                    left: `calc(50% + ${x}px - 32px)`,
                    top: `calc(50% + ${y}px - 32px)`,
                    animationDelay: `${idx * 0.2}s`
                  }}
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">
                    {integration.logo}
                  </span>
                  
                  {/* Connection Line */}
                  <div 
                    className="absolute w-px bg-gradient-to-r from-primary/40 to-transparent"
                    style={{
                      height: `${radius - 40}px`,
                      left: '50%',
                      top: '50%',
                      transformOrigin: 'top',
                      transform: `translateX(-50%) rotate(${angle + Math.PI}rad)`
                    }}
                  />
                  
                  {/* Tooltip */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs whitespace-nowrap border border-border/50">
                    {integration.name}
                  </div>
                </div>
              );
            })}

            {/* Animated Connection Rings */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" style={{ width: '280px', height: '280px', left: '-74px', top: '-74px' }} />
              <div className="absolute inset-0 border border-primary/10 rounded-full" style={{ width: '240px', height: '240px', left: '-54px', top: '-54px' }} />
            </div>
          </div>
        </div>

        {/* Integration Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <GitBranch className="h-6 w-6 text-primary" />,
              title: "Unified Workflow",
              description: "All your tools work together in harmony"
            },
            {
              icon: <Database className="h-6 w-6 text-orange-500" />,
              title: "Data Synchronization",
              description: "Real-time sync across all connected platforms"
            },
            {
              icon: <Cloud className="h-6 w-6 text-purple-500" />,
              title: "Enterprise Security",
              description: "Bank-level security for all integrations"
            }
          ].map((benefit, idx) => (
            <div key={idx} className="text-center space-y-4 p-6 bg-card/30 backdrop-blur-sm rounded-2xl border border-border/30 hover:border-primary/20 transition-colors">
              <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center mx-auto">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-semibold">{benefit.title}</h3>
              <p className="text-muted-foreground text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Animation */}
      <style>{`
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-up { animation: float-up 4s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default IntegrationShowcase;
