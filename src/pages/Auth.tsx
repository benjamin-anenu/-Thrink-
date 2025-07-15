import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingState } from '@/components/ui/loading-state'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Github, CheckCircle, AlertCircle } from 'lucide-react'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function Auth() {
  const { user, loading, signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'signin')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')

  // Form states
  const [signInForm, setSignInForm] = useState({ email: '', password: '' })
  const [signUpForm, setSignUpForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    acceptTerms: false,
  })
  const [resetForm, setResetForm] = useState({ email: '' })

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const returnTo = searchParams.get('returnTo') || '/dashboard'
      navigate(returnTo)
    }
  }, [user, loading, navigate, searchParams])

  if (loading) {
    return <LoadingState />
  }

  const validateForm = (schema: z.ZodSchema, data: any) => {
    try {
      schema.parse(data)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(signInSchema, signInForm)) return

    setIsSubmitting(true)
    const { error } = await signIn(signInForm.email, signInForm.password)
    setIsSubmitting(false)

    if (!error) {
      const returnTo = searchParams.get('returnTo') || '/dashboard'
      navigate(returnTo)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(signUpSchema, signUpForm)) return

    setIsSubmitting(true)
    const { error } = await signUp(signUpForm.email, signUpForm.password, signUpForm.fullName)
    setIsSubmitting(false)

    if (!error) {
      setSuccessMessage('Check your email to verify your account before signing in.')
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account.",
      })
      setActiveTab('signin')
      setSignInForm({ email: signUpForm.email, password: '' })
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm(resetPasswordSchema, resetForm)) return

    setIsSubmitting(true)
    const { error } = await resetPassword(resetForm.email)
    setIsSubmitting(false)

    if (!error) {
      setSuccessMessage('Password reset email sent! Check your inbox.')
      toast({
        title: "Reset email sent!",
        description: "Check your email for password reset instructions.",
      })
    }
  }

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setIsSubmitting(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      
      if (error) {
        setErrors({ general: error.message })
      }
    } catch (error) {
      console.error(`${provider} auth error:`, error)
      setErrors({ general: `Failed to sign in with ${provider}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>

        <Card className="border-border/50 backdrop-blur-xl bg-card/95 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-center bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Authentication
            </CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign-in method
            </CardDescription>
            {successMessage && (
              <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="reset">Reset</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signInForm.email}
                        onChange={(e) => setSignInForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.email && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.email}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={signInForm.password}
                        onChange={(e) => setSignInForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.password}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signUpForm.fullName}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, fullName: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.fullName && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.fullName}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpForm.email}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.email && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.email}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        value={signUpForm.password}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.password}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={signUpForm.confirmPassword}
                        onChange={(e) => setSignUpForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.confirmPassword}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="accept-terms"
                      checked={signUpForm.acceptTerms}
                      onCheckedChange={(checked) => 
                        setSignUpForm(prev => ({ ...prev, acceptTerms: !!checked }))
                      }
                    />
                    <Label htmlFor="accept-terms" className="text-sm">
                      I accept the{' '}
                      <Button variant="link" className="p-0 h-auto">
                        Terms of Service
                      </Button>{' '}
                      and{' '}
                      <Button variant="link" className="p-0 h-auto">
                        Privacy Policy
                      </Button>
                    </Label>
                  </div>
                  {errors.acceptTerms && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.acceptTerms}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset" className="space-y-4">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="Enter your email"
                        value={resetForm.email}
                        onChange={(e) => setResetForm(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                    {errors.email && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.email}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending reset email...' : 'Reset Password'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <Separator className="my-4" />
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50"
                  onClick={() => handleSocialAuth('google')}
                  disabled={isSubmitting}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isSubmitting ? 'Connecting...' : 'Continue with Google'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50"
                  onClick={() => handleSocialAuth('github')}
                  disabled={isSubmitting}
                >
                  <Github className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Connecting...' : 'Continue with GitHub'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}