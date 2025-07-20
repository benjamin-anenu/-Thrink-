
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Settings, User, LogOut, Trash2, Home, FolderOpen, BarChart3, Users, Menu } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WorkspaceSelector from './WorkspaceSelector';
import { ThemeToggle } from './ui/theme-toggle';
import InAppNotifications from './InAppNotifications';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleRecycleBin = () => {
    navigate('/recycle-bin');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = (email: string) => {
    return email.split('@')[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">PM</span>
            </div>
            <h1 className="text-xl font-bold hidden sm:block">Project Management</h1>
          </Link>
          
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link to="/projects">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                Projects
              </Button>
            </Link>
            <Link to="/analytics">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Button>
            </Link>
            <Link to="/stakeholders">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Stakeholders
              </Button>
            </Link>
          </nav>
        </div>
        
        {/* Right side - Workspace, Notifications, Theme, Profile */}
        <div className="flex items-center space-x-3">
          {/* Workspace Selector */}
          <WorkspaceSelector />
          
          {/* Notifications */}
          <InAppNotifications />
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Recycle Bin */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRecycleBin}
            title="Recycle Bin"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt="Profile" />
                  <AvatarFallback>
                    {user?.email ? getUserInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.user_metadata?.full_name || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
