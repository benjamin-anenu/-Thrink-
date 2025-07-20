import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Stakeholder } from '@/types/stakeholder';
import { User, Mail, Briefcase, Heart, Edit, Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(data.stakeholders || []);
  const [newStakeholder, setNewStakeholder] = useState({
    name: '',
    email: '',
    role: '',
    influence: 'medium'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStakeholderId, setEditingStakeholderId] = useState<string | null>(null);
  const [editedStakeholder, setEditedStakeholder] = useState<Partial<Stakeholder>>({});

  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    onUpdate({ stakeholders });
  }, [stakeholders, onUpdate]);

  useEffect(() => {
    // Load stakeholders from database on component mount
    const loadStakeholders = async () => {
      if (!currentWorkspace) return;
      
      try {
        const { data: fetchedStakeholders, error } = await supabase
          .from('stakeholders')
          .select('*')
          .eq('workspace_id', currentWorkspace.id);

        if (error) throw error;

        // Map database stakeholders to component format
        const mappedStakeholders = (fetchedStakeholders || []).map(dbStakeholder => ({
          id: dbStakeholder.id,
          workspace_id: dbStakeholder.workspace_id,
          name: dbStakeholder.name,
          email: dbStakeholder.email || '',
          role: dbStakeholder.role || '',
          influence: (dbStakeholder.influence_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
          interest: 'medium' as 'low' | 'medium' | 'high' | 'critical',
          status: 'active' as 'active' | 'inactive' | 'pending',
          notes: '', // Database doesn't have notes field
          created_at: dbStakeholder.created_at,
          updated_at: dbStakeholder.updated_at,
          // Add missing properties with defaults
          projects: null,
          department: null,
          phone: null,
          communicationPreference: 'Email' as 'Email' | 'Phone' | 'Slack' | 'In-person',
          avatar: null,
          escalation_level: null,
          contact_info: {},
          project_id: null,
          department_id: null,
          organization: null
        }));
        setStakeholders(mappedStakeholders);
      } catch (error) {
        console.error('Error fetching stakeholders:', error);
        toast({
          title: "Error",
          description: "Failed to load stakeholders",
          variant: "destructive"
        });
      }
    };

    loadStakeholders();
  }, [currentWorkspace, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewStakeholder({ ...newStakeholder, [e.target.name]: e.target.value });
  };

  const handleInfluenceChange = (value: string) => {
    setNewStakeholder({ ...newStakeholder, influence: value });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, stakeholderId: string) => {
    setEditedStakeholder(prev => ({
      ...prev,
      [stakeholderId]: {
        ...prev[stakeholderId],
        [e.target.name]: e.target.value
      }
    }));
  };

  const handleAddStakeholder = async () => {
    if (!newStakeholder.name || !newStakeholder.email || !currentWorkspace) return;
    
    try {
      const stakeholderData = {
        name: newStakeholder.name,
        email: newStakeholder.email,
        role: newStakeholder.role,
        influence: newStakeholder.influence,
        workspace_id: currentWorkspace.id,
        // Add missing required properties with default values
        projects: null,
        department: null,
        phone: null,
        communicationPreference: 'Email',
        avatar: null,
        notes: '',
        escalation_level: null,
        contact_info: {},
        project_id: null,
        department_id: null,
        influence_level: newStakeholder.influence,
        organization: null
      };

      const { data: createdStakeholder, error } = await supabase
        .from('stakeholders')
        .insert([stakeholderData])
        .select()
        .single();

      if (error) throw error;

      // Map created stakeholder to component format
      const mappedStakeholder = {
        id: createdStakeholder.id,
        workspace_id: createdStakeholder.workspace_id,
        name: createdStakeholder.name,
        email: createdStakeholder.email || '',
        role: createdStakeholder.role || '',
        influence: (createdStakeholder.influence_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        interest: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        status: 'active' as 'active' | 'inactive' | 'pending',
        notes: '', // Database doesn't have notes field
        created_at: createdStakeholder.created_at,
        updated_at: createdStakeholder.updated_at,
        // Add missing properties with defaults
        projects: null,
        department: null,
        phone: null,
        communicationPreference: 'Email' as 'Email' | 'Phone' | 'Slack' | 'In-person',
        avatar: null,
        escalation_level: null,
        contact_info: {},
        project_id: null,
        department_id: null,
        organization: null
      };
      setStakeholders([...stakeholders, mappedStakeholder]);
      setNewStakeholder({
        name: '',
        email: '',
        role: '',
        influence: 'medium'
      });
      setShowAddForm(false);
      
      toast({
        title: "Success",
        description: "Stakeholder added successfully"
      });
    } catch (error) {
      console.error('Error adding stakeholder:', error);
      toast({
        title: "Error",
        description: "Failed to add stakeholder",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStakeholder = async (stakeholderId: string) => {
    if (!currentWorkspace) return;

    try {
      const updates = editedStakeholder[stakeholderId] || {};

      const { data: updatedStakeholder, error } = await supabase
        .from('stakeholders')
        .update(updates)
        .eq('id', stakeholderId)
        .select()
        .single();

      if (error) throw error;

      // Map updated stakeholder to component format
      const mappedStakeholder = {
        id: updatedStakeholder.id,
        workspace_id: updatedStakeholder.workspace_id,
        name: updatedStakeholder.name,
        email: updatedStakeholder.email || '',
        role: updatedStakeholder.role || '',
        influence: (updatedStakeholder.influence_level as 'low' | 'medium' | 'high' | 'critical') || 'medium',
        interest: 'medium' as 'low' | 'medium' | 'high' | 'critical',
        status: 'active' as 'active' | 'inactive' | 'pending',
        notes: '', // Database doesn't have notes field
        created_at: updatedStakeholder.created_at,
        updated_at: updatedStakeholder.updated_at,
        // Add missing properties with defaults
        projects: null,
        department: null,
        phone: null,
        communicationPreference: 'Email' as 'Email' | 'Phone' | 'Slack' | 'In-person',
        avatar: null,
        escalation_level: null,
        contact_info: {},
        project_id: null,
        department_id: null,
        organization: null
      };
      setStakeholders(stakeholders.map(stakeholder =>
        stakeholder.id === stakeholderId ? mappedStakeholder : stakeholder
      ));
      setEditingStakeholderId(null);
      setEditedStakeholder(prev => {
        const newState = { ...prev };
        delete newState[stakeholderId];
        return newState;
      });
      
      toast({
        title: "Success",
        description: "Stakeholder updated successfully"
      });
    } catch (error) {
      console.error('Error updating stakeholder:', error);
      toast({
        title: "Error",
        description: "Failed to update stakeholder",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStakeholder = async (stakeholderId: string) => {
    try {
      const { error } = await supabase
        .from('stakeholders')
        .delete()
        .eq('id', stakeholderId);

      if (error) throw error;

      setStakeholders(stakeholders.filter(stakeholder => stakeholder.id !== stakeholderId));
      toast({
        title: "Success",
        description: "Stakeholder deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting stakeholder:', error);
      toast({
        title: "Error",
        description: "Failed to delete stakeholder",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Stakeholder Management
          </CardTitle>
          <CardDescription>
            Identify and manage key stakeholders for this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stakeholder List */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Current Stakeholders</Label>
            {stakeholders.length === 0 ? (
              <p className="text-muted-foreground">No stakeholders added yet.</p>
            ) : (
              <div className="grid gap-3">
                {stakeholders.map((stakeholder) => (
                  <div key={stakeholder.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {stakeholder.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{stakeholder.name}</p>
                        <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {editingStakeholderId === stakeholder.id ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStakeholder(stakeholder.id)}
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingStakeholderId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingStakeholderId(stakeholder.id);
                              setEditedStakeholder(prev => ({
                                ...prev,
                                [stakeholder.id]: stakeholder
                              }));
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStakeholder(stakeholder.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Stakeholder Form */}
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="w-full flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Stakeholder
            </Button>
          ) : (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add Stakeholder</Label>
              <Input
                type="text"
                name="name"
                placeholder="Full Name"
                value={newStakeholder.name}
                onChange={handleInputChange}
              />
              <Input
                type="email"
                name="email"
                placeholder="Email Address"
                value={newStakeholder.email}
                onChange={handleInputChange}
              />
              <Input
                type="text"
                name="role"
                placeholder="Role/Title"
                value={newStakeholder.role}
                onChange={handleInputChange}
              />
              <Select value={newStakeholder.influence} onValueChange={handleInfluenceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Influence Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStakeholder}>Add Stakeholder</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={onNext}>Next: Milestone Planning</Button>
      </div>
    </div>
  );
};

export default StakeholderManagementStep;
