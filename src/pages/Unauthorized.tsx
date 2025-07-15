import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Unauthorized() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>
            You don't have the required permissions to access this page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {user ? (
              <p>Your current account doesn't have sufficient privileges for this resource.</p>
            ) : (
              <p>Please sign in to access this page.</p>
            )}
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            
            <Button 
              onClick={() => navigate(user ? '/dashboard' : '/')}
              className="w-full"
            >
              <Home className="mr-2 h-4 w-4" />
              {user ? 'Go to Dashboard' : 'Go to Home'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}