
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Bell,
  CreditCard,
  HelpCircle
} from 'lucide-react'

export function UserButton() {
  const { user, profile, signOut, loading } = useAuth()
  const { getEffectiveRole } = usePermissions()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Show loading skeleton while auth is loading
  if (loading) {
    return <Skeleton className="h-10 w-10 rounded-full" />
  }

  // Don't render if no user
  if (!user) return null

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    setIsSigningOut(false)
    navigate('/')
  }

  const getInitials = (name?: string) => {
    if (!name) return user.email?.charAt(0).toUpperCase() || 'U'
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'member': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'viewer': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  // Use profile data if available, fallback to user email
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  const displayEmail = user.email || ''
  const role = getEffectiveRole()
  const { isOwner, isSystemAdmin } = usePermissions()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={profile?.avatar_url || ''} 
              alt={displayName} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium leading-none">
                {displayName}
              </p>
              {role && (
                <Badge variant="secondary" className={getRoleColor(role)}>
                  {role}
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {displayEmail}
            </p>
            {profile?.company_name && (
              <p className="text-xs leading-none text-muted-foreground">
                {profile.company_name}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => navigate('/settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => navigate('/notifications')}
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>

        {(isOwner() || isSystemAdmin()) && (
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => navigate('/admin')}
          >
            <Shield className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => navigate('/billing')}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
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
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
