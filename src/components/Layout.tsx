
import React from 'react';
import Header from './Header';
import WorkspaceBanner from './WorkspaceBanner';
import TinkAssistant from './TinkAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <WorkspaceBanner />
      {/* 
        Consistent spacing calculation:
        - Header: 64px (h-16)
        - WorkspaceBanner: ~40px (py-2 + content height)
        - Gap: 16px (pt-4)
        - Total: ~120px (pt-[120px] equivalent to pt-30)
      */}
      <main className="pt-28 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <TinkAssistant />
    </>
  );
};

export default Layout;
