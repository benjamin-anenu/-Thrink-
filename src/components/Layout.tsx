
import React from 'react';
import Header from './Header';
import TinkAssistant from './TinkAssistant';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen">
        {children}
      </main>
      {/* Single TinkAssistant instance for the entire app */}
      <TinkAssistant />
    </>
  );
};

export default Layout;
