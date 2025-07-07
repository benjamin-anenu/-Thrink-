
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  communicationPreference: 'email' | 'phone' | 'slack' | 'teams';
  escalationLevel: number;
  influence: 'high' | 'medium' | 'low';
  interest: 'high' | 'medium' | 'low';
  projects: string[];
  notes?: string;
}

interface StakeholderFormProps {
  open: boolean;
  onClose: () => void;
  stakeholder?: Stakeholder;
  onSave: (stakeholder: Stakeholder) => void;
}

const StakeholderForm = ({ open, onClose, stakeholder, onSave }: StakeholderFormProps) => {
  const [formData, setFormData] = useState<Stakeholder>(
    stakeholder || {
      id: '',
      name: '',
      role: '',
      department: '',
      email: '',
      phone: '',
      communicationPreference: 'email',
      escalationLevel: 1,
      influence: 'medium',
      interest: 'medium',
      projects: [],
      notes: ''
    }
  );

  const [newProject, setNewProject] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stakeholderToSave = {
      ...formData,
      id: formData.id || Date.now().toString()
    };
    onSave(stakeholderToSave);
    onClose();
  };

  const addProject = () => {
    if (newProject.trim() && !formData.projects.includes(newProject.trim())) {
      setFormData({
        ...formData,
        projects: [...formData.projects, newProject.trim()]
      });
      setNewProject('');
    }
  };

  const removeProject = (project: string) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter(p => p !== project)
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
                value={formData.role}
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
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escalationLevel">Escalation Level</Label>
              <Select
                value={formData.escalationLevel.toString()}
                onValueChange={(value) => setFormData({ ...formData, escalationLevel: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Level 1 - Team Lead</SelectItem>
                  <SelectItem value="2">Level 2 - Manager</SelectItem>
                  <SelectItem value="3">Level 3 - Director</SelectItem>
                  <SelectItem value="4">Level 4 - Executive</SelectItem>
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
                onValueChange={(value: any) => setFormData({ ...formData, communicationPreference: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="teams">Teams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Influence Level</Label>
              <Select
                value={formData.influence}
                onValueChange={(value: any) => setFormData({ ...formData, influence: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Interest Level</Label>
              <Select
                value={formData.interest}
                onValueChange={(value: any) => setFormData({ ...formData, interest: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
              {formData.projects.map((project, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{project}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeProject(project)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this stakeholder..."
              rows={3}
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
