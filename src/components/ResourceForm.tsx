
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { X, Plus } from 'lucide-react';

interface Resource {
  id?: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  location: string;
  skills: string[];
  availability: number;
  hourlyRate: string;
  status: 'Available' | 'Busy' | 'Overallocated';
}

interface ResourceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Resource) => void;
  resource?: Resource;
}

const ResourceForm = ({ isOpen, onClose, onSave, resource }: ResourceFormProps) => {
  const [formData, setFormData] = useState<Resource>({
    name: resource?.name || '',
    role: resource?.role || '',
    department: resource?.department || '',
    email: resource?.email || '',
    phone: resource?.phone || '',
    location: resource?.location || '',
    skills: resource?.skills || [],
    availability: resource?.availability || 100,
    hourlyRate: resource?.hourlyRate || '',
    status: resource?.status || 'Available',
  });

  const [newSkill, setNewSkill] = useState('');

  const departments = ['Engineering', 'Design', 'Marketing', 'Operations', 'Sales', 'HR'];
  const commonSkills = ['React', 'TypeScript', 'Node.js', 'Python', 'Figma', 'UI/UX', 'Project Management', 'Agile', 'SEO', 'Content Marketing'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{resource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => setFormData({ ...formData, department: value })}>
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
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Busy">Busy</SelectItem>
                  <SelectItem value="Overallocated">Overallocated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate</Label>
              <Input
                id="hourlyRate"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="$85/hr"
                required
              />
            </div>
          </div>

          <div>
            <Label>Availability ({formData.availability}%)</Label>
            <Slider
              value={[formData.availability]}
              onValueChange={(value) => setFormData({ ...formData, availability: value[0] })}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Skills</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill(newSkill))}
                />
                <Button
                  type="button"
                  onClick={() => addSkill(newSkill)}
                  size="sm"
                >
                  <Plus size={16} />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1">
                <span className="text-sm text-muted-foreground mr-2">Quick add:</span>
                {commonSkills.filter(skill => !formData.skills.includes(skill)).map(skill => (
                  <Button
                    key={skill}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSkill(skill)}
                    className="text-xs"
                  >
                    + {skill}
                  </Button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-1">
                {formData.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-destructive"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {resource ? 'Update Resource' : 'Add Resource'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceForm;
