
import { useState, useEffect, useCallback } from 'react';
import { enhancedSecurity } from '@/services/EnhancedSecurityService';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface SessionInfo {
  id: string;
  createdAt: string;
  expiresAt: string;
  deviceInfo: any;
  isActive: boolean;
}

export const useSecureSession = () => {
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();

  const loadActiveSessions = useCallback(async () => {
    try {
      setLoading(true);
      const sessions = await enhancedSecurity.getActiveSessions();
      setActiveSessions(sessions);
    } catch (error) {
      console.error('Failed to load active sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSecureSession = useCallback(async () => {
    if (!currentWorkspace) return;
    
    await enhancedSecurity.createSecureSession(currentWorkspace.id, {
      userAgent: navigator.userAgent
    });
    
    await loadActiveSessions();
  }, [currentWorkspace, loadActiveSessions]);

  const terminateSession = useCallback(async (sessionId: string) => {
    const success = await enhancedSecurity.terminateSession(sessionId);
    if (success) {
      await loadActiveSessions();
    }
    return success;
  }, [loadActiveSessions]);

  const terminateAllOtherSessions = useCallback(async () => {
    const success = await enhancedSecurity.terminateAllOtherSessions();
    if (success) {
      await loadActiveSessions();
    }
    return success;
  }, [loadActiveSessions]);

  useEffect(() => {
    loadActiveSessions();
  }, [loadActiveSessions]);

  return {
    activeSessions,
    loading,
    createSecureSession,
    terminateSession,
    terminateAllOtherSessions,
    refreshSessions: loadActiveSessions
  };
};
