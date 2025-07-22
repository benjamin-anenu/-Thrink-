import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Plus, X, Zap, Award } from 'lucide-react';
import { useSkills } from '@/hooks/useSkills';
import { ResourceFormData } from '../ResourceCreationWizard';

interface SkillsProficiencyStepProps {
  formData: ResourceFormData;
  updateFormData: (updates: Partial<ResourceFormData>) => void;
}

const CERTIFICATION_LEVELS = [
  'None',
  'Certified',
  'Expert Certified',
  'Master Certified'
];

export function SkillsProficiencyStep({ formData, updateFormData }: SkillsProficiencyStepProps) {
  const { skills: workspaceSkills, loading: skillsLoading } = useSkills();
  const [newSkillName, setNewSkillName] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);

  const addSkill = () => {
    if (!newSkillName.trim()) return;

    const newSkill = {
      skillName: newSkillName,
      proficiencyLevel: 5,
      yearsExperience: 1,
      confidenceScore: 5,
      certificationLevel: 'None'
    };

    updateFormData({
      skills: [...formData.skills, newSkill]
    });

    setNewSkillName('');
    setShowAddSkill(false);
  };

  const removeSkill = (index: number) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    updateFormData({ skills: updatedSkills });
  };

  const updateSkill = (index: number, updates: Partial<typeof formData.skills[0]>) => {
    const updatedSkills = formData.skills.map((skill, i) => 
      i === index ? { ...skill, ...updates } : skill
    );
    updateFormData({ skills: updatedSkills });
  };

  const addWorkspaceSkill = (skillName: string) => {
    if (formData.skills.some(s => s.skillName === skillName)) return;

    const newSkill = {
      skillName,
      proficiencyLevel: 5,
      yearsExperience: 1,
      confidenceScore: 5,
      certificationLevel: 'None'
    };

    updateFormData({
      skills: [...formData.skills, newSkill]
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Skills & Proficiencies
          </CardTitle>
          <CardDescription>
            Define the technical and soft skills with proficiency levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Workspace Skills */}
          {!skillsLoading && workspaceSkills.length > 0 && (
            <div className="space-y-3">
              <Label>Available Workspace Skills</Label>
              <div className="flex flex-wrap gap-2">
                {workspaceSkills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => addWorkspaceSkill(skill.name)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Skill */}
          {!showAddSkill ? (
            <Button
              variant="outline"
              onClick={() => setShowAddSkill(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Skill
            </Button>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter skill name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill} disabled={!newSkillName.trim()}>
                Add
              </Button>
              <Button variant="outline" onClick={() => setShowAddSkill(false)}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Skills */}
      {formData.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Current Skills ({formData.skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.skills.map((skill, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{skill.skillName}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Proficiency Level: {skill.proficiencyLevel}/10</Label>
                    <Slider
                      value={[skill.proficiencyLevel]}
                      onValueChange={([value]) => updateSkill(index, { proficiencyLevel: value })}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confidence Score: {skill.confidenceScore}/10</Label>
                    <Slider
                      value={[skill.confidenceScore]}
                      onValueChange={([value]) => updateSkill(index, { confidenceScore: value })}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={skill.yearsExperience}
                      onChange={(e) => updateSkill(index, { yearsExperience: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Certification Level</Label>
                    <Select
                      value={skill.certificationLevel}
                      onValueChange={(value) => updateSkill(index, { certificationLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CERTIFICATION_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {formData.skills.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No skills added yet. Add skills to continue.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}