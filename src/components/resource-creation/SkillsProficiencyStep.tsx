
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { ResourceFormData } from '../ResourceCreationWizard';
import { useSkills } from '@/hooks/useSkills';

interface SkillsProficiencyStepProps {
  formData: ResourceFormData;
  updateFormData: (updates: Partial<ResourceFormData>) => void;
}

export function SkillsProficiencyStep({ formData, updateFormData }: SkillsProficiencyStepProps) {
  const { skills: availableSkills, loading: skillsLoading } = useSkills();
  const [selectedSkill, setSelectedSkill] = React.useState('');
  const [proficiencyLevel, setProficiencyLevel] = React.useState(5);
  const [yearsExperience, setYearsExperience] = React.useState(1);

  const addSkill = () => {
    if (!selectedSkill) return;
    
    const skillExists = formData.skills.find(s => s.skillName === selectedSkill);
    if (skillExists) return;

    const newSkill = {
      skillName: selectedSkill,
      proficiencyLevel,
      yearsExperience,
      confidenceScore: proficiencyLevel
    };

    updateFormData({
      skills: [...formData.skills, newSkill]
    });

    setSelectedSkill('');
    setProficiencyLevel(5);
    setYearsExperience(1);
  };

  const removeSkill = (index: number) => {
    const updatedSkills = formData.skills.filter((_, i) => i !== index);
    updateFormData({ skills: updatedSkills });
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const updatedSkills = formData.skills.map((skill, i) => {
      if (i === index) {
        const updated = { ...skill, [field]: value };
        // Auto-update confidence score based on proficiency level
        if (field === 'proficiencyLevel') {
          updated.confidenceScore = value;
        }
        return updated;
      }
      return skill;
    });
    updateFormData({ skills: updatedSkills });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Skills & Proficiencies</CardTitle>
          <CardDescription>
            Select skills and rate proficiency levels from 1 (beginner) to 10 (expert)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Skill</Label>
              <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {skillsLoading ? (
                    <SelectItem value="loading" disabled>Loading skills...</SelectItem>
                  ) : availableSkills.length === 0 ? (
                    <SelectItem value="no-skills" disabled>No skills configured</SelectItem>
                  ) : (
                    availableSkills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.name}>
                        {skill.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Proficiency (1-10)</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={proficiencyLevel}
                onChange={(e) => setProficiencyLevel(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Years Experience</Label>
              <Input
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={addSkill} 
                disabled={!selectedSkill || skillsLoading}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {formData.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Skills ({formData.skills.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4 flex-1">
                    <Badge variant="secondary">{skill.skillName}</Badge>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Proficiency:</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={skill.proficiencyLevel}
                        onChange={(e) => updateSkill(index, 'proficiencyLevel', parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Years:</Label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={skill.yearsExperience}
                        onChange={(e) => updateSkill(index, 'yearsExperience', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSkill(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
