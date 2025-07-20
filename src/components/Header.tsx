
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { UserButton } from '@/components/auth/UserButton';
import { GlobalConfigModal } from '@/components/GlobalConfigModal';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo';
import { Home, BarChart3, Users, FolderOpen, Building } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only show global config for authenticated users (we'll add role check later)
  const showGlobalConfig = !!user;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center space-x-2">
              <Logo />
            </Link>
            
            {user && (
              <nav className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/projects')}
                  className="flex items-center gap-2"
                >
                  <FolderOpen className="h-4 w-4" />
                  Projects
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/resources')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Resources
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/stakeholders')}
                  className="flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  Stakeholders
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/analytics')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Button>
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3">
            {showGlobalConfig && <GlobalConfigModal />}
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
