
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/ui/loading-state';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const Index = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return <LoadingState />;
  }

  // If user is authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Only show landing page to unauthenticated users
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
