import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingState } from '@/components/ui/loading-state'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react'

export default function EmailVerification() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token')
      const type = searchParams.get('type')
      
      if (!token || type !== 'email') {
        setVerificationStatus('error')
        return
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email'
        })

        if (error) {
          if (error.message.includes('expired')) {
            setVerificationStatus('expired')
          } else {
            setVerificationStatus('error')
          }
        } else {
          setVerificationStatus('success')
          toast({
            title: "Email verified successfully!",
            description: "You can now access all features of your account.",
          })
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard')
          }, 3000)
        }
      } catch (error) {
        console.error('Email verification error:', error)
        setVerificationStatus('error')
      }
    }

    verifyEmail()
  }, [searchParams, navigate, toast])

  const handleResendVerification = async () => {
    setIsResending(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email,
          options: {
            emailRedirectTo: `${window.location.origin}/verify-email`
          }
        })

        if (error) {
          toast({
            title: "Failed to resend verification",
            description: error.message,
            variant: "destructive"
          })
        } else {
          toast({
            title: "Verification email resent",
            description: "Please check your inbox for the new verification email.",
          })
        }
      }
    } catch (error) {
      console.error('Resend verification error:', error)
      toast({
        title: "Failed to resend verification",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsResending(false)
    }
  }

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <LoadingState />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <Card className="border-border/50 backdrop-blur-xl bg-card/95 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {verificationStatus === 'success' ? (
                <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              )}
            </div>
            
            <CardTitle className="text-2xl">
              {verificationStatus === 'success' && 'Email Verified!'}
              {verificationStatus === 'error' && 'Verification Failed'}
              {verificationStatus === 'expired' && 'Link Expired'}
            </CardTitle>
            
            <CardDescription>
              {verificationStatus === 'success' && 
                'Your email has been successfully verified. You will be redirected to your dashboard shortly.'
              }
              {verificationStatus === 'error' && 
                'We could not verify your email. The link may be invalid or corrupted.'
              }
              {verificationStatus === 'expired' && 
                'The verification link has expired. Please request a new verification email.'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {verificationStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Welcome to Planova! You now have full access to all features.
                </AlertDescription>
              </Alert>
            )}

            {(verificationStatus === 'error' || verificationStatus === 'expired') && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {verificationStatus === 'expired' 
                    ? 'The verification link has expired for security reasons.'
                    : 'The verification link is invalid or has already been used.'
                  }
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col space-y-2">
              {verificationStatus === 'success' && (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}

              {(verificationStatus === 'error' || verificationStatus === 'expired') && (
                <Button 
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {isResending ? 'Resending...' : 'Resend Verification Email'}
                </Button>
              )}

              <Button 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}