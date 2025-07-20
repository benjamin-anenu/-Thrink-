
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (department: Omit<Department, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([department])
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Department created successfully');
      loadDepartments();
      return data;
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department');
      throw error;
    }
  };

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const { error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Department updated successfully');
      loadDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department');
      throw error;
    }
  };

  const deleteDepartment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Department deleted successfully');
      loadDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
      throw error;
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  return {
    departments,
    loading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refreshDepartments: loadDepartments
  };
};
