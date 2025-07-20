
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { useDepartments, Department } from '@/hooks/useDepartments';
import { toast } from 'sonner';

export const DepartmentManager = () => {
  const { departments, loading, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const [newDepartments, setNewDepartments] = useState<Array<{ name: string; description: string }>>([{ name: '', description: '' }]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description: string }>({ name: '', description: '' });

  const addNewDepartmentField = () => {
    setNewDepartments([...newDepartments, { name: '', description: '' }]);
  };

  const removeNewDepartmentField = (index: number) => {
    if (newDepartments.length > 1) {
      setNewDepartments(newDepartments.filter((_, i) => i !== index));
    }
  };

  const updateNewDepartment = (index: number, field: string, value: string) => {
    const updated = [...newDepartments];
    updated[index] = { ...updated[index], [field]: value };
    setNewDepartments(updated);
  };

  const handleSaveAll = async () => {
    try {
      const validDepartments = newDepartments.filter(dept => dept.name.trim());
      
      for (const dept of validDepartments) {
        await createDepartment({
          name: dept.name.trim(),
          description: dept.description.trim() || undefined
        });
      }
      
      setNewDepartments([{ name: '', description: '' }]);
    } catch (error) {
      // Error already handled in hook
    }
  };

  const startEdit = (department: Department) => {
    setEditingId(department.id);
    setEditForm({
      name: department.name,
      description: department.description || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  const saveEdit = async () => {
    if (editingId && editForm.name.trim()) {
      try {
        await updateDepartment(editingId, {
          name: editForm.name.trim(),
          description: editForm.description.trim() || undefined
        });
        setEditingId(null);
        setEditForm({ name: '', description: '' });
      } catch (error) {
        // Error already handled in hook
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      await deleteDepartment(id);
    }
  };

  if (loading) {
    return <div>Loading departments...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Departments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {newDepartments.map((dept, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-4">
                <Label>Name</Label>
                <Input
                  value={dept.name}
                  onChange={(e) => updateNewDepartment(index, 'name', e.target.value)}
                  placeholder="Department name"
                />
              </div>
              <div className="col-span-6">
                <Label>Description</Label>
                <Input
                  value={dept.description}
                  onChange={(e) => updateNewDepartment(index, 'description', e.target.value)}
                  placeholder="Department description (optional)"
                />
              </div>
              <div className="col-span-2 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewDepartmentField}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {newDepartments.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeNewDepartmentField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button onClick={handleSaveAll} className="w-full">
            Save All Departments
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Departments ({departments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {departments.map((department) => (
              <div key={department.id} className="flex items-center justify-between p-3 border rounded-lg">
                {editingId === department.id ? (
                  <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Department name"
                      />
                    </div>
                    <div className="col-span-6">
                      <Input
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Department description"
                      />
                    </div>
                    <div className="col-span-2 flex gap-2">
                      <Button size="sm" onClick={saveEdit}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="font-medium">{department.name}</div>
                      {department.description && (
                        <div className="text-sm text-muted-foreground">{department.description}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(department)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(department.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {departments.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No departments created yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
