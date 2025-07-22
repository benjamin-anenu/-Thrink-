
import React from 'react';
import { Upload, Brain, Rocket, ArrowRight } from 'lucide-react';

const steps = [
  {
    step: "01",
    icon: <Upload className="h-8 w-8 text-primary" />,
    title: "Connect Your Data",
    description: "Seamlessly integrate with your existing tools and upload your project data. Our AI begins learning your workflow patterns immediately.",
    features: ["One-click integrations", "Secure data import", "Real-time sync"]
  },
  {
    step: "02", 
    icon: <Brain className="h-8 w-8 text-orange-500" />,
    title: "AI Analysis & Insights",
    description: "Our advanced algorithms analyze your data, identify patterns, and generate actionable insights tailored to your specific project needs.",
    features: ["Pattern recognition", "Risk prediction", "Resource optimization"]
  },
  {
    step: "03",
    icon: <Rocket className="h-8 w-8 text-green-500" />,
    title: "Execute & Optimize",
    description: "Implement AI-driven recommendations while maintaining human oversight. Continuously improve performance with real-time feedback loops.",
    features: ["Smart automation", "Human oversight", "Continuous learning"]
  }
];

const ProcessSection = () => {
  return (
    <section className="w-full py-24 px-4 bg-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-orange-500/5" />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/10"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-md rounded-full border border-primary/20">
            <Rocket className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Simple Process</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Get Started in
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Three Simple Steps
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From setup to optimization, Thrink makes it easy to transform your project management with AI.
          </p>
        </div>

        {/* Process Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Connection Line (desktop only) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 -right-6 w-12 h-px bg-gradient-to-r from-primary/40 to-transparent z-0">
                  <ArrowRight className="absolute -right-2 -top-2 h-4 w-4 text-primary/40" />
                </div>
              )}

              {/* Step Card */}
              <div className="relative bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 z-10">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 group-hover:text-foreground transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Features */}
                <ul className="space-y-3">
                  {step.features.map((feature, featureIdx) => (
                    <li key={featureIdx} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-16">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-card/60 backdrop-blur-md rounded-2xl border border-primary/20 hover:border-primary/40 transition-all cursor-pointer group hover:shadow-lg">
            <Brain className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-lg font-semibold">Ready to transform your projects?</span>
            <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
