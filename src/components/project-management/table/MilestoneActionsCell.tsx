
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProjectMilestone } from '@/types/project';
import { toast } from 'sonner';

interface MilestoneActionsCellProps {
  milestone: ProjectMilestone;
  onEdit: (milestone: ProjectMilestone) => void;
  onDelete: (milestoneId: string) => void;
}

const MilestoneActionsCell: React.FC<MilestoneActionsCellProps> = ({
  milestone,
  onEdit,
  onDelete,
}) => {
  const handleEdit = () => {
    onEdit(milestone);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete milestone "${milestone.name}"?`)) {
      onDelete(milestone.id);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Milestone
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Milestone
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MilestoneActionsCell;
