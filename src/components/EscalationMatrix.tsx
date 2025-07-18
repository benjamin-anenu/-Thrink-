
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEscalationMatrix, EscalationMatrixEntry } from '@/hooks/useEscalationMatrix';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface EscalationMatrixProps {
  projectId?: string;
}

const EscalationMatrix: React.FC<EscalationMatrixProps> = ({ projectId }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EscalationMatrixEntry | null>(null);
  const [formData, setFormData] = useState({
    level: 1,
    contact_name: '',
    contact_email: '',
    contact_role: '',
    issue_types: [] as string[]
  });

  const { escalationMatrix, loading, createEscalationEntry, updateEscalationEntry, deleteEscalationEntry } = useEscalationMatrix(projectId);

  const handleEdit = (entry?: EscalationMatrixEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        level: entry.level,
        contact_name: entry.contact_name,
        contact_email: entry.contact_email,
        contact_role: entry.contact_role,
        issue_types: entry.issue_types || []
      });
    } else {
      setEditingEntry(null);
      setFormData({
        level: Math.max(...escalationMatrix.map(e => e.level), 0) + 1,
        contact_name: '',
        contact_email: '',
        contact_role: '',
        issue_types: []
      });
    }
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    if (!projectId) {
      toast.error('Project ID required');
      return;
    }

    if (!formData.contact_name || !formData.contact_email) {
      toast.error('Contact name and email are required');
      return;
    }

    const entryData = {
      ...formData,
      project_id: projectId
    };

    if (editingEntry) {
      await updateEscalationEntry(editingEntry.id, entryData);
    } else {
      await createEscalationEntry(entryData);
    }

    setShowEditDialog(false);
    setEditingEntry(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this escalation entry?')) {
      await deleteEscalationEntry(id);
    }
  };

  const addIssueType = (issueType: string) => {
    if (issueType && !formData.issue_types.includes(issueType)) {
      setFormData({
        ...formData,
        issue_types: [...formData.issue_types, issueType]
      });
    }
  };

  const removeIssueType = (issueType: string) => {
    setFormData({
      ...formData,
      issue_types: formData.issue_types.filter(type => type !== issueType)
    });
  };

  if (!projectId) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Select a project to view escalation matrix</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Escalation Matrix</h2>
          <p className="text-muted-foreground">Define escalation procedures for different issue types</p>
        </div>
        <Button onClick={() => handleEdit()}>
          <Plus size={16} className="mr-2" />
          Add Level
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading escalation matrix...</div>
      ) : escalationMatrix.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No escalation levels defined</p>
            <Button onClick={() => handleEdit()}>
              <Plus size={16} className="mr-2" />
              Create First Level
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {escalationMatrix.sort((a, b) => a.level - b.level).map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Level {entry.level}
                      <Badge variant="outline">{entry.contact_role}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Contact: {entry.contact_name} ({entry.contact_email})
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(entry)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(entry.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {entry.issue_types && entry.issue_types.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Issue Types:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.issue_types.map((type, index) => (
                        <Badge key={index} variant="secondary">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Escalation Level' : 'Add Escalation Level'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="level">Level</Label>
              <Input
                id="level"
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                min={1}
              />
            </div>
            <div>
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="contact_role">Contact Role</Label>
              <Input
                id="contact_role"
                value={formData.contact_role}
                onChange={(e) => setFormData({ ...formData, contact_role: e.target.value })}
              />
            </div>
            <div>
              <Label>Issue Types</Label>
              <div className="flex gap-2 mb-2">
                <Select onValueChange={addIssueType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add issue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Budget">Budget</SelectItem>
                    <SelectItem value="Schedule">Schedule</SelectItem>
                    <SelectItem value="Quality">Quality</SelectItem>
                    <SelectItem value="Resource">Resource</SelectItem>
                    <SelectItem value="Stakeholder">Stakeholder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.issue_types.map((type, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeIssueType(type)}>
                    {type} ×
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingEntry ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EscalationMatrix;
