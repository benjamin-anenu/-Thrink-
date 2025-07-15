
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Brain, Crown } from 'lucide-react';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 team members",
        "3 active projects",
        "Basic AI insights",
        "Email support"
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
      description: "Advanced AI features for growing teams",
      features: [
        "Unlimited team members",
        "Unlimited projects",
        "Advanced AI predictions",
        "Priority support"
      ],
      buttonText: "Start Trial",
      buttonVariant: "default",
      popular: true,
      icon: <Brain className="h-6 w-6" />
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Full AI-powered solution for large organizations",
      features: [
        "Custom AI training",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee"
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline",
      popular: false,
      icon: <Crown className="h-6 w-6" />
    }
  ];
  
  return (
    <section id="pricing" className="w-full py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Simple Pricing
            </span>
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            Choose the plan that fits your team size and needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`p-6 rounded-lg border bg-card relative ${
                plan.popular ? "border-primary shadow-lg" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  {plan.icon}
                </div>
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>
              
              <div className="mb-4">
                <div className="text-3xl font-bold">{plan.price}</div>
                {plan.period && <div className="text-sm text-muted-foreground">{plan.period}</div>}
              </div>
              
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              
              <div className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full"
                variant={plan.buttonVariant as "default" | "outline"}
              >
                {plan.buttonText}
              </Button>
            </div>
          ))}
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          <p>14-day free trial • No setup fees • Cancel anytime</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
