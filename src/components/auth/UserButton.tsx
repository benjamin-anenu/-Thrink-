
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SignOutConfirmDialog } from './SignOutConfirmDialog'
import { 
  User, 
  Settings, 
  LogOut,
  HelpCircle
} from 'lucide-react'

export function UserButton() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [showSignOutDialog, setShowSignOutDialog] = useState(false)

  if (!user) return null

  const handleSignOut = async () => {
    setIsSigningOut(true)
    const { error } = await signOut()
    
    if (!error) {
      localStorage.removeItem('workspace-preferences')
      sessionStorage.clear()
      setShowSignOutDialog(false)
      navigate('/')
    }
    setIsSigningOut(false)
  }

  const handleSignOutClick = () => {
    setShowSignOutDialog(true)
  }

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => navigate('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => navigate('/help')}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-destructive focus:text-destructive"
          onClick={handleSignOutClick}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <SignOutConfirmDialog
        open={showSignOutDialog}
        onOpenChange={setShowSignOutDialog}
        onConfirm={handleSignOut}
        isLoading={isSigningOut}
      />
    </DropdownMenu>
  )
}
