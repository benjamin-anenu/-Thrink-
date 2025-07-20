
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, AlertTriangle, Users, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface EscalationContact {
  id: string;
  level: number;
  contact_name: string;
  contact_role: string;
  contact_email: string;
  issue_types: string[];
}

const EscalationMatrixTab: React.FC = () => {
  const [contacts, setContacts] = useState<EscalationContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { currentWorkspace } = useWorkspace();

  const [newContact, setNewContact] = useState({
    level: 1,
    contact_name: '',
    contact_role: '',
    contact_email: '',
    issue_types: [] as string[]
  });

  const issueTypeOptions = [
    'Budget Overrun',
    'Timeline Delay',
    'Quality Issues',
    'Resource Conflicts',
    'Scope Changes',
    'Risk Escalation',
    'Communication Breakdown',
    'Technical Issues'
  ];

  useEffect(() => {
    if (currentWorkspace) {
      loadEscalationMatrix();
    }
  }, [currentWorkspace]);

  const loadEscalationMatrix = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_escalation_matrix')
        .select('*')
        .order('level');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading escalation matrix:', error);
      toast.error('Failed to load escalation matrix');
    } finally {
      setLoading(false);
    }
  };

  const addEscalationContact = async () => {
    if (!currentWorkspace) return;
    if (!newContact.contact_name || !newContact.contact_email || !newContact.contact_role) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('project_escalation_matrix')
        .insert({
          project_id: currentWorkspace.id, // Using workspace as project context
          level: newContact.level,
          contact_name: newContact.contact_name,
          contact_role: newContact.contact_role,
          contact_email: newContact.contact_email,
          issue_types: newContact.issue_types
        });

      if (error) throw error;

      toast.success('Escalation contact added');
      setNewContact({
        level: 1,
        contact_name: '',
        contact_role: '',
        contact_email: '',
        issue_types: []
      });
      setShowAddForm(false);
      loadEscalationMatrix();
    } catch (error) {
      console.error('Error adding escalation contact:', error);
      toast.error('Failed to add escalation contact');
    }
  };

  const removeEscalationContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from('project_escalation_matrix')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      toast.success('Escalation contact removed');
      loadEscalationMatrix();
    } catch (error) {
      console.error('Error removing escalation contact:', error);
      toast.error('Failed to remove escalation contact');
    }
  };

  const toggleIssueType = (issueType: string) => {
    setNewContact(prev => ({
      ...prev,
      issue_types: prev.issue_types.includes(issueType)
        ? prev.issue_types.filter(type => type !== issueType)
        : [...prev.issue_types, issueType]
    }));
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading escalation matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Escalation Matrix</h3>
          <p className="text-sm text-muted-foreground">
            Define escalation contacts for different issue types and severity levels
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Escalation Contact</CardTitle>
            <CardDescription>Define a new escalation contact for issue management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Escalation Level</Label>
                <Select value={newContact.level.toString()} onValueChange={(value) => setNewContact(prev => ({ ...prev, level: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1 - Team Lead</SelectItem>
                    <SelectItem value="2">Level 2 - Project Manager</SelectItem>
                    <SelectItem value="3">Level 3 - Department Head</SelectItem>
                    <SelectItem value="4">Level 4 - Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Name</Label>
                <Input
                  id="contact_name"
                  value={newContact.contact_name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, contact_name: e.target.value }))}
                  placeholder="Enter contact name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_role">Role/Title</Label>
                <Input
                  id="contact_role"
                  value={newContact.contact_role}
                  onChange={(e) => setNewContact(prev => ({ ...prev, contact_role: e.target.value }))}
                  placeholder="Enter role or title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={newContact.contact_email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Issue Types</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {issueTypeOptions.map((issueType) => (
                  <div
                    key={issueType}
                    onClick={() => toggleIssueType(issueType)}
                    className={`p-2 rounded cursor-pointer text-sm border transition-colors ${
                      newContact.issue_types.includes(issueType)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:bg-muted'
                    }`}
                  >
                    {issueType}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={addEscalationContact}>Add Contact</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-base">{contact.contact_name}</CardTitle>
                    <CardDescription>{contact.contact_role}</CardDescription>
                  </div>
                </div>
                <Badge className={getLevelColor(contact.level)}>
                  Level {contact.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.contact_email}</span>
              </div>

              {contact.issue_types && contact.issue_types.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Handles:</p>
                  <div className="flex flex-wrap gap-1">
                    {contact.issue_types.map((issueType, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {issueType}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeEscalationContact(contact.id)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {contacts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">No escalation contacts defined</p>
            <Button onClick={() => setShowAddForm(true)}>
              Add First Contact
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EscalationMatrixTab;
