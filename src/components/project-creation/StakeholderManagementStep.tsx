import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Users, Shield, AlertTriangle, Clock } from 'lucide-react';
import { useStakeholders } from '@/hooks/useStakeholders';

interface Stakeholder {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  responsibilities: string[];
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    dailyReports: boolean;
    weeklyReports: boolean;
    milestoneAlerts: boolean;
    riskAlerts: boolean;
  };
}

interface EscalationLevel {
  level: number;
  name: string;
  triggers: string[];
  recipients: string[];
  timeThreshold: number; // hours
  autoEscalate: boolean;
}

interface StakeholderManagementStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const StakeholderManagementStep: React.FC<StakeholderManagementStepProps> = ({ data, onDataChange }) => {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(data.stakeholders || []);
  const [escalationMatrix, setEscalationMatrix] = useState<EscalationLevel[]>(data.escalationMatrix || []);
  const [newStakeholder, setNewStakeholder] = useState<Partial<Stakeholder>>({
    notificationPreferences: {
      email: true,
      sms: false,
      dailyReports: true,
      weeklyReports: true,
      milestoneAlerts: true,
      riskAlerts: true
    }
  });

  const { deleteStakeholder } = useStakeholders();

  const roles = [
    'Project Sponsor',
    'Project Manager',
    'Business Analyst',
    'Technical Lead',
    'Team Member',
    'Quality Assurance',
    'Client Representative',
    'End User',
    'Vendor/Supplier'
  ];

  const departments = [
    'Executive',
    'IT',
    'Finance',
    'Operations',
    'Marketing',
    'Sales',
    'HR',
    'Legal',
    'External'
  ];

  const escalationTriggers = [
    'Task overdue by 24 hours',
    'Task overdue by 48 hours',
    'Budget variance > 10%',
    'Budget variance > 20%',
    'Risk level increases to High',
    'Milestone missed',
    'Resource unavailable',
    'Scope change requested',
    'Quality issues identified'
  ];

  const addStakeholder = () => {
    if (newStakeholder.name && newStakeholder.email && newStakeholder.role) {
      const stakeholder: Stakeholder = {
        id: Date.now().toString(),
        name: newStakeholder.name,
        email: newStakeholder.email,
        role: newStakeholder.role,
        department: newStakeholder.department || '',
        phone: newStakeholder.phone,
        responsibilities: [],
        notificationPreferences: newStakeholder.notificationPreferences || {
          email: true,
          sms: false,
          dailyReports: true,
          weeklyReports: true,
          milestoneAlerts: true,
          riskAlerts: true
        }
      };
      
      const updatedStakeholders = [...stakeholders, stakeholder];
      setStakeholders(updatedStakeholders);
      setNewStakeholder({
        notificationPreferences: {
          email: true,
          sms: false,
          dailyReports: true,
          weeklyReports: true,
          milestoneAlerts: true,
          riskAlerts: true
        }
      });
      
      onDataChange({
        ...data,
        stakeholders: updatedStakeholders,
        escalationMatrix
      });
    }
  };

  const removeStakeholder = async (id: string) => {
    await deleteStakeholder(id);
    const updatedStakeholders = stakeholders.filter(s => s.id !== id);
    setStakeholders(updatedStakeholders);
    onDataChange({
      ...data,
      stakeholders: updatedStakeholders,
      escalationMatrix
    });
  };

  const addEscalationLevel = () => {
    const newLevel: EscalationLevel = {
      level: escalationMatrix.length + 1,
      name: `Level ${escalationMatrix.length + 1}`,
      triggers: [],
      recipients: [],
      timeThreshold: 24,
      autoEscalate: true
    };
    
    const updatedMatrix = [...escalationMatrix, newLevel];
    setEscalationMatrix(updatedMatrix);
    onDataChange({
      ...data,
      stakeholders,
      escalationMatrix: updatedMatrix
    });
  };

  const updateEscalationLevel = (index: number, updates: Partial<EscalationLevel>) => {
    const updatedMatrix = escalationMatrix.map((level, i) => 
      i === index ? { ...level, ...updates } : level
    );
    setEscalationMatrix(updatedMatrix);
    onDataChange({
      ...data,
      stakeholders,
      escalationMatrix: updatedMatrix
    });
  };

