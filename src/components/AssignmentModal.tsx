import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (assignmentData: any) => void;
  resourceData: { id: string; name: string }[];
  projectData: { id: string; name: string }[];
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({ isOpen, onClose, onAssign, resourceData, projectData }) => {
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [assignmentRole, setAssignmentRole] = useState<string>('');
  const [allocation, setAllocation] = useState<number>(100);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleAssign = () => {
    if (!selectedResource || !selectedProject || !assignmentRole || !startDate || !endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const assignmentData = {
      resourceId: selectedResource,
      projectId: selectedProject,
      role: assignmentRole,
      allocation,
      startDate,
      endDate,
    };

    onAssign(assignmentData);
    
    // Reset form
    setSelectedResource('');
    setSelectedProject('');
    setAssignmentRole('');
    setAllocation(100);
    setStartDate('');
    setEndDate('');
    
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setSelectedResource('');
    setSelectedProject('');
    setAssignmentRole('');
    setAllocation(100);
    setStartDate('');
    setEndDate('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Resource to Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="resource">Resource</Label>
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger>
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                {resourceData.map((resource) => (
                  <SelectItem key={resource.id} value={resource.id}>
                    {resource.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="project">Project</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projectData.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={assignmentRole} onValueChange={setAssignmentRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Developer">Developer</SelectItem>
                <SelectItem value="Designer">Designer</SelectItem>
                <SelectItem value="Project Manager">Project Manager</SelectItem>
                <SelectItem value="QA Engineer">QA Engineer</SelectItem>
                <SelectItem value="Business Analyst">Business Analyst</SelectItem>
                <SelectItem value="DevOps Engineer">DevOps Engineer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="allocation">Allocation (%)</Label>
            <Input
              type="number"
              value={allocation}
              onChange={(e) => setAllocation(parseInt(e.target.value) || 0)}
              min={1}
              max={100}
              placeholder="100"
            />
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign}>
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentModal;
