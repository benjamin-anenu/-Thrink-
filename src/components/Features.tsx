
import React, { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Brain, Target, Shield, Users, Zap, Code } from "lucide-react";

const Features = () => {
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  
  const features = [
    {
      title: "Project Health Monitoring",
      description: "AI continuously monitors project vital signs and predicts potential issues before they impact delivery.",
      expandedDescription: "Advanced machine learning algorithms analyze project metrics, team performance, and external factors to provide real-time health scores. Get early warnings about budget overruns, timeline delays, and resource conflicts. Automated health reports keep stakeholders informed without manual intervention.",
      icon: <Brain size={24} className="text-primary" />
    },
    {
      title: "Intelligent Task Routing",
      description: "Smart task assignment based on team skills, workload, and project priorities using AI optimization.",
      expandedDescription: "Our AI engine analyzes team member expertise, current workload, and project dependencies to automatically route tasks to the most suitable person. Reduce bottlenecks, optimize team efficiency, and ensure critical path tasks are prioritized. Smart escalation when capacity limits are reached.",
      icon: <Target size={24} className="text-primary" />
    },
    {
      title: "Risk Prediction & Alerts",
      description: "Proactive risk identification using predictive analytics to prevent project failures before they happen.",
      expandedDescription: "Machine learning models trained on thousands of projects identify patterns that lead to delays, budget overruns, and scope creep. Receive intelligent alerts with actionable recommendations. Historical analysis helps teams learn from past projects and avoid repeated mistakes.",
      icon: <Shield size={24} className="text-primary" />
    },
    {
      title: "Smart Resource Allocation",
      description: "AI-powered resource optimization ensures optimal team utilization and project capacity planning.",
      expandedDescription: "Dynamic resource allocation based on project demands, team availability, and skill requirements. Predictive capacity planning helps you make informed hiring decisions. Identify underutilized resources and redistribute workload automatically for maximum efficiency.",
      icon: <Users size={24} className="text-primary" />
    },
    {
      title: "Automated Workflow Optimization",
      description: "Continuous process improvement through AI analysis of team workflows and project patterns.",
      expandedDescription: "AI studies your team's working patterns and suggests workflow optimizations. Automated process recommendations reduce manual overhead and eliminate inefficiencies. Custom automation rules adapt to your team's unique requirements and preferences.",
      icon: <Zap size={24} className="text-primary" />
    },
    {
      title: "Advanced Project APIs",
      description: "Comprehensive APIs for seamless integration with your existing development and project management tools.",
      expandedDescription: "Connect with popular development tools, CI/CD pipelines, and project management platforms through our robust APIs. Real-time webhooks for project events, detailed documentation, and SDKs for popular languages. Build custom integrations that fit your unique development workflow.",
      icon: <Code size={24} className="text-primary" />
    }
  ];
  
  const toggleFeature = (index: number) => {
    setOpenFeature(openFeature === index ? null : index);
  };
  
  return (
    <section id="features" className="w-full py-20 px-6 md:px-12 bg-card/30">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            AI-Powered Project Intelligence
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Transform your project management with intelligent automation and predictive insights that keep your teams ahead of challenges
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Collapsible
              key={index}
              open={openFeature === index}
              onOpenChange={() => toggleFeature(index)}
              className={`rounded-2xl border transition-all duration-300 glass-card hover:shadow-lg hover:shadow-primary/10 ${
                openFeature === index ? 'border-primary/40 shadow-lg shadow-primary/20' : 'border-border/50'
              }`}
            >
              <CollapsibleTrigger className="w-full text-left p-6 flex flex-col group">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                      openFeature === index ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                <h3 className="text-xl font-semibold tracking-tight mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 pb-6">
                <div className="pt-4 border-t border-border/30">
                  <p className="text-muted-foreground leading-relaxed mb-4">{feature.expandedDescription}</p>
                  <div className="flex justify-end">
                    <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors flex items-center gap-1">
                      Learn more <ChevronDown className="h-4 w-4 -rotate-90" />
                    </button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
