import React, { useState, useEffect, useRef } from 'react';
import TinkAssistant from './TinkAssistant';
import AIBackgroundEffects from './hero/AIBackgroundEffects';
import HeroBadge from './hero/HeroBadge';
import HeroHeading from './hero/HeroHeading';
import HeroCTAButtons from './hero/HeroCTAButtons';
import HeroFeaturePills from './hero/HeroFeaturePills';
import HeroTrustIndicators from './hero/HeroTrustIndicators';
import HeroDashboard from './hero/HeroDashboard';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

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
                <HeroCTAButtons 
                  hoveredElement={hoveredElement}
                  setHoveredElement={setHoveredElement}
                />
                
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
