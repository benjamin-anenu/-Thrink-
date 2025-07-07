
import React from 'react';

const HeroFeaturePills: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-6 pt-8">
      <div className="flex items-center gap-3 cursor-pointer transform transition-all duration-300 hover:scale-105 px-4 py-2 rounded-full glass-card">
        <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse"></div>
        <span className="text-muted-foreground hover:text-emerald-400 transition-colors font-medium">Real-time Risk Prediction</span>
      </div>
      <div className="flex items-center gap-3 cursor-pointer transform transition-all duration-300 hover:scale-105 px-4 py-2 rounded-full glass-card">
        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse animation-delay-500"></div>
        <span className="text-muted-foreground hover:text-blue-400 transition-colors font-medium">Intelligent Automation</span>
      </div>
      <div className="flex items-center gap-3 cursor-pointer transform transition-all duration-300 hover:scale-105 px-4 py-2 rounded-full glass-card">
        <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse animation-delay-1000"></div>
        <span className="text-muted-foreground hover:text-purple-400 transition-colors font-medium">Predictive Analytics</span>
      </div>
    </div>
  );
};

export default HeroFeaturePills;
