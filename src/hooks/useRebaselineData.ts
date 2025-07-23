import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

export interface TaskDeadlineReminder {
  id: string;
  task_id: string;
  task_name: string;
  resource_id: string;
  resource_name: string;
  resource_email: string;
  project_id: string;
  project_name: string;
  workspace_id: string;
  deadline: string;
  reminder_type: 'week_before' | 'three_days' | 'day_before' | 'day_of' | 'overdue';
  sent: boolean;
  sent_at?: string;
  response_required: boolean;
  response_received?: boolean;
  response_data?: {
    onTrack: boolean;
    confidence: number;
    needsRebaseline: boolean;
    reasons?: string[];
    newEstimate?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface RebaselineRequest {
  id: string;
  task_id: string;
  resource_id: string;
  workspace_id: string;
  original_deadline: string;
  proposed_deadline: string;
  reasons: string[];
  impact?: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useRebaselineData = () => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<TaskDeadlineReminder[]>([]);
  const [rebaselineRequests, setRebaselineRequests] = useState<RebaselineRequest[]>([]);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchRebaselineData();
    }
  }, [currentWorkspace?.id]);

  const fetchRebaselineData = async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);

      // Fetch task deadline reminders
      const { data: remindersData, error: remindersError } = await supabase
        .from('task_deadline_reminders')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('deadline', { ascending: true });

      if (remindersError) throw remindersError;

      // Fetch rebaseline requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('rebaseline_requests')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('submitted_at', { ascending: false });

      if (requestsError) throw requestsError;

      setReminders(remindersData as TaskDeadlineReminder[] || []);
      setRebaselineRequests(requestsData as RebaselineRequest[] || []);
    } catch (error) {
      console.error('Error fetching rebaseline data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch rebaseline data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReminder = async (reminderData: Omit<TaskDeadlineReminder, 'id' | 'created_at' | 'updated_at'>) => {
    if (!currentWorkspace?.id) return null;

    try {
      const { data, error } = await supabase
        .from('task_deadline_reminders')
        .insert([{ ...reminderData, workspace_id: currentWorkspace.id }])
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => [...prev, data as TaskDeadlineReminder]);
      return data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      toast({
        title: "Error",
        description: "Failed to create reminder",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateReminderResponse = async (
    reminderId: string, 
    responseData: TaskDeadlineReminder['response_data']
  ) => {
    try {
      const { data, error } = await supabase
        .from('task_deadline_reminders')
        .update({
          response_received: true,
          response_data: responseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;

      setReminders(prev => prev.map(r => r.id === reminderId ? data as TaskDeadlineReminder : r));

      // If needs rebaseline, create rebaseline request
      if (responseData?.needsRebaseline && responseData.newEstimate) {
        const reminder = reminders.find(r => r.id === reminderId);
        if (reminder) {
          await createRebaselineRequest({
            task_id: reminder.task_id,
            resource_id: reminder.resource_id,
            original_deadline: reminder.deadline,
            proposed_deadline: responseData.newEstimate,
            reasons: responseData.reasons || ['Schedule adjustment needed'],
            impact: `Confidence level: ${responseData.confidence}%`
          });
        }
      }

      return data;
    } catch (error) {
      console.error('Error updating reminder response:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder response",
        variant: "destructive"
      });
      return null;
    }
  };

  const createRebaselineRequest = async (requestData: Omit<RebaselineRequest, 'id' | 'workspace_id' | 'status' | 'submitted_at' | 'created_at' | 'updated_at'>) => {
    if (!currentWorkspace?.id) return null;

    try {
      const { data, error } = await supabase
        .from('rebaseline_requests')
        .insert([{
          ...requestData,
          workspace_id: currentWorkspace.id,
          status: 'pending' as const,
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      setRebaselineRequests(prev => [data as RebaselineRequest, ...prev]);
      toast({
        title: "Success",
        description: "Rebaseline request submitted successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating rebaseline request:', error);
      toast({
        title: "Error",
        description: "Failed to create rebaseline request",
        variant: "destructive"
      });
      return null;
    }
  };

  const reviewRebaselineRequest = async (
    requestId: string, 
    decision: 'approved' | 'rejected',
    reviewNotes?: string,
    reviewedBy?: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('rebaseline_requests')
        .update({
          status: decision,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy,
          review_notes: reviewNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;

      setRebaselineRequests(prev => prev.map(r => r.id === requestId ? data as RebaselineRequest : r));

      // If approved, update the task deadline in project_tasks table
      if (decision === 'approved') {
        const { error: taskError } = await supabase
          .from('project_tasks')
          .update({
            end_date: data.proposed_deadline,
            baseline_end_date: data.original_deadline,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.task_id);

        if (taskError) {
          console.error('Error updating task deadline:', taskError);
          toast({
            title: "Warning",
            description: "Request approved but failed to update task deadline",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Success",
        description: `Rebaseline request ${decision} successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error reviewing rebaseline request:', error);
      toast({
        title: "Error",
        description: "Failed to review rebaseline request",
        variant: "destructive"
      });
      return null;
    }
  };

  const processScheduledReminders = async () => {
    if (!currentWorkspace?.id) return;

    try {
      // Get all project tasks that need reminders
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select(`
          id,
          name,
          end_date,
          assignee_id,
          project_id,
          projects!inner(
            id,
            name,
            workspace_id
          )
        `)
        .eq('projects.workspace_id', currentWorkspace.id)
        .not('end_date', 'is', null)
        .not('assignee_id', 'is', null);

      if (tasksError) throw tasksError;

      const today = new Date();
      const remindersToCreate: Omit<TaskDeadlineReminder, 'id' | 'created_at' | 'updated_at'>[] = [];

      for (const task of tasks || []) {
        const deadline = new Date(task.end_date);
        const daysDiff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        let reminderType: TaskDeadlineReminder['reminder_type'] | null = null;

        if (daysDiff === 7) reminderType = 'week_before';
        else if (daysDiff === 3) reminderType = 'three_days';
        else if (daysDiff === 1) reminderType = 'day_before';
        else if (daysDiff === 0) reminderType = 'day_of';
        else if (daysDiff < 0) reminderType = 'overdue';

        if (reminderType) {
          // Check if reminder already exists
          const existingReminder = reminders.find(r => 
            r.task_id === task.id && 
            r.reminder_type === reminderType
          );

          if (!existingReminder) {
            remindersToCreate.push({
              task_id: task.id,
              task_name: task.name,
              resource_id: task.assignee_id || '',
              resource_name: 'Team Member', // Would need to join with resources table
              resource_email: 'member@company.com', // Would need to join with resources table
              project_id: task.project_id || '',
              project_name: task.projects?.name || 'Unknown Project',
              workspace_id: currentWorkspace.id,
              deadline: task.end_date,
              reminder_type: reminderType,
              sent: false,
              response_required: daysDiff <= 3
            });
          }
        }
      }

      if (remindersToCreate.length > 0) {
        const { data, error } = await supabase
          .from('task_deadline_reminders')
          .insert(remindersToCreate)
          .select();

        if (error) throw error;

        setReminders(prev => [...prev, ...(data as TaskDeadlineReminder[] || [])]);
        
        toast({
          title: "Success",
          description: `Created ${remindersToCreate.length} reminder(s)`,
        });
      }

    } catch (error) {
      console.error('Error processing scheduled reminders:', error);
      toast({
        title: "Error",
        description: "Failed to process scheduled reminders",
        variant: "destructive"
      });
    }
  };

  return {
    loading,
    reminders,
    rebaselineRequests,
    createReminder,
    updateReminderResponse,
    createRebaselineRequest,
    reviewRebaselineRequest,
    processScheduledReminders,
    refetch: fetchRebaselineData
  };
};