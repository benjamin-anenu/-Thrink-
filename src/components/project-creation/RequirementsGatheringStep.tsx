
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, CheckCircle, Users, FileCheck } from 'lucide-react';

interface RequirementsGatheringStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const RequirementsGatheringStep: React.FC<RequirementsGatheringStepProps> = ({ data, onDataChange }) => {
  const [newFunctional, setNewFunctional] = useState('');
  const [newNonFunctional, setNewNonFunctional] = useState('');
  const [newConstraint, setNewConstraint] = useState('');

  const stakeholders = [
    'Product Manager', 'Technical Lead', 'Business Analyst', 
    'UI/UX Designer', 'Quality Assurance', 'Compliance Officer'
  ];

  const addRequirement = (type: 'functional' | 'nonFunctional' | 'constraints', value: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
    if (value.trim()) {
      onDataChange({
        requirements: {
          ...data.requirements,
          [type]: [...data.requirements[type], value.trim()]
        }
      });
      setter('');
    }
  };

  const removeRequirement = (type: 'functional' | 'nonFunctional' | 'constraints', index: number) => {
    const updated = data.requirements[type].filter((_: any, i: number) => i !== index);
    onDataChange({
      requirements: {
        ...data.requirements,
        [type]: updated
      }
    });
  };

  const toggleStakeholderSignoff = (index: number) => {
    const updatedSignoffs = [...data.requirements.stakeholderSignoffs];
    updatedSignoffs[index] = !updatedSignoffs[index];
    onDataChange({
      requirements: {
        ...data.requirements,
        stakeholderSignoffs: updatedSignoffs
      }
    });
  };

  const generateAIRequirements = () => {
    // Simulate AI generation
    const aiSuggestions = {
      functional: [
        'User authentication and authorization',
        'Data export functionality',
        'Real-time notifications',
        'Search and filtering capabilities'
      ],
      nonFunctional: [
        'System must support 1000+ concurrent users',
        'Response time < 2 seconds',
        '99.9% uptime availability',
        'GDPR compliance required'
      ],
      constraints: [
        'Budget limit: $' + (data.resources?.budget || '100,000'),
        'Timeline: 6 months maximum',
        'Must integrate with existing systems',
        'Technology stack: React, Node.js'
      ]
    };

    onDataChange({
      requirements: {
        ...data.requirements,
        functional: [...data.requirements.functional, ...aiSuggestions.functional],
        nonFunctional: [...data.requirements.nonFunctional, ...aiSuggestions.nonFunctional],
        constraints: [...data.requirements.constraints, ...aiSuggestions.constraints]
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Requirements Gathering</h3>
          <p className="text-muted-foreground">
            Define functional and non-functional requirements with stakeholder approval.
          </p>
        </div>
        <Button onClick={generateAIRequirements} variant="outline" className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          AI Generate
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Functional Requirements
            </CardTitle>
            <CardDescription>What the system should do</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add functional requirement"
                value={newFunctional}
                onChange={(e) => setNewFunctional(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRequirement('functional', newFunctional, setNewFunctional)}
              />
              <Button onClick={() => addRequirement('functional', newFunctional, setNewFunctional)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.requirements.functional.map((req: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span>{req}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement('functional', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Non-Functional Requirements
            </CardTitle>
            <CardDescription>Performance, security, scalability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add non-functional requirement"
                value={newNonFunctional}
                onChange={(e) => setNewNonFunctional(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addRequirement('nonFunctional', newNonFunctional, setNewNonFunctional)}
              />
              <Button onClick={() => addRequirement('nonFunctional', newNonFunctional, setNewNonFunctional)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.requirements.nonFunctional.map((req: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span>{req}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRequirement('nonFunctional', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Constraints & Limitations</CardTitle>
          <CardDescription>Technical, business, or regulatory constraints</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add constraint or limitation"
              value={newConstraint}
              onChange={(e) => setNewConstraint(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addRequirement('constraints', newConstraint, setNewConstraint)}
            />
            <Button onClick={() => addRequirement('constraints', newConstraint, setNewConstraint)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.requirements.constraints.map((constraint: string, index: number) => (
              <Badge key={index} variant="outline" className="flex items-center gap-2">
                {constraint}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => removeRequirement('constraints', index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Stakeholder Sign-offs
          </CardTitle>
          <CardDescription>Confirm approval from key stakeholders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stakeholders.map((stakeholder, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`stakeholder-${index}`}
                  checked={data.requirements.stakeholderSignoffs[index] || false}
                  onCheckedChange={() => toggleStakeholderSignoff(index)}
                />
                <Label htmlFor={`stakeholder-${index}`} className="text-sm">
                  {stakeholder}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequirementsGatheringStep;
