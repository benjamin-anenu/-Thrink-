
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useDepartments } from '@/hooks/useDepartments';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface StakeholderFormData {
  id?: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  communicationPreference: 'Email' | 'Phone' | 'Slack' | 'In-person';
  influence: 'High' | 'Medium' | 'Low';
  interest: 'High' | 'Medium' | 'Low';
  projects: string[];
  status: 'Active' | 'Inactive';
  lastContact: string;
}

interface StakeholderFormProps {
  open: boolean;
  onClose: () => void;
  stakeholder?: any;
  onSave: (stakeholder: any) => void;
}

const StakeholderForm = ({ open, onClose, stakeholder, onSave }: StakeholderFormProps) => {
  const [formData, setFormData] = useState<StakeholderFormData>({
    name: '',
    role: '',
    department: '',
    email: '',
    phone: '',
    communicationPreference: 'Email',
    influence: 'Medium',
    interest: 'Medium',
    projects: [],
    status: 'Active',
    lastContact: new Date().toISOString().split('T')[0]
  });

  const [newProject, setNewProject] = useState('');

  const { currentWorkspace } = useWorkspace();
  const { departments: rawDepartments, loading: departmentsLoading } = useDepartments();
  const { projects: rawProjects, loading: projectsLoading } = useProjects();
  const departments = rawDepartments || [];
  const projects = rawProjects || [];

  useEffect(() => {
    if (stakeholder) {
      setFormData({
        ...stakeholder,
        projects: stakeholder.projects || [],
        lastContact: stakeholder.lastContact || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        name: '',
        role: '',
        department: '',
        email: '',
        phone: '',
        communicationPreference: 'Email',
        influence: 'Medium',
        interest: 'Medium',
        projects: [],
        status: 'Active',
        lastContact: new Date().toISOString().split('T')[0]
      });
    }
  }, [stakeholder, open]);

  const addProject = () => {
    if (newProject.trim() && !(formData.projects || []).includes(newProject.trim())) {
      setFormData({
        ...formData,
        projects: [...(formData.projects || []), newProject.trim()]
      });
      setNewProject('');
    }
  };

  const removeProject = (project: string) => {
    setFormData({
      ...formData,
      projects: (formData.projects || []).filter(p => p !== project)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {stakeholder ? 'Edit Stakeholder' : 'Add New Stakeholder'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role/Title *</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={value => setFormData({ ...formData, department: value })}
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
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'Active' | 'Inactive') => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Communication Preference</Label>
              <Select
                value={formData.communicationPreference}
                onValueChange={(value: 'Email' | 'Phone' | 'Slack' | 'In-person') => 
                  setFormData({ ...formData, communicationPreference: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="Slack">Slack</SelectItem>
                  <SelectItem value="In-person">In-person</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Influence Level</Label>
              <Select
                value={formData.influence}
                onValueChange={(value: 'High' | 'Medium' | 'Low') => 
                  setFormData({ ...formData, influence: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interest Level</Label>
              <Select
                value={formData.interest}
                onValueChange={(value: 'High' | 'Medium' | 'Low') => 
                  setFormData({ ...formData, interest: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Associated Projects</Label>
            {(projects && projects.length > 0) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 px-3 py-2 text-base rounded-md border border-input bg-background text-foreground justify-between font-normal"
                  >
                    {(formData.projects || []).length > 0
                      ? `${(formData.projects || []).length} project(s) selected`
                      : 'Select projects'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={4}
                  className="w-full min-w-[200px] max-w-full max-h-60 overflow-y-auto p-0 border border-input rounded-md bg-background text-foreground shadow-md z-50"
                  style={{ minWidth: '100%' }}
                >
                  {(projects && projects.length === 0) ? (
                    <div className="px-4 py-2 text-muted-foreground text-sm">No projects available</div>
                  ) : (
                    Array.from(new Set(projects.map(p => p.name))).map((projectName, idx) => (
                      <DropdownMenuCheckboxItem
                        key={projectName + idx}
                        checked={(formData.projects || []).includes(projectName)}
                        onCheckedChange={checked => {
                          if (checked) {
                            if (!(formData.projects || []).includes(projectName)) {
                              setFormData({
                                ...formData,
                                projects: [...(formData.projects || []), projectName]
                              });
                            }
                          } else {
                            setFormData({
                              ...formData,
                              projects: (formData.projects || []).filter(p => p !== projectName)
                            });
                          }
                        }}
                        className="text-base px-3 py-2 flex items-center gap-2"
                      >
                        <span className="ml-6">{projectName}</span>
                      </DropdownMenuCheckboxItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter project name"
                  value={newProject}
                  onChange={(e) => setNewProject(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProject())}
                />
                <Button type="button" onClick={addProject}>Add</Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2 mb-2">
              {(formData.projects ?? []).map((project, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{project}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeProject(project)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastContact">Last Contact</Label>
            <Input
              id="lastContact"
              type="date"
              value={formData.lastContact}
              onChange={(e) => setFormData({ ...formData, lastContact: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {stakeholder ? 'Update' : 'Create'} Stakeholder
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StakeholderForm;
