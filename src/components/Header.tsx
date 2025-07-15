
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import { UserButton } from './auth/UserButton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const routeState = useMemo(() => ({
    isLandingPage: location.pathname === '/',
    isAuthPage: location.pathname === '/auth',
    shouldShowButtons: location.pathname === '/' && !user && !loading
  }), [location.pathname, user, loading]);

  const handleNavClick = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (page === 'features' || page === 'pricing') {
      const element = document.getElementById(page);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        {/* Desktop navigation for landing page */}
        {routeState.isLandingPage && (
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleNavClick('features')}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={handleNavClick('pricing')}
            >
              Pricing
            </a>
          </nav>
        )}
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b shadow-lg">
            <div className="px-6 py-4 space-y-4">
              {routeState.isLandingPage ? (
                <>
                  <a 
                    href="#features" 
                    className="block py-2 text-muted-foreground hover:text-foreground"
                    onClick={handleNavClick('features')}
                  >
                    Features
                  </a>
                  <a 
                    href="#pricing" 
                    className="block py-2 text-muted-foreground hover:text-foreground"
                    onClick={handleNavClick('pricing')}
                  >
                    Pricing
                  </a>
                  {routeState.shouldShowButtons && (
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <Link to="/auth?tab=signin">
                        <Button variant="ghost" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/auth?tab=signup">
                        <Button className="w-full">
                          Get Started
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
        
        {/* Desktop auth buttons */}
        {routeState.shouldShowButtons && (
          <div className="hidden md:flex items-center gap-4">
            <Link to="/auth?tab=signin">
              <Button variant="ghost">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button>
                Get Started
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        )}
        
        {/* User menu and theme toggle for authenticated users */}
        {user && (
          <div className="hidden md:flex items-center gap-4">
            <UserButton />
            <ThemeToggle />
          </div>
        )}
        
        {/* Theme toggle only for non-landing pages */}
        {!routeState.isLandingPage && !user && (
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
