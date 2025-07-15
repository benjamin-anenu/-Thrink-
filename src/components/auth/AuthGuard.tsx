
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingState } from '@/components/ui/loading-state'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return fallback || <LoadingState />
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}
