
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, Download, FileSpreadsheet, FileText, 
  CheckCircle, AlertCircle, Loader2, FileCheck
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setCurrentStep('mapping');
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    }
  };

  const templateFiles = [
    {
      name: 'Project Tasks Template',
      format: 'Excel (.xlsx)',
      description: 'Standard template for importing project tasks with all required fields',
      icon: FileSpreadsheet,
      size: '12 KB'
    },
    {
      name: 'Resource Planning Template', 
      format: 'CSV (.csv)',
      description: 'Template for importing team resources and skill assignments',
      icon: FileText,
      size: '8 KB'
    },
    {
      name: 'Timeline Template',
      format: 'Excel (.xlsx)', 
      description: 'Template for importing project timelines and milestones',
      icon: FileSpreadsheet,
      size: '15 KB'
    }
  ];

  const mockPreviewData = [
    { id: 1, taskName: 'UI Design Phase', assignee: 'Sarah Chen', dueDate: '2024-01-15', priority: 'High', status: 'Valid' },
    { id: 2, taskName: 'Backend API Development', assignee: 'Mike Johnson', dueDate: '2024-01-20', priority: 'High', status: 'Valid' },
    { id: 3, taskName: 'Database Schema', assignee: '', dueDate: '2024-01-10', priority: 'Medium', status: 'Missing Assignee' },
    { id: 4, taskName: 'User Testing', assignee: 'Alex Kim', dueDate: 'Invalid Date', priority: 'Low', status: 'Invalid Date' }
  ];

  const fieldMapping = [
    { source: 'Task_Name', target: 'taskName', mapped: true },
    { source: 'Due_Date', target: 'dueDate', mapped: true },
    { source: 'Assigned_To', target: 'assignee', mapped: true },
    { source: 'Priority_Level', target: 'priority', mapped: true },
    { source: 'Description', target: 'description', mapped: false },
    { source: 'Estimated_Hours', target: 'estimatedHours', mapped: false }
  ];

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center border-2 border-dashed border-border rounded-lg p-8">
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Upload Your File</h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your file here, or click to browse
        </p>
        <input
          type="file"
          accept=".xlsx,.xls,.csv,.mpp"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button asChild>
            <span className="cursor-pointer">Choose File</span>
          </Button>
        </label>
        <p className="text-xs text-muted-foreground mt-2">
          Supports Excel (.xlsx), CSV (.csv), and MS Project (.mpp) files
        </p>
      </div>

      {uploadProgress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <FileCheck className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{selectedFile?.name}</p>
                <Progress value={uploadProgress} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border-t pt-6">
        <h4 className="font-medium mb-4">Download Templates</h4>
        <div className="grid gap-4">
          {templateFiles.map((template, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <template.icon className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{template.format}</Badge>
                        <span className="text-xs text-muted-foreground">{template.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMappingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Map Your Data Fields</h3>
        <p className="text-muted-foreground">
          Match your file columns to the corresponding fields in our system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Field Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fieldMapping.map((field, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded border-2 ${field.mapped ? 'bg-green-500 border-green-500' : 'border-muted-foreground'}`}>
                    {field.mapped && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className="font-medium">{field.source}</p>
                    <p className="text-sm text-muted-foreground">Maps to: {field.target}</p>
                  </div>
                </div>
                <Badge variant={field.mapped ? "default" : "secondary"}>
                  {field.mapped ? "Mapped" : "Unmapped"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('upload')}>
          Back
        </Button>
        <Button onClick={() => setCurrentStep('preview')}>
          Continue to Preview
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Preview Import Data</h3>
        <p className="text-muted-foreground">
          Review your data before importing. Fix any validation errors shown below.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Task Name</th>
                  <th className="text-left p-2">Assignee</th>
                  <th className="text-left p-2">Due Date</th>
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockPreviewData.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-2">{row.taskName}</td>
                    <td className="p-2">{row.assignee || '-'}</td>
                    <td className="p-2">{row.dueDate}</td>
                    <td className="p-2">
                      <Badge variant="outline">{row.priority}</Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {row.status === 'Valid' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className={row.status === 'Valid' ? 'text-green-600' : 'text-yellow-600'}>
                          {row.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep('mapping')}>
          Back
        </Button>
        <Button onClick={() => setCurrentStep('importing')}>
          Import Data
        </Button>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="text-center space-y-6">
      <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
      <div>
        <h3 className="text-lg font-medium mb-2">Importing Your Data</h3>
        <p className="text-muted-foreground">
          Please wait while we process and import your tasks...
        </p>
      </div>
      <Progress value={75} className="max-w-md mx-auto" />
      <p className="text-sm text-muted-foreground">Processing 3 of 4 tasks...</p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Tasks</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs value={currentStep} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upload" disabled={currentStep !== 'upload'}>Upload</TabsTrigger>
              <TabsTrigger value="mapping" disabled={!['mapping', 'preview', 'importing'].includes(currentStep)}>Mapping</TabsTrigger>
              <TabsTrigger value="preview" disabled={!['preview', 'importing'].includes(currentStep)}>Preview</TabsTrigger>
              <TabsTrigger value="importing" disabled={currentStep !== 'importing'}>Import</TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {currentStep === 'upload' && renderUploadStep()}
              {currentStep === 'mapping' && renderMappingStep()}
              {currentStep === 'preview' && renderPreviewStep()}
              {currentStep === 'importing' && renderImportingStep()}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportModal;
