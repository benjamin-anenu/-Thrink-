
import React, { useEffect } from 'react';
import Header from './Header';
import WorkspaceBanner from './WorkspaceBanner';
import TinkAssistant from './TinkAssistant';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isSystemOwner, loading } = useAuth();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();

  // Remove automatic workspace clearing to allow system owners to access workspaces

  return (
    <>
      <Header />
      <WorkspaceBanner />
      <main className="pt-20 md:pt-24 mobile-container"> {/* Mobile-optimized spacing */}
        {children}
      </main>
      <TinkAssistant />
    </>
  );
};

export default Layout;
