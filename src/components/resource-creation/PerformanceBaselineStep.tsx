import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Plus, X, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { ResourceFormData } from '../ResourceCreationWizard';

interface PerformanceBaselineStepProps {
  formData: ResourceFormData;
  updateFormData: (updates: Partial<ResourceFormData>) => void;
}

const SENIORITY_LEVELS = [
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Principal',
  'Architect'
];

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Intern'
];

const COMMON_STRENGTHS = [
  'Problem Solving',
  'Communication',
  'Leadership',
  'Technical Expertise',
  'Creativity',
  'Time Management',
  'Team Collaboration',
  'Analytical Thinking',
  'Adaptability',
  'Mentoring'
];

const COMMON_GROWTH_AREAS = [
  'Public Speaking',
  'Project Management',
  'Technical Writing',
  'Code Review',
  'System Design',
  'Client Communication',
  'Cross-team Collaboration',
  'Performance Optimization',
  'Security Best Practices',
  'Emerging Technologies'
];

const CAREER_ASPIRATIONS = [
  'Technical Leadership',
  'People Management',
  'Product Management',
  'Enterprise Architecture',
  'Consulting',
  'Entrepreneurship',
  'Research & Development',
  'Specialization',
  'Cross-functional Role'
];

export function PerformanceBaselineStep({ formData, updateFormData }: PerformanceBaselineStepProps) {
  const [newStrength, setNewStrength] = useState('');
  const [newGrowthArea, setNewGrowthArea] = useState('');
  const [newAspiration, setNewAspiration] = useState('');

  const addItem = (type: 'strengthKeywords' | 'growthAreas' | 'careerAspirations', value: string) => {
    if (!value.trim()) return;
    const currentArray = formData[type];
    if (currentArray.includes(value)) return;
    
    updateFormData({
      [type]: [...currentArray, value]
    });

    // Clear input
    if (type === 'strengthKeywords') setNewStrength('');
    if (type === 'growthAreas') setNewGrowthArea('');
    if (type === 'careerAspirations') setNewAspiration('');
  };

  const removeItem = (type: 'strengthKeywords' | 'growthAreas' | 'careerAspirations', index: number) => {
    const currentArray = formData[type];
    const updated = currentArray.filter((_, i) => i !== index);
    updateFormData({ [type]: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Experience & Role Information
          </CardTitle>
          <CardDescription>
            Basic experience level and employment details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Seniority Level</Label>
              <Select
                value={formData.seniorityLevel}
                onValueChange={(value) => updateFormData({ seniorityLevel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SENIORITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) => updateFormData({ employmentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="mentorship"
              checked={formData.mentorshipCapacity}
              onCheckedChange={(checked) => updateFormData({ mentorshipCapacity: checked })}
            />
            <Label htmlFor="mentorship">Available for mentoring junior team members</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics Baseline
          </CardTitle>
          <CardDescription>
            Initial assessment of key performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Complexity Handling Score: {formData.complexityHandlingScore}/10</Label>
              <Slider
                value={[formData.complexityHandlingScore]}
                onValueChange={([value]) => updateFormData({ complexityHandlingScore: value })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Ability to handle complex technical challenges
              </p>
            </div>

            <div className="space-y-2">
              <Label>Collaboration Effectiveness: {formData.collaborationEffectiveness}/10</Label>
              <Slider
                value={[formData.collaborationEffectiveness]}
                onValueChange={([value]) => updateFormData({ collaborationEffectiveness: value })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Team collaboration and communication skills
              </p>
            </div>

            <div className="space-y-2">
              <Label>Learning Task Success Rate: {formData.learningTaskSuccessRate}/10</Label>
              <Slider
                value={[formData.learningTaskSuccessRate]}
                onValueChange={([value]) => updateFormData({ learningTaskSuccessRate: value })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Success rate when learning new technologies/skills
              </p>
            </div>

            <div className="space-y-2">
              <Label>Historical Task Velocity: {formData.historicalTaskVelocity}/10</Label>
              <Slider
                value={[formData.historicalTaskVelocity]}
                onValueChange={([value]) => updateFormData({ historicalTaskVelocity: value })}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Speed and efficiency in completing tasks
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Strengths & Development Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Strengths */}
          <div className="space-y-3">
            <Label>Key Strengths</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_STRENGTHS.map((strength) => (
                <Badge
                  key={strength}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => addItem('strengthKeywords', strength)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {strength}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom strength"
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('strengthKeywords', newStrength)}
              />
              <Button onClick={() => addItem('strengthKeywords', newStrength)}>Add</Button>
            </div>
            {formData.strengthKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.strengthKeywords.map((strength, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {strength}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('strengthKeywords', index)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Growth Areas */}
          <div className="space-y-3">
            <Label>Growth Areas</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_GROWTH_AREAS.map((area) => (
                <Badge
                  key={area}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => addItem('growthAreas', area)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {area}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom growth area"
                value={newGrowthArea}
                onChange={(e) => setNewGrowthArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('growthAreas', newGrowthArea)}
              />
              <Button onClick={() => addItem('growthAreas', newGrowthArea)}>Add</Button>
            </div>
            {formData.growthAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.growthAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {area}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('growthAreas', index)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Career Aspirations */}
          <div className="space-y-3">
            <Label>Career Aspirations</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CAREER_ASPIRATIONS.map((aspiration) => (
                <Badge
                  key={aspiration}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => addItem('careerAspirations', aspiration)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {aspiration}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom career goal"
                value={newAspiration}
                onChange={(e) => setNewAspiration(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addItem('careerAspirations', newAspiration)}
              />
              <Button onClick={() => addItem('careerAspirations', newAspiration)}>Add</Button>
            </div>
            {formData.careerAspirations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.careerAspirations.map((aspiration, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {aspiration}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeItem('careerAspirations', index)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}