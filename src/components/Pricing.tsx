
import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Users, Zap, Crown } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Team Starter",
      price: "Free",
      description: "Perfect for small teams getting started with AI project management",
      features: [
        "Up to 5 team members",
        "3 active projects",
        "Basic AI insights",
        "Standard task automation",
        "Email support",
        "Project health monitoring"
      ],
      buttonText: "Start Free",
      buttonVariant: "outline",
      popular: false,
      icon: <Users className="h-6 w-6" />
    },
    {
      name: "Professional",
      price: "$29",
      period: "per user/month",
      description: "Advanced AI features for growing development teams",
      features: [
        "Unlimited team members",
        "Unlimited projects",
        "Advanced AI predictions",
        "Smart resource allocation",
        "Risk prediction & alerts",
        "Custom workflow automation",
        "Priority support",
        "Advanced analytics dashboard"
      ],
      buttonText: "Start 14-day trial",
      buttonVariant: "default",
      popular: true,
      icon: <Brain className="h-6 w-6" />
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Full AI-powered project intelligence for large organizations",
      features: [
        "Unlimited everything",
        "Custom AI model training",
        "Advanced compliance tools",
        "Dedicated infrastructure",
        "White-label solutions",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 premium support"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      popular: false,
      icon: <Crown className="h-6 w-6" />
    }
  ];
  
  return (
    <section id="pricing" className="w-full py-20 px-6 md:px-12 bg-card/30">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Transparent pricing for every team size
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Scale your AI-powered project management with plans that grow with your team
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`p-8 rounded-2xl border flex flex-col h-full transition-all duration-300 relative ${
                plan.popular 
                  ? "border-primary/50 glass-card shadow-lg shadow-primary/20 scale-105" 
                  : "border-border/50 glass-card hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-blue-400 text-primary-foreground text-sm rounded-full font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="mb-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground">{plan.name}</h3>
                </div>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold tracking-tight text-foreground">{plan.price}</div>
                  {plan.period && <div className="text-sm text-muted-foreground">{plan.period}</div>}
                </div>
                
                <p className="text-muted-foreground mb-8 leading-relaxed">{plan.description}</p>
                
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  className={
                    plan.buttonVariant === "default" 
                      ? "w-full bg-gradient-to-r from-primary to-blue-400 text-primary-foreground hover:from-primary/90 hover:to-blue-400/90 h-12 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105" 
                      : "w-full glass-card border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 h-12 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  }
                  variant={plan.buttonVariant as "default" | "outline"}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Need a custom solution? <a href="#" className="text-primary hover:underline font-medium">Talk to our AI specialists</a>
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
