
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileCheck, Users, Download, Send, CheckCircle } from 'lucide-react';

interface ProjectInitiationStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const ProjectInitiationStep: React.FC<ProjectInitiationStepProps> = ({ data, onDataChange }) => {
  const [newSignatory, setNewSignatory] = useState({ name: '', email: '', role: '' });

  const generateInitiationDocument = () => {
    const document = `# PROJECT INITIATION DOCUMENT
## ${data.name || 'Project Name'}

### Project Overview
**Description:** ${data.description || 'No description provided'}

**Project Manager:** [To be assigned]
**Start Date:** ${data.resources?.timeline?.start || 'TBD'}
**End Date:** ${data.resources?.timeline?.end || 'TBD'}
**Budget:** ${data.resources?.budget || 'TBD'}

### Project Objectives
${data.kickoffData?.objectives?.map((obj: string, i: number) => `${i + 1}. ${obj}`).join('\n') || 'No objectives defined'}

### Key Requirements
#### Functional Requirements
${data.requirements?.functional?.map((req: string, i: number) => `- ${req}`).join('\n') || 'None specified'}

#### Non-Functional Requirements
${data.requirements?.nonFunctional?.map((req: string, i: number) => `- ${req}`).join('\n') || 'None specified'}

### Team Members
${data.resources?.teamMembers?.map((member: any) => `- ${member.name} - ${member.role} (${member.allocation}%)`).join('\n') || 'No team members assigned'}

### Success Criteria
- All functional requirements delivered
- Project completed within budget
- Project delivered on schedule
- Stakeholder acceptance achieved

### Approval
This document has been reviewed and approved by the following stakeholders:

${data.initiation?.signatures?.map((sig: any) => `- ${sig.name} (${sig.role}) - ${sig.signed ? 'SIGNED' : 'PENDING'}`).join('\n') || 'No signatures'}

---
Document generated on: ${new Date().toLocaleDateString()}`;

    onDataChange({
      initiation: {
        ...data.initiation,
        document
      }
    });
  };

  const addSignatory = () => {
    if (newSignatory.name && newSignatory.email && newSignatory.role) {
      onDataChange({
        initiation: {
          ...data.initiation,
          signatures: [
            ...(data.initiation?.signatures || []),
            {
              ...newSignatory,
              signed: false,
              timestamp: null
            }
          ]
        }
      });
      setNewSignatory({ name: '', email: '', role: '' });
    }
  };

  const toggleSignature = (index: number) => {
    const updatedSignatures = [...(data.initiation?.signatures || [])];
    updatedSignatures[index] = {
      ...updatedSignatures[index],
      signed: !updatedSignatures[index].signed,
      timestamp: updatedSignatures[index].signed ? null : new Date().toISOString()
    };
    
    onDataChange({
      initiation: {
        ...data.initiation,
        signatures: updatedSignatures
      }
    });
  };

  const sendForSignature = () => {
    // Simulate sending for digital signature
    alert('Signature requests sent to all stakeholders via email!');
  };

  const downloadDocument = () => {
    const content = data.initiation?.document || '';
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name || 'project'}-initiation-document.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const allSigned = data.initiation?.signatures?.length > 0 && 
    data.initiation.signatures.every((sig: any) => sig.signed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">Project Initiation Document</h3>
          <p className="text-muted-foreground">
            Generate the final project initiation document and collect digital signatures.
          </p>
        </div>
        <Button onClick={generateInitiationDocument} className="flex items-center gap-2">
          <FileCheck className="h-4 w-4" />
          Generate Document
        </Button>
      </div>

      {data.initiation?.document && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Project Initiation Document
            </CardTitle>
            <CardDescription>Review and edit the generated document</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={data.initiation.document}
              onChange={(e) => onDataChange({
                initiation: {
                  ...data.initiation,
                  document: e.target.value
                }
              })}
              rows={15}
              className="font-mono text-sm"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={downloadDocument} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Digital Signatures
          </CardTitle>
          <CardDescription>Add signatories and collect approvals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="signatory-name">Name</Label>
              <Input
                id="signatory-name"
                placeholder="Full name"
                value={newSignatory.name}
                onChange={(e) => setNewSignatory({...newSignatory, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="signatory-email">Email</Label>
              <Input
                id="signatory-email"
                placeholder="email@company.com"
                value={newSignatory.email}
                onChange={(e) => setNewSignatory({...newSignatory, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="signatory-role">Role</Label>
              <Input
                id="signatory-role"
                placeholder="Title/Role"
                value={newSignatory.role}
                onChange={(e) => setNewSignatory({...newSignatory, role: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addSignatory} className="w-full">
                Add Signatory
              </Button>
            </div>
          </div>

          {data.initiation?.signatures?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Required Signatures</Label>
                <Button onClick={sendForSignature} variant="outline" size="sm" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send for Signature
                </Button>
              </div>
              <div className="space-y-2">
                {data.initiation.signatures.map((signatory: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={signatory.signed}
                        onCheckedChange={() => toggleSignature(index)}
                      />
                      <div>
                        <div className="font-medium">{signatory.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {signatory.role} • {signatory.email}
                        </div>
                        {signatory.signed && signatory.timestamp && (
                          <div className="text-xs text-green-600">
                            Signed on {new Date(signatory.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={signatory.signed ? "default" : "secondary"}>
                      {signatory.signed ? "Signed" : "Pending"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {allSigned && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">All signatures collected!</div>
                <div className="text-sm text-green-600">Your project is ready to begin.</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectInitiationStep;
