
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
      <main className="pt-20">
        {children}
      </main>
      <TinkAssistant />
    </>
  );
};

export default Layout;
