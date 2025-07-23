
import React from 'react';
import { Brain, Users, TrendingUp, Shield } from 'lucide-react';

const valueProps = [
  {
    id: 1,
    decorativeText: "INTELLIGENCE",
    title: "AI-Powered Decision Making",
    description: "Our advanced AI algorithms analyze project patterns, predict potential roadblocks, and suggest optimal resource allocation strategies. Make data-driven decisions with confidence.",
    icon: <Brain className="h-12 w-12 text-primary" />,
    stats: { label: "Prediction Accuracy", value: "94%" },
    side: "left"
  },
  {
    id: 2,
    decorativeText: "COLLABORATION",
    title: "Human-Centric Design",
    description: "Built for humans, enhanced by AI. Our intuitive interface ensures your team can leverage powerful AI capabilities without sacrificing the human touch that drives innovation.",
    icon: <Users className="h-12 w-12 text-orange-500" />,
    stats: { label: "User Satisfaction", value: "98%" },
    side: "right"
  },
  {
    id: 3,
    decorativeText: "PERFORMANCE",
    title: "Measurable Impact",
    description: "Track real improvements in project delivery times, resource utilization, and team satisfaction. Our analytics provide clear ROI metrics for your AI investment.",
    icon: <TrendingUp className="h-12 w-12 text-green-500" />,
    stats: { label: "Efficiency Gain", value: "+47%" },
    side: "left"
  },
  {
    id: 4,
    decorativeText: "ENTERPRISE",
    title: "Security & Compliance",
    description: "Enterprise-grade security with SOC 2 compliance, end-to-end encryption, and granular access controls. Your data remains secure while enabling powerful insights.",
    icon: <Shield className="h-12 w-12 text-purple-500" />,
    stats: { label: "Uptime", value: "99.9%" },
    side: "right"
  }
];

const ValueProposition = () => {
  return (
    <section className="w-full py-32 px-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-orange-400/10 to-purple-400/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-32">
        {valueProps.map((prop, idx) => (
          <div key={prop.id} className="relative">
            {/* Decorative Background Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <h3 className="text-8xl lg:text-9xl font-black text-muted/5 tracking-tighter select-none">
                {prop.decorativeText}
              </h3>
            </div>

            {/* Content */}
            <div className={`flex flex-col lg:flex-row items-center gap-16 ${prop.side === 'right' ? 'lg:flex-row-reverse' : ''}`}>
              {/* Text Content */}
              <div className="flex-1 space-y-8 relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 flex items-center justify-center">
                      {prop.icon}
                    </div>
                    <div className="w-12 h-px bg-gradient-to-r from-primary to-transparent" />
                  </div>
                  
                  <h3 className="text-4xl lg:text-5xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                      {prop.title}
                    </span>
                  </h3>
                  
                  <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                    {prop.description}
                  </p>
                </div>

                {/* Stats Card */}
                <div className="inline-flex items-center gap-4 px-6 py-4 bg-card/60 backdrop-blur-md rounded-2xl border border-border/50 shadow-lg">
                  <div className="w-3 h-3 bg-gradient-to-r from-primary to-blue-400 rounded-full animate-pulse" />
                  <div>
                    <div className="text-2xl font-bold text-primary">{prop.stats.value}</div>
                    <div className="text-sm text-muted-foreground">{prop.stats.label}</div>
                  </div>
                </div>
              </div>

              {/* Visual Element */}
              <div className="flex-1 flex items-center justify-center relative z-10">
                <div className="relative w-80 h-80">
                  {/* Main Circle */}
                  <div className="absolute inset-0 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-lg rounded-full border border-border/50 shadow-2xl shadow-primary/10 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-blue-400/20 rounded-full flex items-center justify-center mx-auto">
                        {React.cloneElement(prop.icon, { className: "h-10 w-10" })}
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-primary">{prop.stats.value}</div>
                        <div className="text-sm text-muted-foreground">{prop.stats.label}</div>
                      </div>
                    </div>
                  </div>

                  {/* Orbiting Elements */}
                  <div className="absolute inset-0 animate-spin" style={{ animationDuration: '20s' }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="absolute w-4 h-4 bg-primary/60 rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `rotate(${i * 120}deg) translateX(160px) translateY(-50%)`,
                          transformOrigin: '0 50%'
                        }}
                      />
                    ))}
                  </div>

                  {/* Static Decorative Elements */}
                  <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-orange-400/30 to-amber-500/30 rounded-2xl backdrop-blur-sm border border-orange-400/20" />
                  <div className="absolute -bottom-6 -left-6 w-8 h-8 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-xl backdrop-blur-sm border border-purple-400/20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValueProposition;
