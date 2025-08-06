
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
      <main className="pt-24 md:pt-28 mobile-container"> {/* Mobile-optimized spacing */}
        {children}
      </main>
      <TinkAssistant />
    </>
  );
};

export default Layout;
