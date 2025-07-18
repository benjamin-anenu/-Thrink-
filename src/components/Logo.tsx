
import React from 'react';
import { Brain } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 select-none">
      <Brain className="h-8 w-8 text-primary drop-shadow-lg" />
      <span className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent tracking-tight drop-shadow-lg" style={{fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.04em'}}>Thrink</span>
    </div>
  );
};

export default Logo;
