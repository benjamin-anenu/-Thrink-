
import React, { useState } from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectMilestone } from '@/types/project';
import { Check, X, Target } from 'lucide-react';

interface InlineMilestoneEditorProps {
  onSave: (milestone: Omit<ProjectMilestone, 'id'>) => void;
  onCancel: () => void;
  densityClass?: string;
}

const InlineMilestoneEditor: React.FC<InlineMilestoneEditorProps> = ({
  onSave,
  onCancel,
  densityClass = 'py-3 px-4'
}) => {
  const [milestoneData, setMilestoneData] = useState<Omit<ProjectMilestone, 'id'>>({
    name: '',
    description: '',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    baselineDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'upcoming',
    progress: 0,
    tasks: []
  });

  const handleSave = () => {
    if (milestoneData.name.trim()) {
      onSave(milestoneData);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <TableRow className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
      <TableCell colSpan={12} className="p-0">
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20">
          <Target className="h-4 w-4 text-blue-600" />
          <Input
            value={milestoneData.name}
            onChange={(e) => setMilestoneData({ ...milestoneData, name: e.target.value })}
            placeholder="Enter milestone name..."
            className="border-none bg-transparent p-0 focus-visible:ring-0 font-semibold flex-1"
            onKeyDown={handleKeyPress}
            autoFocus
          />
          <Input
            type="date"
            value={milestoneData.date}
            onChange={(e) => setMilestoneData({ ...milestoneData, date: e.target.value })}
            className="border-none bg-transparent p-0 focus-visible:ring-0 w-40"
          />
          <Select
            value={milestoneData.status}
            onValueChange={(value) => setMilestoneData({ ...milestoneData, status: value as ProjectMilestone['status'] })}
          >
            <SelectTrigger className="border-none bg-transparent p-0 h-auto focus:ring-0 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button size="sm" variant="default" onClick={handleSave}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default InlineMilestoneEditor;
