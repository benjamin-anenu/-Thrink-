import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import WorkspaceSelector from './WorkspaceSelector';
import { UserButton } from './auth/UserButton';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X, CircleDot, LayoutDashboard, DollarSign, FolderOpen, Users, BarChart3, UserCheck, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Link, useLocation } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [activePage, setActivePage] = useState('features');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Set active page based on current route
    const path = location.pathname;
    if (path === '/dashboard') setActivePage('dashboard');
    else if (path === '/projects') setActivePage('projects');
    else if (path === '/resources') setActivePage('resources');
    else if (path === '/stakeholders') setActivePage('stakeholders');
    else if (path === '/analytics') setActivePage('analytics');
    else if (path === '/ai-hub') setActivePage('ai-hub');
    else if (path === '/' && location.hash) {
      const section = location.hash.substring(1);
      setActivePage(section);
    } else {
      setActivePage('features');
    }
  }, [location]);
  
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

  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="fixed top-0 w-full z-50 pt-4 px-4">
      <header className={cn(
        "w-full max-w-7xl mx-auto transition-all duration-300 rounded-2xl border",
        scrolled 
          ? "bg-card/80 backdrop-blur-xl border-border/50 shadow-lg py-3 px-6" 
          : "bg-card/60 backdrop-blur-md border-border/30 py-4 px-8"
      )}>
        <div className="flex items-center justify-between">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          
          {/* Current workspace for authenticated users */}
          {!isLandingPage && !isAuthPage && user && currentWorkspace && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
              <span className="text-sm text-muted-foreground">Workspace:</span>
              <span className="font-semibold text-foreground">{currentWorkspace.name}</span>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          {/* Desktop navigation - Center */}
          <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            <div className="bg-muted/30 backdrop-blur-md rounded-full px-1 py-1 border border-border/50">
              <ToggleGroup type="single" value={activePage} onValueChange={(value) => value && setActivePage(value)}>
                {isLandingPage ? (
                  <>
                    <ToggleGroupItem 
                      value="features"
                      className={cn(
                        "px-4 py-2 rounded-full transition-all relative text-sm font-medium",
                        activePage === 'features' 
                          ? 'text-primary-foreground bg-primary shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      onClick={handleNavClick('features')}
                    >
                      <CircleDot size={14} className="mr-2" /> Features
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="pricing" 
                      className={cn(
                        "px-4 py-2 rounded-full transition-all relative text-sm font-medium",
                        activePage === 'pricing' 
                          ? 'text-primary-foreground bg-primary shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      onClick={handleNavClick('pricing')}
                    >
                      <DollarSign size={14} className="mr-2" /> Pricing
                    </ToggleGroupItem>
                  </>
                ) : user && (
                  <>
                    <ToggleGroupItem 
                      value="dashboard"
                      className={cn(
                        "px-4 py-2 rounded-full transition-all relative text-sm font-medium",
                        activePage === 'dashboard' 
                          ? 'text-primary-foreground bg-primary shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      asChild
                    >
                      <Link to="/dashboard">
                        <LayoutDashboard size={14} className="mr-2" /> Dashboard
                      </Link>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="projects" 
                      className={cn(
                        "px-4 py-2 rounded-full transition-all relative text-sm font-medium",
                        activePage === 'projects' 
                          ? 'text-primary-foreground bg-primary shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      asChild
                    >
                      <Link to="/projects">
                        <FolderOpen size={14} className="mr-2" /> Projects
                      </Link>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="resources" 
                      className={cn(
                        "px-4 py-2 rounded-full transition-all relative text-sm font-medium",
                        activePage === 'resources' 
                          ? 'text-primary-foreground bg-primary shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      asChild
                    >
                      <Link to="/resources">
                        <Users size={14} className="mr-2" /> Resources
                      </Link>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="stakeholders" 
                      className={cn(
                        "px-4 py-2 rounded-full transition-all relative text-sm font-medium",
                        activePage === 'stakeholders' 
                          ? 'text-primary-foreground bg-primary shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      asChild
                    >
                      <Link to="/stakeholders">
                        <UserCheck size={14} className="mr-2" /> Stakeholders
                      </Link>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="analytics" 
                      className={cn(
                        "px-4 py-2 rounded-full transition-all relative text-sm font-medium",
                        activePage === 'analytics' 
                          ? 'text-primary-foreground bg-primary shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      asChild
                    >
                      <Link to="/analytics">
                        <BarChart3 size={14} className="mr-2" /> Analytics
                      </Link>
                    </ToggleGroupItem>
                    <ToggleGroupItem 
                      value="ai-hub" 
                      className={cn(
                        "px-4 py-2 rounded-full transition-all relative text-sm font-medium",
                        activePage === 'ai-hub' 
                          ? 'text-primary-foreground bg-primary shadow-sm' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      )}
                      asChild
                    >
                      <Link to="/ai-hub">
                        <Brain size={14} className="mr-2" /> AI Hub
                      </Link>
                    </ToggleGroupItem>
                  </>
                )}
              </ToggleGroup>
            </div>
          </nav>
          
          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            {!isLandingPage && !isAuthPage && user && <WorkspaceSelector />}
            
            {isLandingPage && !user && (
              <div className="flex gap-2">
                <Link to="/auth?tab=signin">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg transition-all">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
            
            {user && <UserButton />}
            <ThemeToggle />
          </div>
        </div>
        
        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-col gap-2">
              {!isLandingPage && !isAuthPage && user && (
                <div className="pb-2 border-b border-border/50 mb-2">
                  <WorkspaceSelector />
                </div>
              )}
              
              {isLandingPage ? (
                <>
                  <a 
                    href="#features" 
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors flex items-center",
                      activePage === 'features' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                    onClick={handleNavClick('features')}
                  >
                    <CircleDot size={16} className="mr-2" /> Features
                  </a>
                  <a 
                    href="#pricing" 
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors flex items-center",
                      activePage === 'pricing' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                    onClick={handleNavClick('pricing')}
                  >
                    <DollarSign size={16} className="mr-2" /> Pricing
                  </a>
                </>
              ) : user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors flex items-center",
                      activePage === 'dashboard' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={16} className="mr-2" /> Dashboard
                  </Link>
                  <Link 
                    to="/projects" 
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors flex items-center",
                      activePage === 'projects' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FolderOpen size={16} className="mr-2" /> Projects
                  </Link>
                  <Link 
                    to="/resources" 
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors flex items-center",
                      activePage === 'resources' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users size={16} className="mr-2" /> Resources
                  </Link>
                  <Link 
                    to="/stakeholders" 
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors flex items-center",
                      activePage === 'stakeholders' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCheck size={16} className="mr-2" /> Stakeholders
                  </Link>
                  <Link 
                    to="/analytics" 
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors flex items-center",
                      activePage === 'analytics' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BarChart3 size={16} className="mr-2" /> Analytics
                  </Link>
                  <Link 
                    to="/ai-hub" 
                    className={cn(
                      "px-3 py-2 text-sm rounded-lg transition-colors flex items-center",
                      activePage === 'ai-hub' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Brain size={16} className="mr-2" /> AI Hub
                  </Link>
                </>
              )}
              
              {isLandingPage && !user && (
                <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                  <Link to="/auth?tab=signin">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?tab=signup">
                    <Button className="w-full bg-gradient-to-r from-primary to-blue-600" onClick={() => setMobileMenuOpen(false)}>
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="flex items-center justify-between px-3 py-2 pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

export default Header;
