
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Logo from './Logo';
import UserButton from './auth/UserButton';
import WorkspaceSelector from './WorkspaceSelector';
import { cn } from '@/lib/utils';

const Header = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const location = useLocation();
  
  const isLandingPage = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth';
  
  // Navigation items for authenticated users
  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/resources', label: 'Resources' },
    { path: '/stakeholders', label: 'Stakeholders' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/ai-hub', label: 'AI Hub' },
    { path: '/workspaces', label: 'Workspaces' }
  ];

  // Define consistent header height
  const HEADER_HEIGHT = 'h-16'; // 64px consistent height
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 border-b border-border/40",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      HEADER_HEIGHT
    )}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Logo />
          
          {/* Workspace Selector - only show for authenticated users */}
          {user && !isLandingPage && !isAuthPage && (
            <div className="hidden md:block">
              <WorkspaceSelector />
            </div>
          )}
        </div>

        {/* Navigation - only for authenticated users */}
        {user && !isLandingPage && !isAuthPage && (
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <UserButton />
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-2">
                <Link 
                  to="/auth" 
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/auth" 
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
