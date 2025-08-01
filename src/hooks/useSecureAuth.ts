
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSecurity } from '@/components/security/SecurityProvider';
import { toast } from 'sonner';

export const useSecureAuth = () => {
  const { signIn, signUp, signOut, resetPassword, user, loading } = useAuth();
  const { secureLogin, validateInput } = useSecurity();

  const secureSignIn = useCallback(async (email: string, password: string) => {
    return await secureLogin(email, password, signIn);
  }, [secureLogin, signIn]);

  const secureSignUp = useCallback(async (email: string, password: string, fullName?: string) => {
    // Validate inputs
    const emailValidation = validateInput(email, 'email');
    const passwordValidation = validateInput(password, 'password');
    const nameValidation = fullName ? validateInput(fullName, 'text', 100) : { isValid: true, sanitized: '', errors: [] };

    if (!emailValidation.isValid || !passwordValidation.isValid || !nameValidation.isValid) {
      const errors = [...emailValidation.errors, ...passwordValidation.errors, ...nameValidation.errors];
      toast.error(errors[0]);
      return { error: new Error(errors[0]) };
    }

    return await signUp(
      emailValidation.sanitized,
      password, // Don't sanitize password, keep original
      nameValidation.sanitized || undefined
    );
  }, [signUp, validateInput]);

  const secureResetPassword = useCallback(async (email: string) => {
    const emailValidation = validateInput(email, 'email');
    
    if (!emailValidation.isValid) {
      toast.error(emailValidation.errors[0]);
      return { error: new Error(emailValidation.errors[0]) };
    }

    return await resetPassword(emailValidation.sanitized);
  }, [resetPassword, validateInput]);

  return {
    secureSignIn,
    secureSignUp,
    secureResetPassword,
    signOut,
    user,
    loading
  };
};
