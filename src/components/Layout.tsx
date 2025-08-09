
import React from 'react';
import Header from './Header';
import WorkspaceBanner from './WorkspaceBanner';
import TinkAssistant from './TinkAssistant';
import { EnterpriseOwnerNav } from './navigation/EnterpriseOwnerNav';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <WorkspaceBanner />
      <div className="px-4 pt-2">
        <EnterpriseOwnerNav />
      </div>
      <main className="pt-20 md:pt-24 mobile-container"> {/* Mobile-optimized spacing */}
        {children}
      </main>
      <TinkAssistant />
    </>
  );
};

export default Layout;
