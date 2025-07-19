import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface ResourceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: any) => Promise<void>;
  resource?: {
    id: string;
    name: string;
    email: string;
    role: string;
    workspaceId: string;
  };
}

interface FormData {
  name: string;
  email: string;
  role: string;
  workspace_id: string;
}

const ResourceForm = ({ isOpen, onClose, onSave, resource }: ResourceFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: '',
    workspace_id: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (currentWorkspace) {
      setFormData(prev => ({ ...prev, workspace_id: currentWorkspace.id }));
    }
  }, [currentWorkspace]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name,
        email: resource.email,
        role: resource.role,
        workspace_id: resource.workspaceId
      });
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        workspace_id: formData.workspace_id
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: '',
        workspace_id: currentWorkspace?.id || ''
      });
      
      toast.success(resource ? 'Resource updated successfully' : 'Resource created successfully');
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{resource ? 'Edit Resource' : 'Create New Resource'}</DialogTitle>
          <DialogDescription>
            {resource ? 'Update resource details here.' : 'Add a new team member to your workspace.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="col-span-3"
              placeholder="Resource Name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="col-span-3"
              placeholder="email@example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="col-span-3"
              placeholder="e.g. Software Engineer"
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceForm;
