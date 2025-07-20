
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { useSkills, Skill } from '@/hooks/useSkills';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SkillManager = () => {
  const { skills, loading } = useSkills();
  const [newSkills, setNewSkills] = useState<Array<{ name: string }>>([{ name: '' }]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string }>({ name: '' });
  const [localSkills, setLocalSkills] = useState<Skill[]>([]);

  React.useEffect(() => {
    setLocalSkills(skills);
  }, [skills]);

  const addNewSkillField = () => {
    setNewSkills([...newSkills, { name: '' }]);
  };

  const removeNewSkillField = (index: number) => {
    if (newSkills.length > 1) {
      setNewSkills(newSkills.filter((_, i) => i !== index));
    }
  };

  const updateNewSkill = (index: number, value: string) => {
    const updated = [...newSkills];
    updated[index] = { name: value };
    setNewSkills(updated);
  };

  const handleSaveAll = async () => {
    try {
      const validSkills = newSkills.filter(skill => skill.name.trim());
      
      for (const skill of validSkills) {
        const { data, error } = await supabase
          .from('skills')
          .insert([{ name: skill.name.trim() }])
          .select()
          .single();
        
        if (error) throw error;
        setLocalSkills(prev => [...prev, data]);
      }
      
      setNewSkills([{ name: '' }]);
      toast.success('Skills created successfully');
    } catch (error) {
      console.error('Error creating skills:', error);
      toast.error('Failed to create skills');
    }
  };

  const startEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setEditForm({ name: skill.name });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '' });
  };

  const saveEdit = async () => {
    if (editingId && editForm.name.trim()) {
      try {
        const { error } = await supabase
          .from('skills')
          .update({ name: editForm.name.trim() })
          .eq('id', editingId);
        
        if (error) throw error;
        
        setLocalSkills(prev => 
          prev.map(skill => 
            skill.id === editingId ? { ...skill, name: editForm.name.trim() } : skill
          )
        );
        
        setEditingId(null);
        setEditForm({ name: '' });
        toast.success('Skill updated successfully');
      } catch (error) {
        console.error('Error updating skill:', error);
        toast.error('Failed to update skill');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this skill?')) {
      try {
        const { error } = await supabase
          .from('skills')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        setLocalSkills(prev => prev.filter(skill => skill.id !== id));
        toast.success('Skill deleted successfully');
      } catch (error) {
        console.error('Error deleting skill:', error);
        toast.error('Failed to delete skill');
      }
    }
  };

  if (loading) {
    return <div>Loading skills...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {newSkills.map((skill, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>Skill Name</Label>
                <Input
                  value={skill.name}
                  onChange={(e) => updateNewSkill(index, e.target.value)}
                  placeholder="Enter skill name"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewSkillField}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {newSkills.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeNewSkillField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button onClick={handleSaveAll} className="w-full">
            Save All Skills
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Skills ({localSkills.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {localSkills.map((skill) => (
              <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                {editingId === skill.id ? (
                  <div className="flex-1 flex gap-4 items-center">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ name: e.target.value })}
                      placeholder="Skill name"
                      className="flex-1"
                    />
                    <div className="flex gap-2">
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
                      <div className="font-medium">{skill.name}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(skill)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(skill.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {localSkills.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No skills created yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
