import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useStakeholders } from '@/hooks/useStakeholders';
import { Stakeholder } from '@/types/stakeholder';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface StakeholderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stakeholder: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => void;
  onDelete?: (stakeholder: Stakeholder) => void;
  stakeholder?: Stakeholder | null;
}

const StakeholderForm: React.FC<StakeholderFormProps> = ({ isOpen, onClose, onSubmit, onDelete, stakeholder }) => {
  const [name, setName] = useState(stakeholder?.name || '');
  const [email, setEmail] = useState(stakeholder?.email || '');
  const [role, setRole] = useState(stakeholder?.role || '');
  const [department, setDepartment] = useState(stakeholder?.department || '');
  const [phone, setPhone] = useState(stakeholder?.phone || '');
  const [communicationPreference, setCommunicationPreference] = useState(stakeholder?.communicationPreference || 'Email');
  const [influence, setInfluence] = useState(stakeholder?.influence || 'medium');
  const [interest, setInterest] = useState(stakeholder?.interest || 'medium');
  const [status, setStatus] = useState(stakeholder?.status || 'active');
  const [notes, setNotes] = useState(stakeholder?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stakeholderData = {
      name,
      email,
      role,
      department,
      phone,
      communicationPreference,
      influence,
      interest,
      status,
      notes,
      projects: []
    };
    onSubmit(stakeholderData);
    onClose();
  };

  const handleDelete = () => {
    if (stakeholder && onDelete) {
      onDelete(stakeholder);
      onClose();
    }
  };

  useEffect(() => {
    if (stakeholder) {
      setName(stakeholder.name || '');
      setEmail(stakeholder.email || '');
      setRole(stakeholder.role || '');
      setDepartment(stakeholder.department || '');
      setPhone(stakeholder.phone || '');
      setCommunicationPreference(stakeholder.communicationPreference || 'Email');
      setInfluence(stakeholder.influence || 'medium');
      setInterest(stakeholder.interest || 'medium');
      setStatus(stakeholder.status || 'active');
      setNotes(stakeholder.notes || '');
    }
  }, [stakeholder]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{stakeholder ? 'Edit Stakeholder' : 'Create New Stakeholder'}</DialogTitle>
          <DialogDescription>
            {stakeholder ? 'Update stakeholder information here.' : 'Add a new stakeholder to the workspace.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role">Role</Label>
              <Input type="text" id="role" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input type="text" id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="communicationPreference">Communication Preference</Label>
              <Select value={communicationPreference} onValueChange={setCommunicationPreference}>
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="influence">Influence</Label>
              <Select value={influence} onValueChange={setInfluence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="interest">Interest</Label>
              <Select value={interest} onValueChange={setInterest}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {stakeholder && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            )}
            <Button type="submit">
              {stakeholder ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Stakeholders = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  const { stakeholders, loading, createStakeholder, updateStakeholder, deleteStakeholder } = useStakeholders();

  const handleCreateStakeholder = async (stakeholderData: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await createStakeholder({
        ...stakeholderData,
        workspace_id: currentWorkspace?.id || '',
      });
      toast({
        title: "Success",
        description: "Stakeholder created successfully"
      });
    } catch (error) {
      console.error("Error creating stakeholder:", error);
      toast({
        title: "Error",
        description: "Failed to create stakeholder",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStakeholder = async (stakeholderData: Omit<Stakeholder, 'id' | 'created_at' | 'updated_at'>) => {
    if (!selectedStakeholder) return;
    try {
      await updateStakeholder(selectedStakeholder.id, stakeholderData);
      toast({
        title: "Success",
        description: "Stakeholder updated successfully"
      });
    } catch (error) {
      console.error("Error updating stakeholder:", error);
      toast({
        title: "Error",
        description: "Failed to update stakeholder",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStakeholder = async (stakeholder: Stakeholder) => {
    await deleteStakeholder(stakeholder.id);
  };

  const filteredStakeholders = stakeholders.filter(stakeholder =>
    stakeholder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stakeholder.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stakeholder.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    setShowForm(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Stakeholders</h1>
          <p className="text-muted-foreground">Manage stakeholders involved in your projects</p>
        </div>
        <div className="flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Search stakeholders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={() => {
            setSelectedStakeholder(null);
            setShowForm(true);
          }}><Plus className="h-4 w-4 mr-2" /> Add Stakeholder</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stakeholder List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading stakeholders...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>A list of stakeholders in your workspace.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStakeholders.map((stakeholder) => (
                    <TableRow key={stakeholder.id}>
                      <TableCell className="font-medium">
                        <Avatar>
                          <AvatarFallback>{stakeholder.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>{stakeholder.name}</TableCell>
                      <TableCell>{stakeholder.email}</TableCell>
                      <TableCell>{stakeholder.role}</TableCell>
                      <TableCell>{stakeholder.status}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(stakeholder)}>
                          <Edit className="h-4 w-4 mr-2" />Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <StakeholderForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={selectedStakeholder ? handleUpdateStakeholder : handleCreateStakeholder}
        onDelete={handleDeleteStakeholder}
        stakeholder={selectedStakeholder}
      />
    </div>
  );
};

export default Stakeholders;
