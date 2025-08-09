
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import ProductShowcase from '@/components/ProductShowcase';
import IntegrationShowcase from '@/components/IntegrationShowcase';
import ValueProposition from '@/components/ValueProposition';
import ProcessSection from '@/components/ProcessSection';
import Testimonials from '@/components/Testimonials';
import TrustIndicators from '@/components/TrustIndicators';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';

const Index = () => {
  const { user, loading, isSystemOwner, permissionsContext } = useAuth();

  if (loading) return null;
  if (user) {
    return <Navigate to={isSystemOwner ? "/system/overview" : "/dashboard"} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Header />
      <main className="pt-20">
        <HeroSection />
        <Features />
        <ProductShowcase />
        <IntegrationShowcase />
        <ValueProposition />
        <ProcessSection />
        <TrustIndicators />
        <Testimonials />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
