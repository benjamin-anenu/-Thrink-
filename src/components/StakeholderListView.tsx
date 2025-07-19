
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mail, Phone, MapPin, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Stakeholder } from '@/types/stakeholder';

interface StakeholderListViewProps {
  stakeholders: Stakeholder[];
  onEdit: (stakeholder: Stakeholder) => void;
  onDelete: (stakeholder: Stakeholder) => void;
  onContact: (stakeholder: Stakeholder) => void;
}

const StakeholderListView: React.FC<StakeholderListViewProps> = ({
  stakeholders,
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
    <div className="space-y-3">
      {stakeholders.map((stakeholder) => (
        <Card key={stakeholder.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{getInitials(stakeholder.name)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{stakeholder.name}</h3>
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
                  
                  <p className="text-sm text-muted-foreground mb-2">{stakeholder.role}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Mail size={14} />
                      <span>{stakeholder.email}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onContact(stakeholder)}
                  title="Contact stakeholder"
                >
                  <MessageSquare size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(stakeholder)}
                  title="Edit stakeholder"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(stakeholder)}
                  title="Delete stakeholder"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StakeholderListView;