  const removeEscalationLevel = (index: number) => {
    const updatedMatrix = escalationMatrix.filter((_, i) => i !== index);
    setEscalationMatrix(updatedMatrix);
    onDataChange({
      ...data,
      stakeholders,
      escalationMatrix: updatedMatrix
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Stakeholder Management & Escalation</h3>
        <p className="text-sm text-muted-foreground">
          Define project stakeholders and configure escalation procedures
        </p>
      </div>

      <Tabs defaultValue="stakeholders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="escalation">Escalation Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="stakeholders" className="space-y-4">
          {/* Add New Stakeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Add Stakeholder
              </CardTitle>
              <CardDescription>
                Define project stakeholders and their notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stakeholderName">Name</Label>
                  <Input
                    id="stakeholderName"
                    value={newStakeholder.name || ''}
                    onChange={(e) => setNewStakeholder({...newStakeholder, name: e.target.value})}
                    placeholder="Stakeholder name"
                  />
                </div>
                <div>
                  <Label htmlFor="stakeholderEmail">Email</Label>
                  <Input
                    id="stakeholderEmail"
                    type="email"
                    value={newStakeholder.email || ''}
                    onChange={(e) => setNewStakeholder({...newStakeholder, email: e.target.value})}
                    placeholder="email@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stakeholderRole">Role</Label>
                  <Select 
                    value={newStakeholder.role} 
                    onValueChange={(value) => setNewStakeholder({...newStakeholder, role: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stakeholderDepartment">Department</Label>
                  <Select 
                    value={newStakeholder.department} 
                    onValueChange={(value) => setNewStakeholder({...newStakeholder, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stakeholderPhone">Phone (Optional)</Label>
                  <Input
                    id="stakeholderPhone"
                    value={newStakeholder.phone || ''}
                    onChange={(e) => setNewStakeholder({...newStakeholder, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label>Notification Preferences</Label>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newStakeholder.notificationPreferences?.email || false}
                      onCheckedChange={(checked) => setNewStakeholder({
                        ...newStakeholder,
                        notificationPreferences: {
                          ...newStakeholder.notificationPreferences!,
                          email: checked
                        }
                      })}
                    />
                    <Label>Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newStakeholder.notificationPreferences?.dailyReports || false}
                      onCheckedChange={(checked) => setNewStakeholder({
                        ...newStakeholder,
                        notificationPreferences: {
                          ...newStakeholder.notificationPreferences!,
                          dailyReports: checked
                        }
                      })}
                    />
                    <Label>Daily Reports</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newStakeholder.notificationPreferences?.milestoneAlerts || false}
                      onCheckedChange={(checked) => setNewStakeholder({
                        ...newStakeholder,
                        notificationPreferences: {
                          ...newStakeholder.notificationPreferences!,
                          milestoneAlerts: checked
                        }
                      })}
                    />
                    <Label>Milestone Alerts</Label>
                  </div>
                </div>
              </div>

              <Button onClick={addStakeholder} className="w-full">
                <Plus size={16} className="mr-2" />
                Add Stakeholder
              </Button>
            </CardContent>
          </Card>

          {/* Existing Stakeholders */}
          <div className="space-y-3">
            {stakeholders.map((stakeholder) => (
              <Card key={stakeholder.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{stakeholder.name}</h4>
                        <Badge variant="outline">{stakeholder.role}</Badge>
                        {stakeholder.department && (
                          <Badge variant="secondary">{stakeholder.department}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{stakeholder.email}</p>
                      {stakeholder.phone && (
                        <p className="text-sm text-muted-foreground">{stakeholder.phone}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeStakeholder(stakeholder.id)}
                      className="text-destructive border-destructive hover:text-destructive hover:border-destructive flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="escalation" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Escalation Matrix</h4>
              <p className="text-sm text-muted-foreground">
                Define escalation levels and triggers for automatic notifications
              </p>
            </div>
            <Button onClick={addEscalationLevel} variant="outline" size="sm">
              <Plus size={16} className="mr-2" />
              Add Level
            </Button>
          </div>

          <div className="space-y-4">
            {escalationMatrix.map((level, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield size={18} />
                      {level.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEscalationLevel(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Level Name</Label>
                      <Input
                        value={level.name}
                        onChange={(e) => updateEscalationLevel(index, { name: e.target.value })}
                        placeholder="e.g., Team Lead Escalation"
                      />
                    </div>
                    <div>
                      <Label>Time Threshold (hours)</Label>
                      <Input
                        type="number"
                        value={level.timeThreshold}
                        onChange={(e) => updateEscalationLevel(index, { timeThreshold: parseInt(e.target.value) })}
                        placeholder="24"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Escalation Triggers</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {escalationTriggers.map(trigger => (
                        <label key={trigger} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={level.triggers.includes(trigger)}
                            onChange={(e) => {
                              const triggers = e.target.checked
                                ? [...level.triggers, trigger]
                                : level.triggers.filter(t => t !== trigger);
                              updateEscalationLevel(index, { triggers });
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-sm">{trigger}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Recipients</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {stakeholders.map(stakeholder => (
                        <label key={stakeholder.id} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={level.recipients.includes(stakeholder.id)}
                            onChange={(e) => {
                              const recipients = e.target.checked
                                ? [...level.recipients, stakeholder.id]
                                : level.recipients.filter(r => r !== stakeholder.id);
                              updateEscalationLevel(index, { recipients });
                            }}
                            className="rounded border-border"
                          />
                          <span className="text-sm">{stakeholder.name} ({stakeholder.role})</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={level.autoEscalate}
                      onCheckedChange={(checked) => updateEscalationLevel(index, { autoEscalate: checked })}
                    />
                    <Label>Auto-escalate when conditions are met</Label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {escalationMatrix.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle size={48} className="mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground">No escalation levels configured</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Add escalation levels to automatically notify stakeholders when issues arise
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StakeholderManagementStep;
