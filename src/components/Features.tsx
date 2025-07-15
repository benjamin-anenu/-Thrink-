
import React from 'react';
import { Brain, Shield, Zap } from "lucide-react";

const Features = () => {
  const features = [
    {
      title: "AI Health Monitoring",
      description: "Continuously monitors project health and predicts potential issues before they impact delivery.",
      icon: <Brain size={24} className="text-primary" />
    },
    {
      title: "Risk Prediction",
      description: "Proactive risk identification using predictive analytics to prevent project failures.",
      icon: <Shield size={24} className="text-primary" />
    },
    {
      title: "Smart Automation",
      description: "Intelligent workflow optimization that adapts to your team's patterns and requirements.",
      icon: <Zap size={24} className="text-primary" />
    }
  ];
  
  return (
    <section id="features" className="w-full py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              AI-Powered Features
            </span>
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Transform your project management with intelligent automation and predictive insights.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg border bg-card hover:shadow-lg transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
