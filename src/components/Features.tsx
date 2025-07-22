
import React, { useRef, useEffect, useState } from 'react';
import { Brain, Shield, Zap, BarChart3, Users, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    title: 'AI Workflow Analysis',
    description: 'Intelligently analyzes your team\'s workflows, surfacing bottlenecks and opportunities for optimization in real time.',
    features: ['Automated process mapping', 'Bottleneck detection', 'Continuous improvement suggestions'],
    icon: <Brain className="h-8 w-8 text-primary" />,
    gradient: "from-primary/20 to-blue-400/20",
    category: "AI Intelligence"
  },
  {
    title: 'Predictive Risk Management',
    description: 'Anticipate project risks before they happen with proactive alerts and AI-powered mitigation strategies.',
    features: ['Early risk detection', 'Actionable mitigation plans', 'Executive risk dashboards'],
    icon: <Shield className="h-8 w-8 text-green-500" />,
    gradient: "from-green-400/20 to-emerald-500/20",
    category: "Risk Prevention"
  },
  {
    title: 'Automated Coordination',
    description: 'Automate task assignments, follow-ups, and status updates, freeing leaders to focus on strategy.',
    features: ['Smart task routing', 'Automated reminders', 'Seamless integrations'],
    icon: <Zap className="h-8 w-8 text-orange-500" />,
    gradient: "from-orange-400/20 to-amber-500/20",
    category: "Human Efficiency"
  },
  {
    title: 'Real-Time Executive Clarity',
    description: 'Get instant, actionable insights into project health, team performance, and business impact.',
    features: ['Live executive dashboards', 'AI-powered reporting', 'Customizable KPIs'],
    icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
    gradient: "from-purple-400/20 to-pink-400/20",
    category: "Analytics"
  },
  {
    title: 'Enterprise-Grade Collaboration',
    description: 'Unify teams, stakeholders, and data with secure, scalable collaboration tools built for enterprise.',
    features: ['Role-based access', 'Stakeholder engagement', 'Secure document sharing'],
    icon: <Users className="h-8 w-8 text-blue-500" />,
    gradient: "from-blue-400/20 to-cyan-400/20",
    category: "Collaboration"
  },
  {
    title: 'Outcome-Driven Leadership',
    description: 'Empower leaders with the clarity and confidence to drive results, not just manage tasks.',
    features: ['Goal alignment', 'Outcome tracking', 'AI-powered recommendations'],
    icon: <Target className="h-8 w-8 text-indigo-500" />,
    gradient: "from-indigo-400/20 to-violet-400/20",
    category: "Leadership"
  }
];

const Features = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      setIsAutoScrolling(false);
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      setIsAutoScrolling(false);
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollButtons();
    container.addEventListener('scroll', checkScrollButtons);

    // Auto-scroll functionality
    let autoScrollInterval: NodeJS.Timeout;
    
    if (isAutoScrolling) {
      autoScrollInterval = setInterval(() => {
        if (container) {
          const { scrollLeft, scrollWidth, clientWidth } = container;
          
          if (scrollLeft >= scrollWidth - clientWidth - 10) {
            // Reset to start
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            // Continue scrolling
            container.scrollBy({ left: 320, behavior: 'smooth' });
          }
        }
      }, 4000);
    }

    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
      if (autoScrollInterval) clearInterval(autoScrollInterval);
    };
  }, [isAutoScrolling]);

  return (
    <section id="features" className="w-full py-24 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-gradient-to-tl from-orange-400/15 to-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-card/60 backdrop-blur-md rounded-full border border-primary/20">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-primary">AI-Powered Excellence</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Where Intelligence
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Meets Leadership
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From executives to project managers, Thrink delivers the insights and automation you need to drive exceptional results.
          </p>
        </div>

        {/* Features Carousel */}
        <div className="relative">
          {/* Scroll Controls */}
          <div className="flex justify-between items-center mb-8">
            <div className="text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Auto-scrolling features
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className="w-10 h-10 p-0 rounded-full bg-card/60 backdrop-blur-md border-border/50 hover:border-primary/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollRight}
                disabled={!canScrollRight}
                className="w-10 h-10 p-0 rounded-full bg-card/60 backdrop-blur-md border-border/50 hover:border-primary/30"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Carousel Container */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            {features.map((feature, idx) => (
              <div 
                key={idx}
                className="flex-shrink-0 w-80 group"
              >
                <div className="relative bg-card/60 backdrop-blur-md rounded-3xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 h-full">
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative z-10 space-y-6">
                    {/* Category & Icon */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
                        {feature.category}
                      </div>
                      <div className="w-12 h-12 bg-muted/50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold group-hover:text-foreground transition-colors">
                        {feature.title}
                      </h3>
                      
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-3">
                      {feature.features.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-center gap-3 text-xs">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Decorative Element */}
                    <div className="absolute top-6 right-6 w-8 h-8 border border-primary/20 rounded-lg flex items-center justify-center group-hover:border-primary/40 transition-colors">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full group-hover:scale-150 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {features.map((_, idx) => (
              <div 
                key={idx}
                className="w-2 h-2 rounded-full bg-muted/40 transition-colors"
                style={{
                  backgroundColor: idx < 3 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default Features;
