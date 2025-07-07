
import React from 'react';
import { Bot, ChevronRight } from 'lucide-react';

interface HeroBadgeProps {
  hoveredElement: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const HeroBadge: React.FC<HeroBadgeProps> = ({ hoveredElement, onMouseEnter, onMouseLeave }) => {
  return (
    <div className="flex items-center gap-4">
      <span 
        className="inline-flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-full glass-card text-primary cursor-pointer transform transition-all duration-400 hover:scale-105 hover:shadow-glow border border-primary/20"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
        <Bot className={`h-4 w-4 ${hoveredElement === 'badge' ? 'animate-spin' : ''}`} />
        Enterprise AI Project Intelligence
        <ChevronRight className={`h-4 w-4 ${hoveredElement === 'badge' ? 'translate-x-1' : ''} transition-transform`} />
      </span>
    </div>
  );
};

export default HeroBadge;
