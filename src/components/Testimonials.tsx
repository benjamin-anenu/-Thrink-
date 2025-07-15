
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "Milo AI reduced our project delivery time by 40% and eliminated 90% of deadline surprises. The predictive insights are game-changing for our development team.",
      author: "Sarah Chen",
      position: "CTO at TechFlow",
      avatar: "bg-gradient-to-br from-blue-400 to-purple-400"
    },
    {
      quote: "The AI risk prediction caught three major issues before they became critical. We've never had smoother project execution and better team coordination.",
      author: "Marcus Rodriguez",
      position: "Head of Engineering at DevCorp",
      avatar: "bg-gradient-to-br from-green-400 to-blue-400"
    },
    {
      quote: "Resource allocation used to be a nightmare. Now Milo AI automatically optimizes our team workload and we're delivering 30% more projects with the same team size.",
      author: "Emily Watson",
      position: "Project Director at InnovateLab",
      avatar: "bg-gradient-to-br from-purple-400 to-pink-400"
    }
  ];
  
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="neural-grid opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
      </div>
      
      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Trusted by innovative teams worldwide
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            See how AI-powered project management transforms development teams and accelerates delivery
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-8 rounded-2xl glass-card hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
            >
              <div className="mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary inline-block mr-1 text-lg">★</span>
                ))}
              </div>
              <p className="text-lg mb-8 text-foreground/90 italic leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl ${testimonial.avatar} group-hover:scale-110 transition-transform duration-300`}></div>
                <div>
                  <h4 className="font-semibold text-foreground text-lg">{testimonial.author}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-card text-muted-foreground">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-background"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-400 border-2 border-background"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-background"></div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 border-2 border-background flex items-center justify-center text-xs font-medium text-white">+50</div>
            </div>
            <span className="ml-2">Join 500+ teams already using Milo AI</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
