import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, User, Mail, Building } from 'lucide-react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import type { ProjectCreationData } from '../ProjectCreationWizard';

interface StakeholderManagementStepProps {
  data: ProjectCreationData;
  onDataChange: (data: Partial<ProjectCreationData>) => void;
  onUpdate: (data: Partial<ProjectCreationData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StakeholderManagementStep: React.FC<StakeholderManagementStepProps> = ({
  data,
  onDataChange,
}) => {
  const { stakeholders, createStakeholder } = useStakeholders();
  const { currentWorkspace } = useWorkspace();
  const [newStakeholder, setNewStakeholder] = useState({
    name: '',
    email: '',
    role: '',
    organization: '',
    influence: 'Medium',
    interest: 'Medium',
    notes: '',
  });

  const handleAddStakeholder = async () => {
    if (!newStakeholder.name || !newStakeholder.email) return;

    const stakeholderData = {
      name: newStakeholder.name,
      email: newStakeholder.email,
      role: newStakeholder.role,
      organization: newStakeholder.organization,
      influence: newStakeholder.influence as 'Low' | 'Medium' | 'High',
      interest: newStakeholder.interest as 'Low' | 'Medium' | 'High',
      status: 'active' as const,
      notes: newStakeholder.notes,
      projects: [],
      phone: '',
      department: '',
      communicationPreference: 'Email' as const,
      influenceLevel: newStakeholder.influence,
      escalationLevel: 1,
      contactInfo: {},
      workspaceId: currentWorkspace?.id || '',
    };

    const created = await createStakeholder(stakeholderData);
    if (created) {
      const updatedStakeholders = [
        ...data.stakeholders,
        {
          id: created.id,
          name: created.name,
          role: created.role,
          influence: created.influence,
          interest: created.interest,
        },
      ];
      onDataChange({ stakeholders: updatedStakeholders });
      setNewStakeholder({
        name: '',
        email: '',
        role: '',
        organization: '',
        influence: 'Medium',
        interest: 'Medium',
        notes: '',
      });
    }
  };

  const handleRemoveStakeholder = (id: string) => {
    const updatedStakeholders = data.stakeholders.filter(s => s.id !== id);
    onDataChange({ stakeholders: updatedStakeholders });
  };

  const handleSelectExistingStakeholder = (stakeholderId: string) => {
    const stakeholder = stakeholders.find(s => s.id === stakeholderId);
    if (!stakeholder) return;

    const isAlreadySelected = data.stakeholders.some(s => s.id === stakeholder.id);
    if (isAlreadySelected) return;

    const updatedStakeholders = [
      ...data.stakeholders,
      {
        id: stakeholder.id,
        name: stakeholder.name,
        role: stakeholder.role,
        influence: stakeholder.influence,
        interest: stakeholder.interest,
      },
    ];
    onDataChange({ stakeholders: updatedStakeholders });
  };

  return (
    <div className="space-y-6">
      {/* Existing Stakeholders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Existing Stakeholders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleSelectExistingStakeholder}>
            <SelectTrigger>
              <SelectValue placeholder="Choose from existing stakeholders..." />
            </SelectTrigger>
            <SelectContent>
              {stakeholders
                .filter(s => !data.stakeholders.some(ds => ds.id === s.id))
                .map((stakeholder) => (
                  <SelectItem key={stakeholder.id} value={stakeholder.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{stakeholder.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {stakeholder.role} - {stakeholder.organization}
                      </span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Add New Stakeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Stakeholder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stakeholder-name">Name *</Label>
              <Input
                id="stakeholder-name"
                value={newStakeholder.name}
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stakeholder-email">Email *</Label>
              <Input
                id="stakeholder-email"
                type="email"
                value={newStakeholder.email}
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stakeholder-role">Role</Label>
              <Input
                id="stakeholder-role"
                value={newStakeholder.role}
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, role: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stakeholder-organization">Organization</Label>
              <Input
                id="stakeholder-organization"
                value={newStakeholder.organization}
                onChange={(e) => setNewStakeholder(prev => ({ ...prev, organization: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Influence Level</Label>
              <Select
                value={newStakeholder.influence}
                onValueChange={(value) => setNewStakeholder(prev => ({ ...prev, influence: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interest Level</Label>
              <Select
                value={newStakeholder.interest}
                onValueChange={(value) => setNewStakeholder(prev => ({ ...prev, interest: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stakeholder-notes">Notes</Label>
            <Textarea
              id="stakeholder-notes"
              value={newStakeholder.notes}
              onChange={(e) => setNewStakeholder(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>
          <Button onClick={handleAddStakeholder} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Stakeholder
          </Button>
        </CardContent>
      </Card>

      {/* Selected Stakeholders */}
      {data.stakeholders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Stakeholders ({data.stakeholders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.stakeholders.map((stakeholder) => (
                <div
                  key={stakeholder.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{stakeholder.name}</h4>
                      <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Influence: {stakeholder.influence}
                    </Badge>
                    <Badge variant="outline">
                      Interest: {stakeholder.interest}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveStakeholder(stakeholder.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StakeholderManagementStep;
