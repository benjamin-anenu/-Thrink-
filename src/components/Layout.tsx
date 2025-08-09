
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
  const { user, isSystemOwner, role, loading } = useAuth();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();

  useEffect(() => {
    if (!user || loading) return;
    const isAdminLike = isSystemOwner || role === 'owner' || role === 'admin';
    if (isAdminLike && currentWorkspace) {
      console.log('[Layout] Clearing workspace for admin/system owner mode', { currentWorkspace });
      try {
        // Ensure system/admin users don't get stuck in a workspace context
        setCurrentWorkspace(null as any);
      } catch (e) {
        console.warn('[Layout] Failed to clear workspace', e);
      }
    }
  }, [user, loading, isSystemOwner, role, currentWorkspace, setCurrentWorkspace]);

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
