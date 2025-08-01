
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LogOut, 
  User, 
  Settings, 
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Building2,
  Brain
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import Logo from './Logo';
import WorkspaceSelector from './WorkspaceSelector';
import { cn } from '@/lib/utils';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await signOut();
      if (error) {
        toast.error('Failed to sign out');
      } else {
        navigate('/');
        toast.success('Signed out successfully');
      }
    } catch (error) {
      toast.error('An error occurred while signing out');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isAuthPage = location.pathname === '/auth';
  const isLandingPage = location.pathname === '/';

  const navigationLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/resources', label: 'Resources', icon: Users },
    { href: '/stakeholders', label: 'Stakeholders', icon: User },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/workspaces', label: 'Workspaces', icon: Building2 },
    { href: '/ai-hub', label: 'AI Hub', icon: Brain },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to={user ? '/dashboard' : '/'} className="flex items-center">
            <Logo />
          </Link>
          
          {user && !isAuthPage && !isLandingPage && (
            <>
              <WorkspaceSelector />
              
              <nav className="hidden lg:flex items-center gap-1">
                {navigationLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.href;
                  
                  return (
                    <Link key={link.href} to={link.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "gap-2 text-sm font-medium transition-colors",
                          isActive 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon size={16} />
                        {link.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.user_metadata?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/workspaces" className="cursor-pointer">
                    <Building2 className="mr-2 h-4 w-4" />
                    Workspaces
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !isAuthPage && (
              <div className="flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
