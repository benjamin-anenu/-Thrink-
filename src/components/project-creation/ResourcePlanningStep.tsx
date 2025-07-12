
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Calendar, Plus, X } from 'lucide-react';

interface ResourcePlanningStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const ResourcePlanningStep: React.FC<ResourcePlanningStepProps> = ({ data, onDataChange }) => {
  const [newMember, setNewMember] = useState({ name: '', role: '', allocation: '100' });

  const roles = [
    'Project Manager', 'Technical Lead', 'Frontend Developer', 'Backend Developer',
    'UI/UX Designer', 'Quality Assurance', 'Business Analyst', 'DevOps Engineer'
  ];

  const addTeamMember = () => {
    if (newMember.name && newMember.role) {
      onDataChange({
        resources: {
          ...data.resources,
          teamMembers: [...data.resources.teamMembers, newMember]
        }
      });
      setNewMember({ name: '', role: '', allocation: '100' });
    }
  };

  const removeMember = (index: number) => {
    const updatedMembers = data.resources.teamMembers.filter((_: any, i: number) => i !== index);
    onDataChange({
      resources: {
        ...data.resources,
        teamMembers: updatedMembers
      }
    });
  };

  const updateTimeline = (field: 'start' | 'end', value: string) => {
    onDataChange({
      resources: {
        ...data.resources,
        timeline: {
          ...data.resources.timeline,
          [field]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Resource Planning</h3>
        <p className="text-muted-foreground">
          Plan your team, budget, and timeline for successful project execution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Planning
            </CardTitle>
            <CardDescription>Set project budget and cost estimates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="budget">Total Budget</Label>
              <Input
                id="budget"
                placeholder="Enter total project budget"
                value={data.resources.budget}
                onChange={(e) => onDataChange({
                  resources: {
                    ...data.resources,
                    budget: e.target.value
                  }
                })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted rounded">
                <div className="font-medium">Labor Costs</div>
                <div className="text-muted-foreground">70% of budget</div>
              </div>
              <div className="p-3 bg-muted rounded">
                <div className="font-medium">Infrastructure</div>
                <div className="text-muted-foreground">15% of budget</div>
              </div>
              <div className="p-3 bg-muted rounded">
                <div className="font-medium">Tools & Software</div>
                <div className="text-muted-foreground">10% of budget</div>
              </div>
              <div className="p-3 bg-muted rounded">
                <div className="font-medium">Contingency</div>
                <div className="text-muted-foreground">5% of budget</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline Planning
            </CardTitle>
            <CardDescription>Define project start and end dates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={data.resources.timeline.start}
                onChange={(e) => updateTimeline('start', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">Target End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={data.resources.timeline.end}
                onChange={(e) => updateTimeline('end', e.target.value)}
              />
            </div>
            {data.resources.timeline.start && data.resources.timeline.end && (
              <div className="p-3 bg-muted rounded text-sm">
                <div className="font-medium">Project Duration</div>
                <div className="text-muted-foreground">
                  {Math.ceil((new Date(data.resources.timeline.end).getTime() - new Date(data.resources.timeline.start).getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Planning
          </CardTitle>
          <CardDescription>Add team members and define their roles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="member-name">Name</Label>
              <Input
                id="member-name"
                placeholder="Team member name"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="member-role">Role</Label>
              <Select 
                value={newMember.role} 
                onValueChange={(value) => setNewMember({...newMember, role: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="member-allocation">Allocation %</Label>
              <Input
                id="member-allocation"
                placeholder="100"
                value={newMember.allocation}
                onChange={(e) => setNewMember({...newMember, allocation: e.target.value})}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addTeamMember} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          {data.resources.teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label>Team Members</Label>
              <div className="space-y-2">
                {data.resources.teamMembers.map((member: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                      </div>
                      <Badge variant="outline">{member.allocation}%</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcePlanningStep;
