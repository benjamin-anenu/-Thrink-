
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast"
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';

interface StakeholderManagementStepProps {
  data: any;
  onDataChange: (data: any) => void;
  onUpdate: (stepData: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const StakeholderManagementStep: React.FC<StakeholderManagementStepProps> = ({
  data,
  onDataChange,
  onUpdate,
  onNext,
  onPrevious
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    influence: 'medium'
  });
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast()

  useEffect(() => {
    onDataChange({ stakeholders: data.stakeholders });
  }, [data.stakeholders, onDataChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (formData.name && formData.email && formData.role && formData.influence) {
      const newStakeholder = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        influence_level: formData.influence,
        workspace_id: currentWorkspace?.id || ''
      };

      try {
        const { data: result, error } = await supabase
          .from('stakeholders')
          .insert([newStakeholder])
          .select();

        if (error) {
          console.error("Error adding stakeholder:", error);
          toast({
            title: "Error",
            description: "Failed to add stakeholder",
            variant: "destructive"
          });
          return;
        }

        if (result) {
          setFormData({
            name: '',
            email: '',
            role: '',
            influence: 'medium'
          });
          toast({
            title: "Success",
            description: "Stakeholder added successfully"
          });
        }
      } catch (error) {
        console.error("Error adding stakeholder:", error);
        toast({
          title: "Error",
          description: "Failed to add stakeholder",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add Stakeholders</CardTitle>
          <CardDescription>
            Identify key stakeholders for your project.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                type="text"
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="influence">Influence</Label>
              <Select name="influence" value={formData.influence} onValueChange={(value) => setFormData(prev => ({ ...prev, influence: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select influence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSubmit}>Add Stakeholder</Button>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onNext}>Next</Button>
      </div>
    </div>
  );
};

export default StakeholderManagementStep;
