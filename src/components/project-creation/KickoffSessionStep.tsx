
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemeCard } from '@/components/ui/theme-card';
import { 
  Upload, FileText, Users, Target, Plus, X, 
  CheckCircle, Clock, AlertCircle 
} from 'lucide-react';

interface KickoffData {
  documents: File[];
  meetingMinutes: string;
  objectives: string[];
}

interface KickoffSessionStepProps {
  data: { kickoffData: KickoffData };
  onDataChange: (data: any) => void;
}

const KickoffSessionStep: React.FC<KickoffSessionStepProps> = ({ data, onDataChange }) => {
  const [newObjective, setNewObjective] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    setUploadStatus('uploading');
    
    // Simulate upload process
    setTimeout(() => {
      const newFiles = Array.from(files);
      onDataChange({
        kickoffData: {
          ...data.kickoffData,
          documents: [...data.kickoffData.documents, ...newFiles]
        }
      });
      setUploadStatus('success');
      
      setTimeout(() => setUploadStatus('idle'), 2000);
    }, 1500);
  };

  const removeDocument = (index: number) => {
    const updatedDocs = data.kickoffData.documents.filter((_, i) => i !== index);
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
    const updatedObjectives = data.kickoffData.objectives.filter((_, i) => i !== index);
    onDataChange({
      kickoffData: {
        ...data.kickoffData,
        objectives: updatedObjectives
      }
    });
  };

  const getUploadStatusVariant = (): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (uploadStatus) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'uploading': return 'info';
      default: return 'default';
    }
  };

  const getUploadStatusIcon = () => {
    switch (uploadStatus) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      case 'uploading': return <Clock className="h-4 w-4 animate-spin" />;
      default: return <Upload className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Project Kickoff Session</h2>
        <p className="text-muted-foreground">
          Upload documents, record meeting minutes, and define project objectives
        </p>
      </div>

      {/* Document Upload */}
      <ThemeCard variant="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Documents
          </CardTitle>
          <CardDescription>
            Upload project requirements, specifications, and kickoff materials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.md"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="document-upload"
              disabled={uploadStatus === 'uploading'}
            />
            <label htmlFor="document-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                {getUploadStatusIcon()}
                <div>
                  <p className="font-medium">
                    {uploadStatus === 'uploading' ? 'Uploading...' : 'Drop files here or click to upload'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF, DOC, DOCX, TXT, MD files
                  </p>
                </div>
              </div>
            </label>
          </div>

          {uploadStatus !== 'idle' && (
            <StatusBadge variant={getUploadStatusVariant()}>
              {uploadStatus === 'uploading' && 'Uploading documents...'}
              {uploadStatus === 'success' && 'Documents uploaded successfully'}
              {uploadStatus === 'error' && 'Upload failed, please try again'}
            </StatusBadge>
          )}

          {data.kickoffData.documents.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Uploaded Documents</h4>
              {data.kickoffData.documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{doc.name}</span>
                    <StatusBadge variant="success">
                      {(doc.size / 1024).toFixed(1)} KB
                    </StatusBadge>
                  </div>
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
          )}
        </CardContent>
      </ThemeCard>

      {/* Meeting Minutes */}
      <ThemeCard variant="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Meeting Minutes
          </CardTitle>
          <CardDescription>
            Record key discussion points, decisions, and action items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter meeting minutes, key decisions, and action items..."
            value={data.kickoffData.meetingMinutes}
            onChange={(e) => onDataChange({
              kickoffData: {
                ...data.kickoffData,
                meetingMinutes: e.target.value
              }
            })}
            rows={6}
            className="resize-none"
          />
        </CardContent>
      </ThemeCard>

      {/* Project Objectives */}
      <ThemeCard variant="surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Project Objectives
          </CardTitle>
          <CardDescription>
            Define clear, measurable project objectives and success criteria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter a project objective..."
              value={newObjective}
              onChange={(e) => setNewObjective(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addObjective()}
            />
            <Button onClick={addObjective} disabled={!newObjective.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {data.kickoffData.objectives.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Defined Objectives</h4>
              {data.kickoffData.objectives.map((objective, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-surface-muted rounded-lg border border-border">
                  <div className="flex items-center gap-2">
                    <StatusBadge variant="info">
                      {index + 1}
                    </StatusBadge>
                    <span className="text-sm">{objective}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeObjective(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </ThemeCard>

      {/* Progress Summary */}
      <ThemeCard variant="elevated">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Kickoff Session Progress</h4>
              <p className="text-sm text-muted-foreground">
                Complete all sections to proceed to requirements gathering
              </p>
            </div>
            <div className="text-right">
              <StatusBadge variant={
                data.kickoffData.documents.length > 0 && 
                data.kickoffData.meetingMinutes && 
                data.kickoffData.objectives.length > 0 
                  ? 'success' 
                  : 'warning'
              }>
                {data.kickoffData.documents.length > 0 && data.kickoffData.meetingMinutes && data.kickoffData.objectives.length > 0 
                  ? 'Complete' 
                  : 'In Progress'
                }
              </StatusBadge>
            </div>
          </div>
        </CardContent>
      </ThemeCard>
    </div>
  );
};

export default KickoffSessionStep;
