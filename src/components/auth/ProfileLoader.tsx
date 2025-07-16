import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProfileLoaderProps {
  children: React.ReactNode
}

export function ProfileLoader({ children }: ProfileLoaderProps) {
  const { user } = useAuth()
  const { profile, role, loading, error } = useProfile()

  // If no user, don't show the profile loader
  if (!user) {
    return <>{children}</>
  }

  // Show loading state for profile
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    )
  }

  // Show error state if profile loading failed
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-destructive">Failed to load profile</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  // Profile loaded or not required, show children
  return <>{children}</>
}