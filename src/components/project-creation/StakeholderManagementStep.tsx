
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStakeholders } from '@/hooks/useStakeholders';
import { Plus, Users, Trash2, Edit } from 'lucide-react';

interface StakeholderManagementStepProps {
  data: any;
  onDataChange: (stepData: any) => void;
  onUpdate?: (data: any) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

interface StakeholderFormData {
  name: string;
  email: string;
  role: string;
  influence: string;
  interest: string;
  notes: string;
}

const StakeholderManagementStep: React.FC<StakeholderManagementStepProps> = ({
  data,
  onDataChange,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const { stakeholders, createStakeholder } = useStakeholders();
  const [showForm, setShowForm] = useState(false);
  const [selectedStakeholders, setSelectedStakeholders] = useState<string[]>(data.stakeholders || []);
  const [formData, setFormData] = useState<StakeholderFormData>({
    name: '',
    email: '',
    role: '',
    influence: 'medium',
    interest: 'medium',
    notes: ''
  });

  const handleInputChange = (field: keyof StakeholderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateStakeholder = async () => {
    try {
      const stakeholderData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        influence: formData.influence,
        workspace_id: 'current-workspace-id', // This should come from context
        interest: formData.interest,
        notes: formData.notes,
        projects: [],
        phone: '',
        department: '',
        communicationPreference: 'Email' as 'Email' | 'Phone' | 'Slack' | 'In-person',
        status: 'active' as 'active' | 'inactive' | 'pending'
      };

      await createStakeholder(stakeholderData);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: '',
        influence: 'medium',
        interest: 'medium',
        notes: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating stakeholder:', error);
    }
  };

  const handleStakeholderSelection = (stakeholderId: string) => {
    const newSelection = selectedStakeholders.includes(stakeholderId)
      ? selectedStakeholders.filter(id => id !== stakeholderId)
      : [...selectedStakeholders, stakeholderId];
    
    setSelectedStakeholders(newSelection);
    onDataChange({ ...data, stakeholders: newSelection });
  };

  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterestColor = (interest: string) => {
    switch (interest) {
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-purple-100 text-purple-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Stakeholder Management
          </CardTitle>
          <CardDescription>
            Identify and engage project stakeholders for successful delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add New Stakeholder */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Project Stakeholders</h3>
              <p className="text-sm text-muted-foreground">
                Select existing stakeholders or create new ones
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Stakeholder
            </Button>
          </div>

          {/* Create Stakeholder Form */}
          {showForm && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Create New Stakeholder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Stakeholder name"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="stakeholder@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Role</Label>
                    <Input
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      placeholder="e.g., Project Sponsor"
                    />
                  </div>
                  <div>
                    <Label>Influence Level</Label>
                    <Select value={formData.influence} onValueChange={(value) => handleInputChange('influence', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Interest Level</Label>
                    <Select value={formData.interest} onValueChange={(value) => handleInputChange('interest', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about this stakeholder..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateStakeholder}>Create Stakeholder</Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Stakeholders */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Stakeholders for this Project</Label>
            {stakeholders.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">No stakeholders found</p>
                <Button onClick={() => setShowForm(true)} variant="outline">
                  Create your first stakeholder
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {stakeholders.map((stakeholder) => (
                  <div
                    key={stakeholder.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedStakeholders.includes(stakeholder.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleStakeholderSelection(stakeholder.id)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {stakeholder.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{stakeholder.name}</p>
                          <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                          <p className="text-sm text-muted-foreground">{stakeholder.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getInfluenceColor(stakeholder.influence || 'medium')}>
                            {stakeholder.influence || 'Medium'} Influence
                          </Badge>
                          <Badge className={getInterestColor(stakeholder.interest || 'medium')}>
                            {stakeholder.interest || 'Medium'} Interest
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Summary */}
          {selectedStakeholders.length > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Selected Stakeholders ({selectedStakeholders.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedStakeholders.map(id => {
                  const stakeholder = stakeholders.find(s => s.id === id);
                  return stakeholder ? (
                    <Badge key={id} variant="secondary">
                      {stakeholder.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      {(onNext || onPrevious) && (
        <div className="flex justify-between">
          {onPrevious && (
            <Button variant="outline" onClick={onPrevious}>
              Previous
            </Button>
          )}
          {onNext && (
            <Button onClick={onNext} disabled={selectedStakeholders.length === 0}>
              Next: Budget Planning
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StakeholderManagementStep;
