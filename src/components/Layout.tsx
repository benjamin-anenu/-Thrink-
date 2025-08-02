
import React from 'react';
import Header from './Header';
import WorkspaceBanner from './WorkspaceBanner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <WorkspaceBanner />
      <main className="pt-32">
        {children}
      </main>
    </>
  );
};

export default Layout;
