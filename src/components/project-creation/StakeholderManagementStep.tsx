import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Users, AlertTriangle } from 'lucide-react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useEscalationMatrix } from '@/hooks/useEscalationMatrix';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';

interface StakeholderManagementStepProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StakeholderManagementStep: React.FC<StakeholderManagementStepProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [newStakeholder, setNewStakeholder] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    phone: '',
    influence: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });
  const [newEscalationEntry, setNewEscalationEntry] = useState({
    level: 1,
    contact_name: '',
    contact_email: '',
    contact_role: '',
    issue_types: [] as string[]
  });

  const { currentWorkspace } = useWorkspace();
  const { createStakeholder } = useStakeholders();
  const { createEscalationEntry } = useEscalationMatrix();

  const stakeholders = data.stakeholders || [];
  const escalationMatrix = data.escalationMatrix || [];

  const addStakeholder = () => {
    if (!newStakeholder.name || !newStakeholder.email) {
      toast.error('Name and email are required');
      return;
    }

    const stakeholder = {
      ...newStakeholder,
      id: `temp-${Date.now()}`,
      workspace_id: currentWorkspace?.id || '',
      communication_preference: 'Email' as 'Email' | 'Phone' | 'Slack' | 'In-person',
      projects: [] as string[],
      interest: 'medium' as 'low' | 'medium' | 'high' | 'critical',
      status: 'active' as 'active' | 'inactive' | 'pending',
      notes: ''
    };

    onUpdate({
      ...data,
      stakeholders: [...stakeholders, stakeholder]
    });

    setNewStakeholder({
      name: '',
      email: '',
      role: '',
      department: '',
      phone: '',
      influence: 'medium'
    });
  };

  const removeStakeholder = (index: number) => {
    const updatedStakeholders = stakeholders.filter((_: any, i: number) => i !== index);
    onUpdate({
      ...data,
      stakeholders: updatedStakeholders
    });
  };

  const addEscalationEntry = () => {
    if (!newEscalationEntry.contact_name || !newEscalationEntry.contact_email) {
      toast.error('Contact name and email are required');
      return;
    }

    const entry = {
      ...newEscalationEntry,
      id: `temp-${Date.now()}`
    };

    onUpdate({
      ...data,
      escalationMatrix: [...escalationMatrix, entry]
    });

    setNewEscalationEntry({
      level: Math.max(...escalationMatrix.map((e: any) => e.level), 0) + 1,
      contact_name: '',
      contact_email: '',
      contact_role: '',
      issue_types: []
    });
  };

  const removeEscalationEntry = (index: number) => {
    const updatedMatrix = escalationMatrix.filter((_: any, i: number) => i !== index);
    onUpdate({
      ...data,
      escalationMatrix: updatedMatrix
    });
  };

  const addIssueType = (issueType: string) => {
    if (issueType && !newEscalationEntry.issue_types.includes(issueType)) {
      setNewEscalationEntry({
        ...newEscalationEntry,
        issue_types: [...newEscalationEntry.issue_types, issueType]
      });
    }
  };

  const removeIssueType = (issueType: string) => {
    setNewEscalationEntry({
      ...newEscalationEntry,
      issue_types: newEscalationEntry.issue_types.filter(type => type !== issueType)
    });
  };

  const handleNext = async () => {
    // Save stakeholders to database
    for (const stakeholder of stakeholders) {
      if (stakeholder.id.startsWith('temp-')) {
        await createStakeholder({
          name: stakeholder.name,
          email: stakeholder.email,
          role: stakeholder.role,
          department: stakeholder.department || '',
          phone: stakeholder.phone || '',
          communication_preference: stakeholder.communication_preference || 'Email',
          projects: stakeholder.projects || [],
          influence: stakeholder.influence,
          interest: stakeholder.interest || 'medium',
          status: stakeholder.status || 'active',
          workspace_id: currentWorkspace?.id || '',
          notes: stakeholder.notes || ''
        });
      }
    }

    onNext();
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Stakeholder Management</h2>
        <p className="text-muted-foreground">
          Define project stakeholders and escalation procedures
        </p>
      </div>

      {/* Stakeholders Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users size={20} />
            Project Stakeholders
          </CardTitle>
          <CardDescription>
            Add key stakeholders who will be involved in or affected by this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="stakeholder-name">Name</Label>
              <Input
                id="stakeholder-name"
                value={newStakeholder.name}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="stakeholder-email">Email</Label>
              <Input
                id="stakeholder-email"
                type="email"
                value={newStakeholder.email}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, email: e.target.value })}
                placeholder="email@company.com"
              />
            </div>
            <div>
              <Label htmlFor="stakeholder-role">Role</Label>
              <Input
                id="stakeholder-role"
                value={newStakeholder.role}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, role: e.target.value })}
                placeholder="Project Manager"
              />
            </div>
            <div>
              <Label htmlFor="stakeholder-department">Department</Label>
              <Input
                id="stakeholder-department"
                value={newStakeholder.department}
                onChange={(e) => setNewStakeholder({ ...newStakeholder, department: e.target.value })}
                placeholder="Engineering"
              />
            </div>
            <div>
              <Label htmlFor="stakeholder-influence">Influence</Label>
              <Select
                value={newStakeholder.influence}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                  setNewStakeholder({ ...newStakeholder, influence: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={addStakeholder} className="w-full">
            <Plus size={16} className="mr-2" />
            Add Stakeholder
          </Button>

          {stakeholders.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Added Stakeholders:</h4>
              {stakeholders.map((stakeholder: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{stakeholder.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {stakeholder.role} • {stakeholder.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{stakeholder.influence} influence</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStakeholder(index)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escalation Matrix Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle size={20} />
            Escalation Matrix
          </CardTitle>
          <CardDescription>
            Define escalation procedures for different types of issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="escalation-level">Level</Label>
              <Input
                id="escalation-level"
                type="number"
                value={newEscalationEntry.level}
                onChange={(e) => setNewEscalationEntry({ 
                  ...newEscalationEntry, 
                  level: parseInt(e.target.value) || 1 
                })}
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="escalation-name">Contact Name</Label>
              <Input
                id="escalation-name"
                value={newEscalationEntry.contact_name}
                onChange={(e) => setNewEscalationEntry({ 
                  ...newEscalationEntry, 
                  contact_name: e.target.value 
                })}
                placeholder="Contact person"
              />
            </div>
            <div>
              <Label htmlFor="escalation-email">Contact Email</Label>
              <Input
                id="escalation-email"
                type="email"
                value={newEscalationEntry.contact_email}
                onChange={(e) => setNewEscalationEntry({ 
                  ...newEscalationEntry, 
                  contact_email: e.target.value 
                })}
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <Label htmlFor="escalation-role">Contact Role</Label>
              <Input
                id="escalation-role"
                value={newEscalationEntry.contact_role}
                onChange={(e) => setNewEscalationEntry({ 
                  ...newEscalationEntry, 
                  contact_role: e.target.value 
                })}
                placeholder="Team Lead"
              />
            </div>
          </div>

          <div>
            <Label>Issue Types</Label>
            <div className="flex gap-2 mb-2">
              <Select onValueChange={addIssueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Add issue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Budget">Budget</SelectItem>
                  <SelectItem value="Schedule">Schedule</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                  <SelectItem value="Resource">Resource</SelectItem>
                  <SelectItem value="Stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap gap-2">
              {newEscalationEntry.issue_types.map((type, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="cursor-pointer" 
                  onClick={() => removeIssueType(type)}
                >
                  {type} ×
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={addEscalationEntry} className="w-full">
            <Plus size={16} className="mr-2" />
            Add Escalation Level
          </Button>

          {escalationMatrix.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Escalation Levels:</h4>
              {escalationMatrix.sort((a: any, b: any) => a.level - b.level).map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Level {entry.level} - {entry.contact_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.contact_role} • {entry.contact_email}
                    </p>
                    {entry.issue_types && entry.issue_types.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.issue_types.map((type: string, typeIndex: number) => (
                          <Badge key={typeIndex} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEscalationEntry(index)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next: Resource Planning
        </Button>
      </div>
    </div>
  );
};

export default StakeholderManagementStep;
