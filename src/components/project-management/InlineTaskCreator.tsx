
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface InlineTaskCreatorProps {
  onCreateTask: (taskData: any) => Promise<void>;
  onCreateMilestone: (milestoneData: any) => Promise<void>;
  onCancel: () => void;
  type: 'task' | 'milestone';
}

export const InlineTaskCreator: React.FC<InlineTaskCreatorProps> = ({
  onCreateTask,
  onCreateMilestone,
  onCancel,
  type
}) => {
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    priority: 'Medium',
    status: type === 'task' ? 'Not Started' : 'upcoming',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days for milestone
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (type === 'task') {
        await onCreateTask({
          name: formData.name.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
          status: formData.status,
          startDate: format(formData.startDate, 'yyyy-MM-dd'),
          endDate: format(formData.endDate, 'yyyy-MM-dd'),
          progress: 0,
          assignedResources: [],
          assignedStakeholders: [],
          dependencies: [],
          duration: 1,
          hierarchyLevel: 0,
          sortOrder: 0
        });
      } else {
        await onCreateMilestone({
          name: formData.name.trim(),
          description: formData.description.trim(),
          date: format(formData.date, 'yyyy-MM-dd'),
          baselineDate: format(formData.date, 'yyyy-MM-dd'),
          status: formData.status,
          tasks: [],
          progress: 0
        });
      }
      onCancel();
    } catch (error) {
      console.error('Error creating item:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr className="border-b bg-muted/50">
      <td className="p-2">
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={`Enter ${type} name`}
          className="h-8"
        />
      </td>
      <td className="p-2">
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description (optional)"
          className="h-8"
        />
      </td>
      {type === 'task' && (
        <>
          <td className="p-2">
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </td>
          <td className="p-2">
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </td>
          <td className="p-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 justify-start text-left font-normal",
                    !formData.startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.startDate ? format(formData.startDate, "MMM dd, yyyy") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.startDate}
                  onSelect={(date) => setFormData({ ...formData, startDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </td>
          <td className="p-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 justify-start text-left font-normal",
                    !formData.endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.endDate ? format(formData.endDate, "MMM dd, yyyy") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.endDate}
                  onSelect={(date) => setFormData({ ...formData, endDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </td>
        </>
      )}
      {type === 'milestone' && (
        <>
          <td className="p-2">
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </td>
          <td className="p-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "MMM dd, yyyy") : "Pick due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </td>
        </>
      )}
      <td className="p-2">
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!formData.name.trim() || saving}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={saving}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
