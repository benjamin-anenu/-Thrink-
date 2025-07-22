
import React from 'react';
import { Shield, Award, Users, TrendingUp } from 'lucide-react';

const trustMetrics = [
  {
    icon: <Shield className="h-8 w-8 text-green-500" />,
    value: "SOC 2",
    label: "Compliance",
    description: "Enterprise security standards"
  },
  {
    icon: <Users className="h-8 w-8 text-blue-500" />,
    value: "10,000+",
    label: "Active Users",
    description: "Teams trust Thrink daily"
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
    value: "99.9%",
    label: "Uptime",
    description: "Reliable performance"
  },
  {
    icon: <Award className="h-8 w-8 text-orange-500" />,
    value: "4.9/5",
    label: "Satisfaction",
    description: "Highly rated by leaders"
  }
];

const partnerLogos = [
  { name: "Microsoft", logo: "🏢" },
  { name: "Google", logo: "🔍" },
  { name: "AWS", logo: "☁️" },
  { name: "Salesforce", logo: "⚡" },
  { name: "Slack", logo: "💬" },
  { name: "Zoom", logo: "📹" }
];

const TrustIndicators = () => {
  return (
    <section className="w-full py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-gradient-to-r from-green-400/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-l from-blue-400/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-20">
        {/* Trust Metrics */}
        <div className="text-center space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-md rounded-full border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Trusted by Industry Leaders</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Built for Enterprise,
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
                Loved by Teams
              </span>
            </h2>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustMetrics.map((metric, idx) => (
              <div key={idx} className="group text-center">
                <div className="relative bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-2">
                  {/* Icon */}
                  <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {metric.icon}
                  </div>

                  {/* Value */}
                  <div className="text-3xl lg:text-4xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">
                    {metric.value}
                  </div>

                  {/* Label */}
                  <div className="text-lg font-semibold text-muted-foreground mb-2">
                    {metric.label}
                  </div>

                  {/* Description */}
                  <div className="text-sm text-muted-foreground">
                    {metric.description}
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Partner Logos */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-muted-foreground mb-2">
              Integrated with industry leaders
            </h3>
            <p className="text-muted-foreground">
              Seamlessly connects with the tools you already use
            </p>
          </div>

          {/* Logo Ticker */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-12 items-center justify-center">
              {[...partnerLogos, ...partnerLogos].map((partner, idx) => (
                <div 
                  key={idx}
                  className="flex-shrink-0 w-24 h-24 bg-card/40 backdrop-blur-sm rounded-2xl border border-border/30 flex items-center justify-center hover:border-primary/30 hover:scale-110 transition-all duration-300 cursor-pointer group"
                >
                  <span className="text-3xl group-hover:scale-125 transition-transform">
                    {partner.logo}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs whitespace-nowrap border border-border/50">
                    {partner.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="text-center">
          <div className="inline-flex items-center gap-6 px-8 py-6 bg-card/60 backdrop-blur-md rounded-3xl border border-border/50 shadow-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-green-500" />
              <div className="text-left">
                <div className="text-lg font-bold">Enterprise Security</div>
                <div className="text-sm text-muted-foreground">SOC 2 Type II Certified</div>
              </div>
            </div>
            
            <div className="w-px h-12 bg-border" />
            
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-orange-500" />
              <div className="text-left">
                <div className="text-lg font-bold">GDPR Compliant</div>
                <div className="text-sm text-muted-foreground">Data protection assured</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Animation */}
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll { animation: scroll 30s linear infinite; }
      `}</style>
    </section>
  );
};

export default TrustIndicators;
