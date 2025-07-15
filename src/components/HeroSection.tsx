import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import HeroDashboard from './hero/HeroDashboard';

const HeroSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth?tab=signup');
    }
  };

  return (
    <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center bg-background px-6 md:px-12 py-20">
      {/* Main Content */}
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          AI-Powered Project Management, Simplified
        </h1>
        <p className="text-muted-foreground text-xl leading-relaxed">
          Stay ahead of deadlines, optimize your team, and deliver projects with confidence—powered by intelligent automation and predictive insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {user ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="group"
            // Add your demo handler here if needed
          >
            <Play className="mr-2 h-4 w-4" />
            Watch Demo
          </Button>
        </div>
        {/* Add Sign In link for unauthenticated users */}
        {!user && (
          <div className="mt-4 text-center">
            <span className="text-muted-foreground">Already have an account? </span>
            <a
              href="/auth?tab=signin"
              className="text-primary font-medium hover:underline ml-1"
            >
              Sign In
            </a>
          </div>
        )}
      </div>
      {/* Illustration / Dashboard Screenshot */}
      <div className="mt-12 flex justify-center">
        <div className="w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden">
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
