import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import WorkspaceSelector from './WorkspaceSelector';
import { UserButton } from './auth/UserButton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X, CircleDot, LayoutDashboard, DollarSign, FolderOpen, Users, BarChart3, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Link, useLocation } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const Header = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [activePage, setActivePage] = useState('features');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Memoize route-based state calculations to prevent unnecessary re-renders
  const routeState = useMemo(() => {
    const isLandingPage = location.pathname === '/';
    const isAuthPage = location.pathname === '/auth';
    const shouldShowAuthButtons = isLandingPage && !loading && !user;
    
    return { isLandingPage, isAuthPage, shouldShowAuthButtons };
  }, [location.pathname, loading, user]);
  
  useEffect(() => {
    // Set active page based on current route
    const path = location.pathname;
    if (path === '/dashboard') setActivePage('dashboard');
    else if (path === '/projects') setActivePage('projects');
    else if (path === '/resources') setActivePage('resources');
    else if (path === '/stakeholders') setActivePage('stakeholders');
    else if (path === '/analytics') setActivePage('analytics');
    else if (path === '/' && location.hash) {
      const section = location.hash.substring(1);
      setActivePage(section);
    } else {
      setActivePage('features');
    }
  }, [location.pathname, location.hash]);
  
  const handleNavClick = (page: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setActivePage(page);
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

  const { isLandingPage, isAuthPage, shouldShowAuthButtons } = routeState;

  return (
    <div className="sticky top-0 z-50 pt-8 px-4">
      <header className="w-full max-w-7xl mx-auto py-3 px-6 md:px-8 flex items-center justify-between">
        <div className="p-3">
          <Link to="/">
            <Logo />
          </Link>
        </div>
        
        {/* Show current workspace prominently on dashboard */}
        {!isLandingPage && !isAuthPage && user && currentWorkspace && (
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
            <span className="text-sm text-muted-foreground">Workspace:</span>
            <span className="font-semibold text-foreground">{currentWorkspace.name}</span>
          </div>
        )}
        
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
              {isLandingPage ? (
                <>
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
                </>
              ) : user && (
                <>
                  <ToggleGroupItem 
                    value="dashboard"
                    className={cn(
                      "px-4 py-2 rounded-full transition-colors relative",
                      activePage === 'dashboard' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                    asChild
                  >
                    <Link to="/dashboard">
                      <LayoutDashboard size={16} className="inline-block mr-1.5" /> Dashboard
                    </Link>
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="projects" 
                    className={cn(
                      "px-4 py-2 rounded-full transition-colors relative",
                      activePage === 'projects' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                    asChild
                  >
                    <Link to="/projects">
                      <FolderOpen size={16} className="inline-block mr-1.5" /> Projects
                    </Link>
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="resources" 
                    className={cn(
                      "px-4 py-2 rounded-full transition-colors relative",
                      activePage === 'resources' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                    asChild
                  >
                    <Link to="/resources">
                      <Users size={16} className="inline-block mr-1.5" /> Resources
                    </Link>
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="stakeholders" 
                    className={cn(
                      "px-4 py-2 rounded-full transition-colors relative",
                      activePage === 'stakeholders' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                    asChild
                  >
                    <Link to="/stakeholders">
                      <UserCheck size={16} className="inline-block mr-1.5" /> Stakeholders
                    </Link>
                  </ToggleGroupItem>
                  <ToggleGroupItem 
                    value="analytics" 
                    className={cn(
                      "px-4 py-2 rounded-full transition-colors relative",
                      activePage === 'analytics' ? 'text-accent-foreground bg-accent' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                    asChild
                  >
                    <Link to="/analytics">
                      <BarChart3 size={16} className="inline-block mr-1.5" /> Analytics
                    </Link>
                  </ToggleGroupItem>
                </>
              )}
            </ToggleGroup>
          </div>
        </nav>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-4 right-4 bg-background/95 backdrop-blur-md py-4 px-6 border border-border rounded-2xl shadow-lg z-50">
            <div className="flex flex-col gap-4">
              {/* Add workspace selector for mobile */}
              {!isLandingPage && !isAuthPage && user && (
                <div className="pb-2 border-b border-border">
                  <WorkspaceSelector />
                </div>
              )}
              
              {isLandingPage ? (
                <>
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
                </>
              ) : user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      activePage === 'dashboard' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} className="inline-block mr-1.5" /> Dashboard
                  </Link>
                  <Link 
                    to="/projects" 
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      activePage === 'projects' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FolderOpen size={16} className="inline-block mr-1.5" /> Projects
                  </Link>
                  <Link 
                    to="/resources" 
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      activePage === 'resources' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users size={16} className="inline-block mr-1.5" /> Resources
                  </Link>
                  <Link 
                    to="/stakeholders" 
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      activePage === 'stakeholders' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCheck size={16} className="inline-block mr-1.5" /> Stakeholders
                  </Link>
                  <Link 
                    to="/analytics" 
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      activePage === 'analytics' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BarChart3 size={16} className="inline-block mr-1.5" /> Analytics
                  </Link>
                </>
              )}
              
              {/* Auth buttons for mobile landing page */}
              {shouldShowAuthButtons && (
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
              )}
              
              {/* Add theme toggle for mobile */}
              <div className="flex items-center justify-between px-3 py-2 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
        
        <div className="hidden md:flex items-center gap-4">
          {/* Add workspace selector for desktop (only when authenticated) */}
          {!isLandingPage && !isAuthPage && user && <WorkspaceSelector />}
          
          {/* Auth buttons for desktop */}
          {shouldShowAuthButtons && (
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
          )}
          
          {user && <UserButton />}
          
          {/* Theme toggle for desktop */}
          <ThemeToggle />
        </div>
      </header>
    </div>
  );
};

export default Header;
