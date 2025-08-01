
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResourceCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const ResourceCreationModal: React.FC<ResourceCreationModalProps> = ({
  open,
  onOpenChange,
  onCreated
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Resource</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Resource name" />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Input id="type" placeholder="Resource type" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              onCreated();
              onOpenChange(false);
            }}>
              Create Resource
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourceCreationModal;
