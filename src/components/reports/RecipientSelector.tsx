
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, Mail, Building2 } from 'lucide-react';

interface Recipient {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  type: 'stakeholder' | 'resource';
}

interface RecipientSelectorProps {
  selectedRecipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({ selectedRecipients, onRecipientsChange }) => {
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const stakeholders: Recipient[] = [
    { id: 'sh-1', name: 'John Smith', email: 'john@company.com', department: 'Executive', role: 'CEO', type: 'stakeholder' },
    { id: 'sh-2', name: 'Sarah Johnson', email: 'sarah@company.com', department: 'Product', role: 'Product Manager', type: 'stakeholder' },
    { id: 'sh-3', name: 'Mike Wilson', email: 'mike@company.com', department: 'Engineering', role: 'CTO', type: 'stakeholder' }
  ];

  const resources: Recipient[] = [
    { id: 'res-1', name: 'Alice Brown', email: 'alice@company.com', department: 'Engineering', role: 'Senior Developer', type: 'resource' },
    { id: 'res-2', name: 'Bob Davis', email: 'bob@company.com', department: 'Design', role: 'UI Designer', type: 'resource' },
    { id: 'res-3', name: 'Carol Miller', email: 'carol@company.com', department: 'QA', role: 'QA Engineer', type: 'resource' }
  ];

  const departments = ['Executive', 'Product', 'Engineering', 'Design', 'QA'];

  const handleIndividualToggle = (recipientId: string) => {
    const updated = selectedRecipients.includes(recipientId)
      ? selectedRecipients.filter(id => id !== recipientId)
      : [...selectedRecipients, recipientId];
    onRecipientsChange(updated);
  };

  const handleDepartmentToggle = (department: string) => {
    const allInDept = [...stakeholders, ...resources].filter(r => r.department === department);
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
            <RecipientList recipients={stakeholders} title="Stakeholders" />
            <RecipientList recipients={resources} title="Resources" />
          </TabsContent>

          <TabsContent value="department" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Departments</h4>
              {departments.map((dept) => {
                const deptCount = [...stakeholders, ...resources].filter(r => r.department === dept).length;
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
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecipientSelector;
