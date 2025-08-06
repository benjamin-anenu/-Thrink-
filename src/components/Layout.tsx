
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
      <main className="pt-44 md:pt-48 mobile-container"> {/* Mobile-optimized spacing with workspace banner */}
        {children}
      </main>
      <TinkAssistant />
    </>
  );
};

export default Layout;
