import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface Recipient {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  type: 'workspace_member' | 'resource' | 'stakeholder';
}

export const useRecipients = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  const fetchRecipients = async () => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch workspace members
      const { data: workspaceMembers, error: wmError } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          role,
          profiles!inner (
            id,
            full_name,
            email
          )
        `)
        .eq('workspace_id', currentWorkspace.id)
        .eq('status', 'active');

      if (wmError) throw wmError;

      // Fetch resources
      const { data: resources, error: resourcesError } = await supabase
        .from('resources')
        .select('id, name, email, role, department')
        .eq('workspace_id', currentWorkspace.id);

      if (resourcesError) throw resourcesError;

      // Fetch stakeholders
      const { data: stakeholders, error: stakeholdersError } = await supabase
        .from('stakeholders')
        .select('id, name, email, role, department')
        .eq('workspace_id', currentWorkspace.id);

      if (stakeholdersError) throw stakeholdersError;

      // Fetch departments
      const { data: departmentsData, error: deptsError } = await supabase
        .from('departments')
        .select('name')
        .eq('workspace_id', currentWorkspace.id)
        .eq('is_active', true);

      if (deptsError) throw deptsError;

      // Transform workspace members
      const transformedMembers: Recipient[] = (workspaceMembers || [])
        .filter(wm => wm.profiles)
        .map(wm => ({
          id: wm.user_id,
          name: (wm.profiles as any)?.full_name || 'Unknown User',
          email: (wm.profiles as any)?.email || '',
          department: 'General',
          role: wm.role,
          type: 'workspace_member' as const
        }));

      // Transform resources
      const transformedResources: Recipient[] = (resources || []).map(resource => ({
        id: resource.id,
        name: resource.name,
        email: resource.email || '',
        department: resource.department || 'General',
        role: resource.role || 'Team Member',
        type: 'resource' as const
      }));

      // Transform stakeholders
      const transformedStakeholders: Recipient[] = (stakeholders || []).map(stakeholder => ({
        id: stakeholder.id,
        name: stakeholder.name,
        email: stakeholder.email || '',
        department: stakeholder.department || 'General',
        role: stakeholder.role || 'Stakeholder',
        type: 'stakeholder' as const
      }));

      const allRecipients = [
        ...transformedMembers,
        ...transformedResources,
        ...transformedStakeholders
      ];

      const uniqueDepartments = [
        ...new Set([
          ...(departmentsData || []).map(d => d.name),
          ...allRecipients.map(r => r.department)
        ])
      ].filter(Boolean);

      setRecipients(allRecipients);
      setDepartments(uniqueDepartments);
    } catch (err) {
      console.error('Error fetching recipients:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recipients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, [currentWorkspace?.id]);

  const getRecipientsByDepartment = (department: string) => {
    return recipients.filter(r => r.department === department);
  };

  const getRecipientsByType = (type: Recipient['type']) => {
    return recipients.filter(r => r.type === type);
  };

  return {
    recipients,
    departments,
    loading,
    error,
    getRecipientsByDepartment,
    getRecipientsByType,
    refetch: fetchRecipients
  };
};