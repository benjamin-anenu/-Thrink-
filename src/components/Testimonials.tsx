
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "AI-powered project management transformed our delivery process. We reduced project delays by 40% and improved team efficiency significantly.",
      author: "Sarah Chen",
      position: "CTO at TechFlow"
    },
    {
      quote: "The predictive analytics helped us identify risks before they became critical issues. Our project success rate has never been higher.",
      author: "Marcus Rodriguez", 
      position: "Head of Engineering at DevCorp"
    }
  ];
  
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-muted/30">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Trusted by Teams Worldwide
            </span>
          </h2>
          <p className="text-muted-foreground text-xl leading-relaxed">
            See how AI-powered project management transforms development teams.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-6 rounded-lg border bg-card"
            >
              <p className="text-lg mb-6 italic leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div>
                <h4 className="font-semibold">{testimonial.author}</h4>
                <p className="text-sm text-muted-foreground">{testimonial.position}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
