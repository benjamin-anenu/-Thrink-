import { useEffect } from 'react';
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
      const isOnDashboard = location.pathname === '/' || location.pathname === '/dashboard';
      
      // For enterprise owners on dashboard route
      if (isOnDashboard) {
        // If they prefer system view and currently have a workspace selected, clear it
        if (prefs.preferSystemView && currentWorkspace) {
          console.log('[EnterpriseOwner] Clearing workspace for system view preference');
          setCurrentWorkspace(null);
          savePreferences({ lastWorkspaceId: currentWorkspace.id });
        }
        
        // If they don't prefer system view but no workspace is selected, restore last workspace
        else if (!prefs.preferSystemView && !currentWorkspace && prefs.lastWorkspaceId) {
          console.log('[EnterpriseOwner] Would restore workspace:', prefs.lastWorkspaceId);
          // Note: We can't directly set workspace here as it needs to be found in workspace list
          // This will be handled by WorkspaceContext when workspaces are loaded
        }
      }
    }
  }, [user, isSystemOwner, role, loading, currentWorkspace, location.pathname]);

  // Toggle between system view and workspace view
  const toggleSystemView = () => {
    if (!user || !(isSystemOwner || role === 'owner' || role === 'admin')) return;
    
    const prefs = getPreferences();
    const newPreferSystemView = !prefs.preferSystemView;
    
    console.log('[EnterpriseOwner] Toggling system view:', newPreferSystemView);
    
    if (newPreferSystemView) {
      // Switch to system view
      if (currentWorkspace) {
        savePreferences({ 
          preferSystemView: true, 
          lastWorkspaceId: currentWorkspace.id 
        });
        setCurrentWorkspace(null);
      } else {
        savePreferences({ preferSystemView: true });
      }
    } else {
      // Switch to workspace view
      savePreferences({ preferSystemView: false });
      // If we have a last workspace, it will be restored by the effect above
    }
  };

  return {
    preferences: getPreferences(),
    savePreferences,
    toggleSystemView,
    isEnterpriseOwner: isSystemOwner || role === 'owner' || role === 'admin'
  };
}