import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useSkills } from '@/hooks/useSkills';
import { toast } from 'sonner';

interface SkillsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceId: string;
  resourceName: string;
  onSkillsUpdated?: () => void;
}

interface ResourceSkill {
  id?: string;
  skill_id: string;
  skill_name: string;
  proficiency_level: number;
  years_experience: number;
  confidence_score: number;
  isNew?: boolean;
}

const SkillsManagementModal: React.FC<SkillsManagementModalProps> = ({
  isOpen,
  onClose,
  resourceId,
  resourceName,
  onSkillsUpdated
}) => {
  const [resourceSkills, setResourceSkills] = useState<ResourceSkill[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const { skills: availableSkills } = useSkills();

  useEffect(() => {
    if (isOpen && resourceId && currentWorkspace) {
      loadResourceSkills();
    }
  }, [isOpen, resourceId, currentWorkspace]);

  const loadResourceSkills = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('skill_proficiencies')
        .select(`
          *,
          skills!inner(name)
        `)
        .eq('resource_id', resourceId)
        .eq('workspace_id', currentWorkspace!.id);

      if (error) throw error;

      const mappedSkills = (data || []).map((skill: any) => ({
        id: skill.id,
        skill_id: skill.skill_id,
        skill_name: skill.skills.name,
        proficiency_level: skill.proficiency_level,
        years_experience: skill.years_experience,
        confidence_score: skill.confidence_score
      }));

      setResourceSkills(mappedSkills);
    } catch (error) {
      console.error('Error loading resource skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const addNewSkill = () => {
    const newSkill: ResourceSkill = {
      skill_id: '',
      skill_name: '',
      proficiency_level: 5,
      years_experience: 1,
      confidence_score: 5,
      isNew: true
    };
    setResourceSkills([...resourceSkills, newSkill]);
  };

  const updateSkill = (index: number, field: keyof ResourceSkill, value: any) => {
    const updated = [...resourceSkills];
    updated[index] = { ...updated[index], [field]: value };
    
    // If skill_id is updated, find the skill name
    if (field === 'skill_id') {
      const selectedSkill = availableSkills.find(s => s.id === value);
      if (selectedSkill) {
        updated[index].skill_name = selectedSkill.name;
      }
    }
    
    setResourceSkills(updated);
  };

  const removeSkill = (index: number) => {
    const updated = [...resourceSkills];
    updated.splice(index, 1);
    setResourceSkills(updated);
  };

  const saveSkills = async () => {
    setSaving(true);
    try {
      // Delete existing skills first
      const { error: deleteError } = await supabase
        .from('skill_proficiencies')
        .delete()
        .eq('resource_id', resourceId)
        .eq('workspace_id', currentWorkspace!.id);

      if (deleteError) throw deleteError;

      // Insert updated skills
      if (resourceSkills.length > 0) {
        const skillsToInsert = resourceSkills
          .filter(skill => skill.skill_id) // Only skills with valid skill_id
          .map(skill => ({
            resource_id: resourceId,
            skill_id: skill.skill_id,
            workspace_id: currentWorkspace!.id,
            proficiency_level: skill.proficiency_level,
            years_experience: skill.years_experience,
            confidence_score: skill.confidence_score,
            improvement_trend: 'stable' // Default value
          }));

        if (skillsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('skill_proficiencies')
            .insert(skillsToInsert);

          if (insertError) throw insertError;
        }
      }

      toast.success('Skills updated successfully');
      onSkillsUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error saving skills:', error);
      toast.error('Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  const getAvailableSkillsForSelection = (currentIndex: number) => {
    const selectedSkillIds = resourceSkills
      .map((skill, index) => index !== currentIndex ? skill.skill_id : null)
      .filter(Boolean);
    
    return availableSkills.filter(skill => !selectedSkillIds.includes(skill.id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Skills - {resourceName}</DialogTitle>
          <DialogDescription>
            Add, edit, or remove skills and proficiency levels for this resource.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {resourceSkills.map((skill, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Skill {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor={`skill-${index}`}>Skill</Label>
                  <Select
                    value={skill.skill_id}
                    onValueChange={(value) => updateSkill(index, 'skill_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSkillsForSelection(index).map((availableSkill) => (
                        <SelectItem key={availableSkill.id} value={availableSkill.id}>
                          {availableSkill.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`proficiency-${index}`}>
                      Proficiency Level: {skill.proficiency_level}/10
                    </Label>
                    <Slider
                      value={[skill.proficiency_level]}
                      onValueChange={(value) => updateSkill(index, 'proficiency_level', value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`confidence-${index}`}>
                      Confidence: {skill.confidence_score}/10
                    </Label>
                    <Slider
                      value={[skill.confidence_score]}
                      onValueChange={(value) => updateSkill(index, 'confidence_score', value[0])}
                      min={1}
                      max={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`experience-${index}`}>Years of Experience</Label>
                  <Input
                    type="number"
                    value={skill.years_experience}
                    onChange={(e) => updateSkill(index, 'years_experience', parseInt(e.target.value) || 0)}
                    min={0}
                    max={50}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="outline"
            onClick={addNewSkill}
            className="w-full"
            disabled={availableSkills.length === resourceSkills.length}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={saveSkills} disabled={saving || loading}>
            {saving ? (
              <>
                <Save className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Skills
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillsManagementModal;