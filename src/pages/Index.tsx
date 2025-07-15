
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Features from '@/components/Features';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import Footer from '@/components/Footer';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.https://hkitnfvgxkozfqfpjrcz.supabase.co;
const supabaseAnonKey = import.meta.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhraXRuZnZneGtvemZxZnBqcmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjY1NjMsImV4cCI6MjA2Nzk0MjU2M30.yyN_AlhORpSj9VFrOH5zNMRiZeHId72jlDvCwPNm4_Y;

export const supabase = createClient(https://hkitnfvgxkozfqfpjrcz.supabase.co, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhraXRuZnZneGtvemZxZnBqcmN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNjY1NjMsImV4cCI6MjA2Nzk0MjU2M30.yyN_AlhORpSj9VFrOH5zNMRiZeHId72jlDvCwPNm4_Y);

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // or a loading spinner if you prefer
  if (user) return <Navigate to="/dashboard" replace />;

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
