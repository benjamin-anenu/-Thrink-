
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Stakeholder } from '@/contexts/StakeholderContext';

interface StakeholderFormProps {
  open: boolean;
  onClose: () => void;
  stakeholder?: Stakeholder;
  onSave: (stakeholder: Stakeholder) => void;
}

const StakeholderForm = ({ open, onClose, stakeholder, onSave }: StakeholderFormProps) => {
  const [formData, setFormData] = useState<Stakeholder>({
    id: '',
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

  useEffect(() => {
    if (stakeholder) {
      setFormData({
        ...stakeholder,
        department: stakeholder.department || '',
        phone: stakeholder.phone || '',
        communicationPreference: stakeholder.communicationPreference || 'Email',
        influence: stakeholder.influence || 'Medium',
        interest: stakeholder.interest || 'Medium',
        projects: stakeholder.projects || [],
        status: stakeholder.status || 'Active',
        lastContact: stakeholder.lastContact || new Date().toISOString().split('T')[0]
      });
    } else {
      setFormData({
        id: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

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
                value={formData.role || ''}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'Active'}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
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
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Communication Preference</Label>
              <Select
                value={formData.communicationPreference || 'Email'}
                onValueChange={(value) => setFormData({ ...formData, communicationPreference: value })}
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
                value={formData.influence || 'Medium'}
                onValueChange={(value) => setFormData({ ...formData, influence: value })}
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
                value={formData.interest || 'Medium'}
                onValueChange={(value) => setFormData({ ...formData, interest: value })}
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
            <div className="flex space-x-2">
              <Input
                placeholder="Enter project name"
                value={newProject}
                onChange={(e) => setNewProject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addProject())}
              />
              <Button type="button" onClick={addProject}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(formData.projects || []).map((project, index) => (
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
              value={formData.lastContact || new Date().toISOString().split('T')[0]}
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
