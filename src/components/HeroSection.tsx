import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import TinkAssistant from './TinkAssistant';
import AIBackgroundEffects from './hero/AIBackgroundEffects';
import HeroBadge from './hero/HeroBadge';
import HeroHeading from './hero/HeroHeading';
import HeroFeaturePills from './hero/HeroFeaturePills';
import HeroTrustIndicators from './hero/HeroTrustIndicators';
import HeroDashboard from './hero/HeroDashboard';

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth?tab=signup');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section ref={heroRef} className="relative w-full min-h-screen overflow-hidden bg-background">
      {/* Enhanced AI Processing Background with Parallax */}
      <AIBackgroundEffects mousePosition={mousePosition} scrollY={scrollY} />

      {/* Main Content - Premium Split Screen */}
      <div className="relative z-10 px-6 md:px-12 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="hero-split">
            {/* Left Side - Enhanced Premium Content */}
            <div className={`space-y-10 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
              
              {/* Premium Badge */}
              <HeroBadge 
                hoveredElement={hoveredElement}
                onMouseEnter={() => setHoveredElement('badge')}
                onMouseLeave={() => setHoveredElement(null)}
              />
              
              <div className="space-y-8">
                <HeroHeading />
                
                {/* Premium CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
                  <Button 
                    size="lg" 
                    onClick={handleGetStarted} 
                    className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onMouseEnter={() => setHoveredElement('cta-primary')}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    {user ? 'Go to Dashboard' : 'Get Started Free'}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="group"
                    onMouseEnter={() => setHoveredElement('cta-demo')}
                    onMouseLeave={() => setHoveredElement(null)}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Watch Demo
                  </Button>
                </div>
                
                {/* Premium Feature Pills */}
                <HeroFeaturePills />

                {/* Trust Indicators */}
                <HeroTrustIndicators />
              </div>
            </div>
            
            {/* Right Side - Premium AI Dashboard */}
            <div className={`transition-all duration-1200 delay-300 transform ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              <HeroDashboard />
            </div>
          </div>
        </div>
      </div>

      <TinkAssistant />
    </section>
  );
};

export default HeroSection;
