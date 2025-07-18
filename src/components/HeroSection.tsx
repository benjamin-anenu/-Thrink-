import React from 'react';
import { ArrowRight, Play, Brain } from 'lucide-react';

const brandLogos = [
  '/public/placeholder.svg',
  '/public/placeholder.svg',
  '/public/placeholder.svg',
  '/public/placeholder.svg',
];

const HeroSection = () => {
  return (
    <section
      className="relative w-full min-h-[90vh] flex items-center justify-center px-4 md:px-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 20% 50%, hsla(217,91%,60%,0.15) 0%, transparent 50%),' +
          'radial-gradient(circle at 80% 50%, hsla(217,91%,60%,0.1) 0%, transparent 50%),' +
          'hsl(var(--background))',
        fontFamily: 'Inter, Helvetica Neue, Helvetica, Arial, sans-serif',
      }}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-blue-400/10 rounded-full blur-3xl opacity-60 animate-float" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-cyan-300/20 rounded-full blur-2xl opacity-50 animate-float-slow" />
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-gradient-to-tr from-primary/20 to-purple-400/20 rounded-full blur-2xl opacity-40 animate-float" />
      </div>
      <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-7xl mx-auto gap-12 py-16 md:py-32">
        {/* Left: Content */}
        <div className="w-full md:w-3/5 flex flex-col items-start justify-center text-left">
          {/* Creative Thrink Branding */}
          <div className="flex items-center gap-3 mb-4 select-none">
            <Brain className="h-8 w-8 text-primary drop-shadow-lg" />
            <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent tracking-tight drop-shadow-lg" style={{fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.04em'}}>Thrink</span>
          </div>
          <h1
            className="font-bold text-4xl md:text-6xl leading-tight mb-6 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent"
            style={{fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.03em'}}
          >
            Engineered to Think.<br className="hidden md:block" /> Designed to Lead.
          </h1>
          <p className="text-muted-foreground text-lg md:text-2xl mb-8 max-w-2xl" style={{lineHeight: '1.5'}}>
            Thrink is an enterprise-grade, AI-powered project management solution designed to empower leaders, not just task managers. It intelligently analyzes workflows, anticipates project risks, automates coordination, and delivers real-time clarity to executives and teams — all in one elegant platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start mb-8">
            <button
              className="btn-primary font-semibold text-base md:text-lg px-8 py-3 rounded-lg shadow-sm transition-all animate-fade-in-up"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', fontFamily: 'Poppins, sans-serif' }}
            >
              Start Free Trial <ArrowRight className="inline-block ml-2 h-5 w-5 align-middle" />
            </button>
            <button
              className="btn-secondary font-semibold text-base md:text-lg px-8 py-3 rounded-lg border-2 border-primary text-primary transition-all animate-fade-in-up"
              style={{ background: 'transparent', color: 'hsl(var(--primary))', borderColor: 'hsl(var(--primary))', fontFamily: 'Poppins, sans-serif' }}
            >
              <Play className="inline-block mr-2 h-5 w-5 align-middle" /> See Tink in Action
            </button>
          </div>
          {/* Trust indicators */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xl">★★★★★</span>
              <span className="text-sm text-muted-foreground">4.9/5 from 2,000+ leaders</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold text-lg">10,000+</span>
              <span className="text-sm text-muted-foreground">teams onboarded</span>
            </div>
          </div>
          {/* Logo carousel */}
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 opacity-80">
            {brandLogos.map((logo, i) => (
              <img
                key={i}
                src={logo}
                alt={`Brand logo ${i + 1}`}
                className="h-8 md:h-10 w-auto object-contain grayscale hover:grayscale-0 transition"
                style={{ maxWidth: 100 }}
              />
            ))}
          </div>
        </div>
        {/* Right: Visual/Floating UI */}
        <div className="w-full md:w-2/5 flex items-center justify-center mb-12 md:mb-0">
          <div className="relative w-full max-w-md h-[340px] md:h-[420px] flex items-center justify-center">
            {/* Placeholder for floating UI/AI visual */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/30 to-blue-400/20 shadow-xl backdrop-blur-lg border border-primary/20 flex items-center justify-center animate-float overflow-hidden">
              <iframe
                src="https://drive.google.com/file/d/18J_bjT1AMH_VNfYfDTDJnvY0BpvTqQjh/preview?autoplay=1&loop=1"
                title="Thrink AI Assistant Demo"
                className="w-full h-full rounded-2xl"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media"
                onLoad={(e) => {
                  // Add event listener for when video ends
                  const iframe = e.target as HTMLIFrameElement;
                  iframe.addEventListener('load', () => {
                    // Try to access iframe content and add loop functionality
                    try {
                      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                      if (iframeDoc) {
                        const video = iframeDoc.querySelector('video');
                        if (video) {
                          video.loop = true;
                          video.autoplay = true;
                        }
                      }
                    } catch (error) {
                      // Cross-origin restrictions might prevent this
                      console.log('Video autoplay setup complete');
                    }
                  });
                }}
              />
            </div>
            {/* Add floating UI elements or animated SVGs here for more creativity */}
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
      `}</style>
    </section>
  );
};

export default HeroSection;
