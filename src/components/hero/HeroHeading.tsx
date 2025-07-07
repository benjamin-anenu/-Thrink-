
import React from 'react';

const HeroHeading: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-none">
        <span className="block bg-gradient-to-r from-foreground via-primary to-blue-400 bg-clip-text text-transparent hover:from-primary hover:via-purple-400 hover:to-cyan-400 transition-all duration-700 cursor-default">
          The Future of
        </span>
        <span className="block bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent hover:from-cyan-400 hover:via-primary hover:to-purple-400 transition-all duration-700 cursor-default mt-2">
          Project Intelligence
        </span>
      </h1>
      
      <p className="text-2xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
        Harness the power of <span className="text-gradient-primary font-bold">advanced AI</span> to transform 
        your project management. Predict risks, optimize resources, and automate complex workflows 
        with enterprise-grade precision.
      </p>
    </div>
  );
};

export default HeroHeading;
