
import React from 'react';
import { Brain } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 select-none">
      <Brain className="h-6 w-6 md:h-8 md:w-8 text-primary drop-shadow-lg" />
      <span className="text-lg md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent tracking-tight drop-shadow-lg" style={{fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.04em'}}>Thrink</span>
    </div>
  );
};

export default Logo;
