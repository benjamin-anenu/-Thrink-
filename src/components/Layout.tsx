
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
      <main className="pt-28 md:pt-32 mobile-container"> {/* Updated spacing for header + workspace banner */}
        {children}
      </main>
      <TinkAssistant />
    </>
  );
};

export default Layout;
