
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X, CircleDot, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('features');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Set active page based on current route hash for landing page
    if (location.pathname === '/' && location.hash) {
      const section = location.hash.substring(1);
      setActivePage(section);
    } else {
      setActivePage('features');
    }
  }, [location]);
  
  const handleNavClick = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePage(page);
    const element = document.getElementById(page);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isLandingPage = location.pathname === '/';

  // Only show header on landing page for unauthenticated users
  if (!isLandingPage || user) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 pt-8 px-4">
      <header className="w-full max-w-7xl mx-auto py-3 px-6 md:px-8 flex items-center justify-between">
        <div className="p-3">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-3 rounded-2xl text-muted-foreground hover:text-foreground"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
          <div className="rounded-full px-1 py-1 backdrop-blur-md bg-background/80 border border-border shadow-lg">
            <ToggleGroup type="single" value={activePage} onValueChange={(value) => value && setActivePage(value)}>
              <ToggleGroupItem 
                value="features"
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === 'features' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={handleNavClick('features')}
              >
                <CircleDot size={16} className="inline-block mr-1.5" /> Features
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="pricing" 
                className={cn(
                  "px-4 py-2 rounded-full transition-colors relative",
                  activePage === 'pricing' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                onClick={handleNavClick('pricing')}
              >
                <DollarSign size={16} className="inline-block mr-1.5" /> Pricing
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </nav>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md py-4 px-6 border border-border rounded-2xl shadow-lg z-50">
            <div className="flex flex-col gap-4">
              <a 
                href="#features" 
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === 'features' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={handleNavClick('features')}
              >
                <CircleDot size={16} className="inline-block mr-1.5" /> Features
              </a>
              <a 
                href="#pricing" 
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  activePage === 'pricing' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                onClick={handleNavClick('pricing')}
              >
                <DollarSign size={16} className="inline-block mr-1.5" /> Pricing
              </a>
              
              {/* Auth buttons for mobile */}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link to="/auth?tab=signin">
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button className="w-full">
                    Get Started
                  </Button>
                </Link>
              </div>
              
              {/* Theme toggle for mobile */}
              <div className="flex items-center justify-between px-3 py-2 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
        
        <div className="hidden md:flex items-center gap-4">
          {/* Auth buttons for desktop */}
          <div className="rounded-2xl flex gap-2">
            <Link to="/auth?tab=signin">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70">
                Get Started
              </Button>
            </Link>
          </div>
          
          {/* Theme toggle for desktop */}
          <ThemeToggle />
        </div>
      </header>
    </div>
  );
};

export default Header;
