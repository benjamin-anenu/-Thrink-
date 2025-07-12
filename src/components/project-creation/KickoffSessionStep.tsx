
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Plus, X } from 'lucide-react';

interface KickoffSessionStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const KickoffSessionStep: React.FC<KickoffSessionStepProps> = ({ data, onDataChange }) => {
  const [newObjective, setNewObjective] = useState('');

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onDataChange({
      kickoffData: {
        ...data.kickoffData,
        documents: [...data.kickoffData.documents, ...files]
      }
    });
  };

  const removeDocument = (index: number) => {
    const updatedDocs = data.kickoffData.documents.filter((_: any, i: number) => i !== index);
    onDataChange({
      kickoffData: {
        ...data.kickoffData,
        documents: updatedDocs
      }
    });
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      onDataChange({
        kickoffData: {
          ...data.kickoffData,
          objectives: [...data.kickoffData.objectives, newObjective.trim()]
        }
      });
      setNewObjective('');
    }
  };

  const removeObjective = (index: number) => {
    const updatedObjectives = data.kickoffData.objectives.filter((_: any, i: number) => i !== index);
    onDataChange({
      kickoffData: {
        ...data.kickoffData,
        objectives: updatedObjectives
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Project Kickoff Session</h3>
        <p className="text-muted-foreground">
          Start your project with comprehensive documentation and clear objectives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Basics
            </CardTitle>
            <CardDescription>Define your project name and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={data.name}
                onChange={(e) => onDataChange({ name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="project-description">Project Description</Label>
              <Textarea
                id="project-description"
                placeholder="Describe your project goals and scope"
                value={data.description}
                onChange={(e) => onDataChange({ description: e.target.value })}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Upload
            </CardTitle>
            <CardDescription>Upload relevant documents and files</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="document-upload">Upload Documents</Label>
              <Input
                id="document-upload"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                onChange={handleDocumentUpload}
                className="cursor-pointer"
              />
            </div>
            {data.kickoffData.documents.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Documents</Label>
                <div className="space-y-2">
                  {data.kickoffData.documents.map((doc: File, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{doc.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Minutes & Notes</CardTitle>
          <CardDescription>Record key discussion points and decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter meeting minutes, key decisions, and important notes from the kickoff session..."
            value={data.kickoffData.meetingMinutes}
            onChange={(e) => onDataChange({
              kickoffData: {
                ...data.kickoffData,
                meetingMinutes: e.target.value
              }
            })}
            rows={6}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Objectives</CardTitle>
          <CardDescription>Define clear, measurable project objectives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a project objective"
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addObjective()}
            />
            <Button onClick={addObjective}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {data.kickoffData.objectives.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.kickoffData.objectives.map((objective: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {objective}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => removeObjective(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KickoffSessionStep;
