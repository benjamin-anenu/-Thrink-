
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Settings, User, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InAppNotifications from './InAppNotifications';

const Header = () => {
  const navigate = useNavigate();

  const handleRecycleBin = () => {
    navigate('/recycle-bin');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Project Management</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <InAppNotifications />
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRecycleBin}
            title="Recycle Bin"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
