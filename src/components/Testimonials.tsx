
import React, { useState } from 'react';

const testimonials = [
  {
    quote: "Thrink’s AI insights have transformed how I lead my team. Tink proactively flags risks and opportunities, so I can focus on strategy, not micromanagement.",
    author: "Sarah Chen",
    position: "CTO at TechFlow",
    companyLogo: '/public/placeholder.svg',
    avatar: '/public/placeholder.svg',
    rating: 5,
  },
  {
    quote: "We’ve reduced project delays by 30% since adopting Thrink. The executive dashboards give me real-time clarity I never had before.",
    author: "Marcus Rodriguez",
    position: "Head of Engineering at DevCorp",
    companyLogo: '/public/placeholder.svg',
    avatar: '/public/placeholder.svg',
    rating: 5,
  },
  {
    quote: "Tink’s automation has freed up hours every week. Our teams are more aligned, and our clients notice the difference.",
    author: "Emily Watson",
    position: "Project Director at InnovateLab",
    companyLogo: '/public/placeholder.svg',
    avatar: '/public/placeholder.svg',
    rating: 5,
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  const next = () => {
    setDirection(1);
    setActive((active + 1) % testimonials.length);
  };
  const prev = () => {
    setDirection(-1);
    setActive((active - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="w-full py-24 px-4 md:px-0 bg-background relative overflow-hidden">
      {/* Parallax/floating background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="neural-grid opacity-10 animate-parallax" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-float-slow" />
      </div>
      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent" style={{fontFamily: 'Poppins, sans-serif'}}>What Leaders Say About Thrink</h2>
          <p className="text-muted-foreground text-xl leading-relaxed" style={{fontFamily: 'Inter, sans-serif'}}>
            Real-world impact from executives and teams using Thrink and Tink.
          </p>
        </div>
        {/* Carousel */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-full max-w-2xl mx-auto h-[420px] flex items-center justify-center">
            {testimonials.map((t, i) => {
              // Only render active, previous, and next for animation
              const isActive = i === active;
              const isPrev = i === (active - 1 + testimonials.length) % testimonials.length;
              const isNext = i === (active + 1) % testimonials.length;
              return (
                <div
                  key={i}
                  className={`testimonial-card absolute left-0 right-0 mx-auto bg-white/5 rounded-2xl p-10 shadow-lg border border-primary/10 backdrop-blur-lg flex flex-col items-center text-center transition-all duration-700
                    ${isActive ? 'z-20 scale-105 opacity-100 animate-fade-in-up shadow-xl animate-float' : 'z-10 scale-90 opacity-0 pointer-events-none'}
                    ${isPrev ? 'translate-x-[-60%] opacity-40' : ''}
                    ${isNext ? 'translate-x-[60%] opacity-40' : ''}
                  `}
                  style={{
                    transform: isActive
                      ? 'translateX(0) scale(1.05)'
                      : isPrev
                      ? 'translateX(-60%) scale(0.9)'
                      : isNext
                      ? 'translateX(60%) scale(0.9)'
                      : 'scale(0.9)',
                    transition: 'all 0.7s cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4 animate-fade-in-up">
                    {[...Array(t.rating)].map((_, j) => (
                      <span key={j} className="text-yellow-400 text-xl">★</span>
                    ))}
                  </div>
                  <p className="testimonial-text italic text-lg md:text-xl mb-8 text-foreground/90 leading-relaxed animate-fade-in-up" style={{fontFamily: 'Inter, sans-serif'}}>
                    “{t.quote}”
                  </p>
                  <div className="flex items-center gap-4 mb-4 animate-fade-in-up">
                    <img src={t.avatar} alt="User avatar" className="h-16 w-16 rounded-full object-cover border-4 border-primary/20 animate-avatar-float" />
                    <div className="text-left">
                      <h4 className="font-semibold text-foreground text-lg" style={{fontFamily: 'Poppins, sans-serif'}}>{t.author}</h4>
                      <p className="text-sm text-muted-foreground" style={{fontFamily: 'Inter, sans-serif'}}>{t.position}</p>
                    </div>
                    <img src={t.companyLogo} alt="Company logo" className="h-10 w-10 object-contain ml-4 animate-logo-bounce" />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <button onClick={prev} className="btn-ghost px-4 py-2 rounded-full text-primary hover:bg-primary/10 transition scale-110 hover:scale-125 shadow-md">‹</button>
                    <button onClick={next} className="btn-ghost px-4 py-2 rounded-full text-primary hover:bg-primary/10 transition scale-110 hover:scale-125 shadow-md">›</button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Carousel indicators */}
          <div className="flex gap-2 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${i === active ? 'bg-primary scale-125 shadow-lg' : 'bg-muted-foreground/30'}`}
                onClick={() => setActive(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                style={{ transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)' }}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Keyframes for subtle motion */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        .animate-float { animation: float 7s ease-in-out infinite; }
        .animate-float-slow { animation: float 14s ease-in-out infinite; }
        @keyframes parallax {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-parallax { animation: parallax 20s linear infinite; }
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-avatar-float { animation: avatarFloat 4s ease-in-out infinite; }
        @keyframes logoBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-logo-bounce { animation: logoBounce 3s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default Testimonials;
