
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, ArrowRight, Network, Sparkles } from 'lucide-react';

interface HeroCTAButtonsProps {
  hoveredElement: string | null;
  setHoveredElement: (element: string | null) => void;
}

const HeroCTAButtons: React.FC<HeroCTAButtonsProps> = ({ hoveredElement, setHoveredElement }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6 pt-8">
      <Button 
        className="group btn-premium text-white text-lg h-16 px-10 rounded-2xl font-bold transform transition-all duration-300 hover:scale-105 shadow-elevated"
        onMouseEnter={() => setHoveredElement('cta1')}
        onMouseLeave={() => setHoveredElement(null)}
      >
        <Play className={`mr-3 h-6 w-6 ${hoveredElement === 'cta1' ? 'scale-110' : ''} transition-transform fill-current`} />
        Start AI Analysis
        <ArrowRight className={`ml-3 h-6 w-6 ${hoveredElement === 'cta1' ? 'translate-x-2' : ''} transition-transform`} />
      </Button>
      
      <Button 
        variant="outline" 
        className="group glass-card text-foreground hover:bg-primary/10 text-lg h-16 px-10 rounded-2xl font-bold border-primary/30 hover:border-primary/60 transition-all duration-300 transform hover:scale-105 shadow-elevated"
        onMouseEnter={() => setHoveredElement('cta2')}
        onMouseLeave={() => setHoveredElement(null)}
      >
        <Network className={`mr-3 h-6 w-6 ${hoveredElement === 'cta2' ? 'animate-spin' : ''} transition-transform`} />
        Watch Live Demo
        <Sparkles className={`ml-3 h-6 w-6 ${hoveredElement === 'cta2' ? 'animate-pulse' : ''}`} />
      </Button>
    </div>
  );
};

export default HeroCTAButtons;
