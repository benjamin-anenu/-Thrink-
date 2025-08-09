import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface BulkActionsBarProps {
  selectedCount: number;
  resources: Array<{ id: string; name: string }>;
  milestones: Array<{ id: string; name: string }>;
  onApply: (values: { resourceId?: string; status?: string; priority?: string; milestoneId?: string }) => Promise<void> | void;
  onClearSelection: () => void;
}

const statusOptions = [
  { value: 'Not Started', label: 'Not Started' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Blocked', label: 'Blocked' },
];

const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ selectedCount, resources, milestones, onApply, onClearSelection }) => {
  const [resourceId, setResourceId] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [priority, setPriority] = useState<string | undefined>();
  const [milestoneId, setMilestoneId] = useState<string | undefined>();
  const [applying, setApplying] = useState(false);

  const canApply = !!(resourceId || status || priority || typeof milestoneId !== 'undefined');

  const handleApply = async () => {
    if (!canApply) return;
    try {
      setApplying(true);
      await onApply({ resourceId, status, priority, milestoneId });
      // Reset local state after apply
      setResourceId(undefined);
      setStatus(undefined);
      setPriority(undefined);
      setMilestoneId(undefined);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 border-b bg-muted/30">
      <Badge variant="secondary">{selectedCount} selected</Badge>

      <Select value={resourceId} onValueChange={(v) => setResourceId(v)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Assign resource" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No resource</SelectItem>
          {resources.map(r => (
            <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(v) => setStatus(v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Set status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={priority} onValueChange={(v) => setPriority(v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Set priority" />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={milestoneId} onValueChange={(v) => setMilestoneId(v)}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Set milestone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No milestone</SelectItem>
          {milestones.map(m => (
            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onClearSelection}>Clear Selection</Button>
        <Button size="sm" onClick={handleApply} disabled={!canApply || applying}>
          Apply to {selectedCount}
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
