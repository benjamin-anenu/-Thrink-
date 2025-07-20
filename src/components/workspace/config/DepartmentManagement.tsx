import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  description?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!currentWorkspace?.id) {
        setDepartments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .eq('workspace_id', currentWorkspace.id)
          .order('name');

        if (error) {
          console.error('Error fetching departments:', error);
          toast.error('Failed to load departments.');
          return;
        }

        // Map the data to include workspace_id
        const mappedData: Department[] = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          workspace_id: currentWorkspace.id,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));

        setDepartments(mappedData);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [currentWorkspace?.id]);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Department name is required.');
      return;
    }

    if (!currentWorkspace?.id) {
      toast.error('Workspace ID is required.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('departments')
        .insert([{ ...formData, workspace_id: currentWorkspace.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating department:', error);
        toast.error('Failed to create department.');
        return;
      }

      const newDepartment: Department = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        workspace_id: currentWorkspace.id,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setDepartments([...departments, newDepartment]);
      setFormData({ name: '', description: '' });
      toast.success('Department created successfully!');
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department.');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const { data, error } = await supabase
        .from('departments')
        .update(formData)
        .eq('id', editingId)
        .select()
        .single();

      if (error) {
        console.error('Error updating department:', error);
        toast.error('Failed to update department.');
        return;
      }

      const updatedDepartment: Department = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        workspace_id: currentWorkspace?.id || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setDepartments(departments.map(d => d.id === editingId ? updatedDepartment : d));
      setEditingId(null);
      setFormData({ name: '', description: '' });
      toast.success('Department updated successfully!');
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting department:', error);
        toast.error('Failed to delete department.');
        return;
      }

      setDepartments(departments.filter(d => d.id !== id));
      toast.success('Department deleted successfully!');
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department.');
    }
  };

  const startEditing = (department: Department) => {
    setEditingId(department.id);
    setFormData({ name: department.name, description: department.description || '' });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
        {editingId ? (
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        ) : (
          <Button onClick={handleCreate}>Add Department</Button>
        )}
        {loading ? (
          <div>Loading departments...</div>
        ) : (
          <div className="space-y-2">
            {departments.map(department => (
              <div key={department.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-semibold">{department.name}</div>
                  {department.description && <div className="text-sm text-muted-foreground">{department.description}</div>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEditing(department)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(department.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DepartmentManagement;
