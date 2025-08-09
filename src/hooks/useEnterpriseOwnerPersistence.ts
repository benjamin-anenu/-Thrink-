import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface EnterpriseOwnerPreferences {
  preferSystemView: boolean;
  lastWorkspaceId: string | null;
  timestamp: number;
}

export function useEnterpriseOwnerPersistence() {
  const { user, isSystemOwner, role, loading } = useAuth();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();

  // Save enterprise owner preferences
  const savePreferences = (prefs: Partial<EnterpriseOwnerPreferences>) => {
    if (!user) return;
    
    try {
      const existing = getPreferences();
      const updated = {
        ...existing,
        ...prefs,
        timestamp: Date.now()
      };
      localStorage.setItem(`thrink_owner_prefs_${user.id}`, JSON.stringify(updated));
      console.log('[EnterpriseOwner] Saved preferences:', updated);
    } catch (error) {
      console.error('[EnterpriseOwner] Error saving preferences:', error);
    }
  };

  // Load enterprise owner preferences
  const getPreferences = (): EnterpriseOwnerPreferences => {
    if (!user) return { preferSystemView: true, lastWorkspaceId: null, timestamp: 0 };
    
    try {
      const stored = localStorage.getItem(`thrink_owner_prefs_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        // Cache expires after 24 hours
        const isExpired = Date.now() - data.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired) {
          return data;
        }
      }
    } catch (error) {
      console.error('[EnterpriseOwner] Error loading preferences:', error);
    }
    
    return { preferSystemView: true, lastWorkspaceId: null, timestamp: 0 };
  };

  // Handle enterprise owner navigation logic
  useEffect(() => {
    if (loading || !user) return;

    const isEnterpriseOwner = isSystemOwner || role === 'owner' || role === 'admin';
    
    if (isEnterpriseOwner) {
      console.log('[EnterpriseOwner] Enterprise owner detected, checking navigation...');
      
      const prefs = getPreferences();
      const isOnAdmin = location.pathname === '/admin';
      
      // Ensure enterprise owners have system view preference set
      if (prefs.timestamp === 0) {
        console.log('[EnterpriseOwner] First time enterprise owner, setting system view preference');
        savePreferences({ preferSystemView: true });
      }
      
      // Clear workspace for enterprise owners on admin route
      if (isOnAdmin && currentWorkspace) {
        console.log('[EnterpriseOwner] Clearing workspace for admin view');
        setCurrentWorkspace(null);
      }
    }
  }, [user, isSystemOwner, role, loading, currentWorkspace, location.pathname, setCurrentWorkspace]);

  // Toggle between system view and workspace view
  const toggleSystemView = useCallback(() => {
    if (!user || !(isSystemOwner || role === 'owner' || role === 'admin')) return;
    
    const prefs = getPreferences();
    const newPreferSystemView = !prefs.preferSystemView;
    
    console.log('[EnterpriseOwner] Toggling system view to:', newPreferSystemView);
    
    savePreferences({ 
      preferSystemView: newPreferSystemView,
      lastWorkspaceId: newPreferSystemView ? null : currentWorkspace?.id || null
    });

    if (newPreferSystemView) {
      // Switching to system view - navigate to admin and clear workspace
      console.log('[EnterpriseOwner] Switching to system view, navigating to admin');
      setCurrentWorkspace(null);
      navigate('/admin');
    } else {
      // Switching to workspace view - navigate to dashboard
      console.log('[EnterpriseOwner] Switching to workspace view, navigating to dashboard');
      navigate('/dashboard');
    }
  }, [user, isSystemOwner, role, currentWorkspace, navigate, setCurrentWorkspace]);

  return {
    preferences: getPreferences(),
    savePreferences,
    toggleSystemView,
    isEnterpriseOwner: isSystemOwner || role === 'owner' || role === 'admin'
  };
}