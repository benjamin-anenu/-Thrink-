
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Template, Save, Copy, Trash2 } from 'lucide-react';
import { ProjectTask } from '@/types/project';

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tasks: Array<{
    name: string;
    description: string;
    duration: number;
    dependencies: string[];
    priority: string;
    assignedRoles: string[];
  }>;
  tags: string[];
}

interface TaskTemplateManagerProps {
  templates: TaskTemplate[];
  onCreateFromTemplate: (template: TaskTemplate, parentTaskId?: string) => void;
  onSaveTemplate: (template: Omit<TaskTemplate, 'id'>) => void;
  onDeleteTemplate: (templateId: string) => void;
  availableRoles: string[];
}

const TaskTemplateManager: React.FC<TaskTemplateManagerProps> = ({
  templates,
  onCreateFromTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  availableRoles
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newTemplate, setNewTemplate] = useState<Omit<TaskTemplate, 'id'>>({
    name: '',
    description: '',
    category: 'Custom',
    tasks: [],
    tags: []
  });

  const categories = ['Development', 'Marketing', 'Design', 'Research', 'Custom'];
  
  const predefinedTemplates: TaskTemplate[] = [
    {
      id: 'software-feature',
      name: 'Software Feature Development',
      description: 'Complete workflow for developing a new software feature',
      category: 'Development',
      tasks: [
        {
          name: 'Requirements Analysis',
          description: 'Gather and document feature requirements',
          duration: 3,
          dependencies: [],
          priority: 'High',
          assignedRoles: ['Product Manager', 'Business Analyst']
        },
        {
          name: 'Technical Design',
          description: 'Create technical specifications and architecture',
          duration: 5,
          dependencies: ['Requirements Analysis'],
          priority: 'High',
          assignedRoles: ['Lead Developer', 'Architect']
        },
        {
          name: 'Development Implementation',
          description: 'Code the feature according to specifications',
          duration: 10,
          dependencies: ['Technical Design'],
          priority: 'High',
          assignedRoles: ['Developer']
        },
        {
          name: 'Unit Testing',
          description: 'Write and execute unit tests',
          duration: 3,
          dependencies: ['Development Implementation'],
          priority: 'Medium',
          assignedRoles: ['Developer']
        },
        {
          name: 'Integration Testing',
          description: 'Test feature integration with existing system',
          duration: 4,
          dependencies: ['Unit Testing'],
          priority: 'High',
          assignedRoles: ['QA Engineer']
        },
        {
          name: 'User Acceptance Testing',
          description: 'Validate feature meets user requirements',
          duration: 3,
          dependencies: ['Integration Testing'],
          priority: 'High',
          assignedRoles: ['Product Manager', 'QA Engineer']
        }
      ],
      tags: ['development', 'feature', 'software']
    },
    {
      id: 'marketing-campaign',
      name: 'Marketing Campaign Launch',
      description: 'End-to-end marketing campaign execution',
      category: 'Marketing',
      tasks: [
        {
          name: 'Campaign Strategy',
          description: 'Define campaign objectives and target audience',
          duration: 5,
          dependencies: [],
          priority: 'High',
          assignedRoles: ['Marketing Manager', 'Strategist']
        },
        {
          name: 'Content Creation',
          description: 'Create campaign materials and content',
          duration: 7,
          dependencies: ['Campaign Strategy'],
          priority: 'High',
          assignedRoles: ['Content Creator', 'Designer']
        },
        {
          name: 'Channel Setup',
          description: 'Configure marketing channels and platforms',
          duration: 3,
          dependencies: ['Campaign Strategy'],
          priority: 'Medium',
          assignedRoles: ['Digital Marketer']
        },
        {
          name: 'Campaign Launch',
          description: 'Execute campaign across all channels',
          duration: 1,
          dependencies: ['Content Creation', 'Channel Setup'],
          priority: 'Critical',
          assignedRoles: ['Marketing Manager']
        },
        {
          name: 'Performance Monitoring',
          description: 'Track and analyze campaign performance',
          duration: 14,
          dependencies: ['Campaign Launch'],
          priority: 'Medium',
          assignedRoles: ['Marketing Analyst']
        }
      ],
      tags: ['marketing', 'campaign', 'launch']
    }
  ];

  const allTemplates = [...predefinedTemplates, ...templates];
  
  const filteredTemplates = selectedCategory 
    ? allTemplates.filter(template => template.category === selectedCategory)
    : allTemplates;

  const handleSaveTemplate = () => {
    if (newTemplate.name && newTemplate.tasks.length > 0) {
      onSaveTemplate(newTemplate);
      setNewTemplate({
        name: '',
        description: '',
        category: 'Custom',
        tasks: [],
        tags: []
      });
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Templates</h3>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Template className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Task Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    placeholder="Describe what this template is for"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {template.category}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onCreateFromTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {!predefinedTemplates.find(t => t.id === template.id) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {template.description}
              </p>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  {template.tasks.length} tasks
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TaskTemplateManager;
