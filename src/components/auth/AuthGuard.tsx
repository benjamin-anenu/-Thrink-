
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    console.log('[AuthGuard] Auth state:', { 
      user: !!user, 
      session: !!session, 
      loading, 
      hasChecked,
      userId: user?.id,
      sessionId: session?.access_token ? 'present' : 'missing'
    });
    
    if (loading) return; // Still loading, wait
    
    setHasChecked(true);
    
    if (!user || !session) {
      console.log('[AuthGuard] No authenticated session found, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, session, loading, navigate, hasChecked]);

  // Show loading while auth is loading OR we haven't checked yet
  if (loading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Authenticating...</span>
        </div>
      </div>
    );
  }

  // If we've checked and there's no authenticated user, show nothing (redirect is happening)
  if (!user || !session) {
    return null;
  }

  return <>{children}</>;
}
