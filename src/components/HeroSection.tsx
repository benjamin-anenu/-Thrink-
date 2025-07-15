
import React from 'react';
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
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* AI Background Effects */}
      <AIBackgroundEffects />
      
      <div className="relative z-10 container mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <HeroBadge />
            <HeroHeading />
            <HeroFeaturePills />
            <HeroCTAButtons />
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
