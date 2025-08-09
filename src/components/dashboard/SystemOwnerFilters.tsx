import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { WorkspaceSummary } from '@/hooks/useSystemOwnerOverview';

export interface FiltersValue {
  workspaceIds: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface Props {
  workspaces: WorkspaceSummary[];
  value: FiltersValue;
  onChange: (val: FiltersValue) => void;
}

const SystemOwnerFilters: React.FC<Props> = ({ workspaces, value, onChange }) => {
  const toggleWorkspace = (id: string) => {
    const set = new Set(value.workspaceIds);
    if (set.has(id)) set.delete(id); else set.add(id);
    onChange({ ...value, workspaceIds: Array.from(set) });
  };

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Search projects</Label>
          <Input
            placeholder="Search by project name"
            value={value.search ?? ''}
            onChange={(e) => onChange({ ...value, search: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>From</Label>
          <Input
            type="date"
            value={value.dateFrom ?? ''}
            onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>To</Label>
          <Input
            type="date"
            value={value.dateTo ?? ''}
            onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Workspaces</Label>
          <div className="max-h-28 overflow-auto rounded border p-2">
            {workspaces.map(ws => (
              <label key={ws.id} className="flex items-center gap-2 text-sm py-1">
                <input
                  type="checkbox"
                  checked={value.workspaceIds.includes(ws.id)}
                  onChange={() => toggleWorkspace(ws.id)}
                />
                <span>{ws.name}</span>
              </label>
            ))}
            {workspaces.length === 0 && (
              <div className="text-muted-foreground text-sm">No workspaces</div>
            )}
          </div>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="text-xs text-muted-foreground">Filters update the real-time metrics and the project list.</div>
    </Card>
  );
};

export default SystemOwnerFilters;
