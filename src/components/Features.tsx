
import React from 'react';
import { Brain, Shield, Zap, BarChart3, Users, Target } from 'lucide-react';

const features = [
  {
    title: 'AI Workflow Analysis',
    description: 'Thrink intelligently analyzes your team\'s workflows, surfacing bottlenecks and opportunities for optimization in real time.',
    bullets: [
      'Automated process mapping',
      'Bottleneck detection',
      'Continuous improvement suggestions',
    ],
    icon: <Brain className="h-10 w-10 text-primary" />, // left
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    imageAlt: 'AI workflow analysis dashboard with data visualization',
  },
  {
    title: 'Predictive Risk Management',
    description: 'Anticipate project risks before they happen. Tink, your AI assistant, delivers proactive alerts and mitigation strategies.',
    bullets: [
      'Early risk detection',
      'Actionable mitigation plans',
      'Executive risk dashboards',
    ],
    icon: <Shield className="h-10 w-10 text-primary" />, // right
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80',
    imageAlt: 'Predictive analytics dashboard with risk indicators',
  },
  {
    title: 'Automated Coordination',
    description: 'Tink automates task assignments, follow-ups, and status updates, freeing leaders to focus on strategy, not micromanagement.',
    bullets: [
      'Smart task routing',
      'Automated reminders',
      'Seamless integrations',
    ],
    icon: <Zap className="h-10 w-10 text-primary" />, // left
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    imageAlt: 'Automated task coordination and workflow management',
  },
  {
    title: 'Real-Time Executive Clarity',
    description: 'Get instant, actionable insights into project health, team performance, and business impact—all in one elegant dashboard.',
    bullets: [
      'Live executive dashboards',
      'AI-powered reporting',
      'Customizable KPIs',
    ],
    icon: <BarChart3 className="h-10 w-10 text-primary" />, // right
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80',
    imageAlt: 'Executive dashboard with real-time analytics and KPIs',
  },
  {
    title: 'Enterprise-Grade Collaboration',
    description: 'Thrink unifies teams, stakeholders, and data with secure, scalable collaboration tools built for the enterprise.',
    bullets: [
      'Role-based access',
      'Stakeholder engagement',
      'Secure document sharing',
    ],
    icon: <Users className="h-10 w-10 text-primary" />, // left
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
    imageAlt: 'Enterprise collaboration platform with team coordination',
  },
  {
    title: 'Outcome-Driven Leadership',
    description: 'Empower leaders with the clarity and confidence to drive results, not just manage tasks.',
    bullets: [
      'Goal alignment',
      'Outcome tracking',
      'AI-powered recommendations',
    ],
    icon: <Target className="h-10 w-10 text-primary" />, // right
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80',
    imageAlt: 'Leadership dashboard with outcome tracking and goal alignment',
  },
];

const Features = () => {
  return (
    <section id="features" className="w-full py-24 px-4 md:px-0 bg-background relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-blue-400/10 rounded-full blur-3xl opacity-40 -translate-x-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-cyan-300/10 rounded-full blur-2xl opacity-30" />
      </div>
      <div className="max-w-7xl mx-auto space-y-20 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent" style={{fontFamily: 'Poppins, sans-serif'}}>AI-Powered Project Excellence</h2>
          <p className="text-muted-foreground text-xl leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
            From executives to project managers, Thrink delivers the insights and automation you need to drive exceptional results.
          </p>
        </div>
        <div className="flex flex-col gap-20">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className={`flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''} group`}
            >
              {/* Left: Text */}
              <div className="w-full md:w-1/2 flex flex-col items-start" style={{fontFamily: 'Inter, sans-serif'}}>
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>{feature.title}</h3>
                <p className="text-muted-foreground text-lg mb-6">{feature.description}</p>
                <ul className="space-y-3 mb-2">
                  {feature.bullets.map((b, i) => (
                    <li key={i} className="flex items-center gap-3 text-base text-foreground">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right: Visual/Mockup */}
              <div className="w-full md:w-1/2 flex items-center justify-center">
                <div className="relative w-full max-w-md h-[260px] md:h-[320px] flex items-center justify-center rounded-2xl bg-white/5 shadow-lg border border-primary/10 backdrop-blur-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                  {/* Feature image or GIF */}
                  <img src={feature.image} alt={feature.imageAlt} className="h-full w-full object-cover opacity-90" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Keyframes for subtle motion */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>
    </section>
  );
};

export default Features;
