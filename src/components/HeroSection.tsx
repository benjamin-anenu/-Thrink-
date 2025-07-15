
import React, { useState } from 'react';
import { ChevronRight, Sparkles, Zap, Target, Users, BarChart3, ArrowRight } from 'lucide-react';
import TinkAssistant from './TinkAssistant';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import HeroBadge from './hero/HeroBadge';
import HeroHeading from './hero/HeroHeading';
import HeroFeaturePills from './hero/HeroFeaturePills';
import HeroCTAButtons from './hero/HeroCTAButtons';
import HeroTrustIndicators from './hero/HeroTrustIndicators';
import HeroDashboard from './hero/HeroDashboard';
import AIBackgroundEffects from './hero/AIBackgroundEffects';

const HeroSection = () => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Handle mouse movement for background effects
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle scroll for background effects
  React.useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* AI Background Effects */}
      <AIBackgroundEffects mousePosition={mousePosition} scrollY={scrollY} />
      
      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <HeroBadge 
              hoveredElement={hoveredElement}
              onMouseEnter={() => setHoveredElement('badge')}
              onMouseLeave={() => setHoveredElement(null)}
            />
            <HeroHeading />
            <HeroFeaturePills />
            <HeroCTAButtons 
              hoveredElement={hoveredElement}
              setHoveredElement={setHoveredElement}
            />
            <HeroTrustIndicators />
          </div>

          {/* Right Column - Dashboard Preview */}
          <div className="relative">
            <HeroDashboard />
          </div>
        </div>
      </div>
      
      {/* Tink Assistant positioned at bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <TinkAssistant />
      </div>
    </div>
  );
};

export default HeroSection;
