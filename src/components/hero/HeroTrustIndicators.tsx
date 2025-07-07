
import React from 'react';

const HeroTrustIndicators: React.FC = () => {
  return (
    <div className="pt-8 space-y-4">
      <p className="text-sm text-muted-foreground font-medium">Trusted by leading enterprises worldwide</p>
      <div className="flex items-center gap-8 opacity-60">
        <div className="text-lg font-bold tracking-wide">MICROSOFT</div>
        <div className="text-lg font-bold tracking-wide">GOOGLE</div>
        <div className="text-lg font-bold tracking-wide">AMAZON</div>
        <div className="text-lg font-bold tracking-wide">META</div>
      </div>
    </div>
  );
};

export default HeroTrustIndicators;
