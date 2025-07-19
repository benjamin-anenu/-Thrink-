
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { Stakeholder } from '@/types/stakeholder';

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onEdit: (stakeholder: Stakeholder) => void;
  onDelete: (stakeholder: Stakeholder) => void;
  onContact: (stakeholder: Stakeholder) => void;
}

const StakeholderCard: React.FC<StakeholderCardProps> = ({
  stakeholder,
  onEdit,
  onDelete,
  onContact
}) => {
  const getInfluenceBadgeColor = (influence: string) => {
    switch (influence) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(stakeholder.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={getInfluenceBadgeColor(stakeholder.influence)}
            >
              {stakeholder.influence} influence
            </Badge>
            <Badge variant="secondary">
              {stakeholder.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Mail size={14} className="text-muted-foreground" />
            <span>{stakeholder.email}</span>
          </div>
          {stakeholder.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone size={14} className="text-muted-foreground" />
              <span>{stakeholder.phone}</span>
            </div>
          )}
        </div>
        
        {stakeholder.department && (
          <div>
            <p className="text-sm font-medium">Department</p>
            <p className="text-sm text-muted-foreground">{stakeholder.department}</p>
          </div>
        )}

        <div className="flex items-center space-x-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onContact(stakeholder)}
            className="flex-1"
          >
            <MessageSquare size={16} className="mr-2" />
            Contact
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(stakeholder)}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(stakeholder)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StakeholderCard;
