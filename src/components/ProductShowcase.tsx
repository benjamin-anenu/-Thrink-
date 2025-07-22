
import React from 'react';
import { Brain, Zap, BarChart3, Users, Target, Shield } from 'lucide-react';

const products = [
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "AI Project Intelligence",
    description: "Advanced algorithms analyze your projects in real-time, predicting risks and optimizing resource allocation with unprecedented accuracy.",
    features: ["Predictive risk analysis", "Resource optimization", "Timeline forecasting"],
    gradient: "from-primary/20 to-blue-400/20"
  },
  {
    icon: <Zap className="h-8 w-8 text-orange-500" />,
    title: "Human-Centric Automation",
    description: "Automate routine tasks while empowering your team to focus on strategic decisions and creative problem-solving.",
    features: ["Smart task routing", "Automated reporting", "Intelligent notifications"],
    gradient: "from-orange-400/20 to-amber-500/20"
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
    title: "Executive Insights",
    description: "Real-time dashboards and actionable insights that give leaders the clarity they need to drive exceptional results.",
    features: ["Executive dashboards", "KPI tracking", "Performance analytics"],
    gradient: "from-purple-400/20 to-pink-400/20"
  }
];

const ProductShowcase = () => {
  return (
    <section id="product-showcase" className="w-full py-24 px-4 bg-muted/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[300px] h-[300px] bg-gradient-to-r from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] bg-gradient-to-l from-orange-400/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-md rounded-full border border-primary/20">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Core Capabilities</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Where Intelligence
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Meets Leadership
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Thrink seamlessly blends AI capabilities with human expertise, creating a powerful platform that amplifies your team's potential.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {products.map((product, idx) => (
            <div 
              key={idx}
              className="group relative bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${product.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {product.icon}
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold mb-4 group-hover:text-foreground transition-colors">
                  {product.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {product.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3">
                  {product.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Decorative Element */}
                <div className="absolute top-6 right-6 w-12 h-12 border border-primary/20 rounded-full flex items-center justify-center group-hover:border-primary/40 transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full group-hover:scale-150 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-16">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-card/60 backdrop-blur-md rounded-2xl border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
            <Shield className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-lg font-semibold">Enterprise-ready security and compliance</span>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
