
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, Mail, Building2, Loader2 } from 'lucide-react';
import { useRecipients, type Recipient } from '@/hooks/useRecipients';

interface RecipientSelectorProps {
  selectedRecipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({ selectedRecipients, onRecipientsChange }) => {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const { recipients, departments, loading, error, getRecipientsByType } = useRecipients();

  const stakeholders = getRecipientsByType('stakeholder');
  const resources = getRecipientsByType('resource');
  const workspaceMembers = getRecipientsByType('workspace_member');

  const handleIndividualToggle = (recipientId: string) => {
    const updated = selectedRecipients.includes(recipientId)
      ? selectedRecipients.filter(id => id !== recipientId)
      : [...selectedRecipients, recipientId];
    onRecipientsChange(updated);
  };

  const handleDepartmentToggle = (department: string) => {
    const allInDept = recipients.filter(r => r.department === department);
    const allDeptIds = allInDept.map(r => r.id);
    
    const isSelected = selectedDepartments.includes(department);
    
    if (isSelected) {
      setSelectedDepartments(prev => prev.filter(d => d !== department));
      onRecipientsChange(selectedRecipients.filter(id => !allDeptIds.includes(id)));
    } else {
      setSelectedDepartments(prev => [...prev, department]);
      const newRecipients = [...new Set([...selectedRecipients, ...allDeptIds])];
      onRecipientsChange(newRecipients);
    }
  };

  const RecipientList = ({ recipients, title }: { recipients: Recipient[], title: string }) => (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">{title}</h4>
      {recipients.map((recipient) => (
        <div key={recipient.id} className="flex items-center space-x-3 p-2 rounded border">
          <Checkbox
            id={recipient.id}
            checked={selectedRecipients.includes(recipient.id)}
            onCheckedChange={() => handleIndividualToggle(recipient.id)}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{recipient.name}</span>
              <Badge variant="outline">{recipient.role}</Badge>
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Mail className="h-3 w-3" />
              {recipient.email}
            </div>
          </div>
          <Badge>{recipient.department}</Badge>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading recipients...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading recipients: {error}</p>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-2">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Select Recipients
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedRecipients.length} selected</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="individual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="department">By Department</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            {workspaceMembers.length > 0 && (
              <RecipientList recipients={workspaceMembers} title="Workspace Members" />
            )}
            {stakeholders.length > 0 && (
              <RecipientList recipients={stakeholders} title="Stakeholders" />
            )}
            {resources.length > 0 && (
              <RecipientList recipients={resources} title="Resources" />
            )}
            {recipients.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No recipients found in this workspace.
              </div>
            )}
          </TabsContent>

          <TabsContent value="department" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Departments</h4>
              {departments.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  No departments found.
                </div>
              ) : (
                departments.map((dept) => {
                  const deptCount = recipients.filter(r => r.department === dept).length;
                  return (
                    <div key={dept} className="flex items-center space-x-3 p-2 rounded border">
                      <Checkbox
                        id={dept}
                        checked={selectedDepartments.includes(dept)}
                        onCheckedChange={() => handleDepartmentToggle(dept)}
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <Building2 className="h-4 w-4" />
                        <span className="font-medium">{dept}</span>
                        <Badge variant="outline">{deptCount} members</Badge>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecipientSelector;
