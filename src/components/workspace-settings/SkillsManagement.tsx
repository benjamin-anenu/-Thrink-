import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Zap, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  workspace_id: string;
  created_at: string;
  updated_at: string;
}

const skillCategories = [
  'Technical',
  'Design',
  'Management',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Communication',
  'General'
];

const SkillsManagement = () => {
  const { currentWorkspace } = useWorkspace();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      fetchSkills();
    }
  }, [currentWorkspace]);

  const fetchSkills = async () => {
    if (!currentWorkspace) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .order('category')
        .order('name');

      if (error) throw error;
      setSkills((data || []) as Skill[]);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setFormData({
        name: skill.name,
        category: skill.category,
        description: skill.description || ''
      });
    } else {
      setEditingSkill(null);
      setFormData({ name: '', category: 'General', description: '' });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingSkill(null);
    setFormData({ name: '', category: 'General', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingSkill) {
        // Update existing skill
        const { error } = await supabase
          .from('skills')
          .update({
            name: formData.name.trim(),
            category: formData.category,
            description: formData.description.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingSkill.id);

        if (error) throw error;
        toast.success('Skill updated successfully');
      } else {
        // Create new skill
        const { error } = await supabase
          .from('skills')
          .insert({
            name: formData.name.trim(),
            category: formData.category,
            description: formData.description.trim() || null,
            workspace_id: currentWorkspace.id
          });

        if (error) throw error;
        toast.success('Skill created successfully');
      }

      await fetchSkills();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving skill:', error);
      toast.error('Failed to save skill');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (skill: Skill) => {
    if (!confirm(`Are you sure you want to delete "${skill.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skill.id);

      if (error) throw error;

      toast.success('Skill deleted successfully');
      await fetchSkills();
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Failed to delete skill');
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const skillsByCategory = skillCategories.reduce((acc, category) => {
    acc[category] = filteredSkills.filter(skill => skill.category === category);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Skills Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage skills and competencies for your workspace
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {skillCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {skills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No skills yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first skill to track team competencies.
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </CardContent>
          </Card>
        ) : (
          skillCategories.map((category) => {
            const categorySkills = skillsByCategory[category];
            if (categorySkills.length === 0 && selectedCategory !== 'All') return null;
            
            return (
              <div key={category}>
                <h4 className="text-base font-medium mb-3 flex items-center gap-2">
                  {category}
                  <Badge variant="secondary">{categorySkills.length}</Badge>
                </h4>
                
                {categorySkills.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No skills in this category
                  </p>
                ) : (
                  <div className="grid gap-3">
                    {categorySkills.map((skill) => (
                      <Card key={skill.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-base">{skill.name}</CardTitle>
                              {skill.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenDialog(skill)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(skill)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Skill Dialog */}
      <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSkill ? 'Edit Skill' : 'Create Skill'}
            </DialogTitle>
            <DialogDescription>
              {editingSkill 
                ? 'Update the skill information.'
                : 'Add a new skill to your workspace.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., React, Project Management, Adobe Photoshop"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the skill"
                rows={3}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.name.trim() || isSubmitting}>
                {isSubmitting 
                  ? (editingSkill ? 'Updating...' : 'Creating...') 
                  : (editingSkill ? 'Update Skill' : 'Create Skill')
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SkillsManagement;