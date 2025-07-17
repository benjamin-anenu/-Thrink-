
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  Building, 
  User, 
  Edit,
  Trash2,
  UserCheck,
  AlertTriangle,
  Eye
} from 'lucide-react';

interface StakeholderCardProps {
  stakeholder: any;
  onEdit: (stakeholder: any) => void;
  onViewDetails: (stakeholder: any) => void;
  onDelete?: (stakeholder: any) => void;
}

const StakeholderCard: React.FC<StakeholderCardProps> = ({ 
  stakeholder, 
  onEdit, 
  onViewDetails,
  onDelete 
}) => {
  const getInfluenceColor = (influence: string) => {
    switch (influence?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" alt={stakeholder.name} />
              <AvatarFallback className="bg-primary/10">
                {getInitials(stakeholder.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {stakeholder.role}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={getInfluenceColor(stakeholder.influence_level)}
            >
              {stakeholder.influence_level || 'Medium'} Influence
            </Badge>
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(stakeholder)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{stakeholder.email || 'No email provided'}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{stakeholder.organization || 'No organization'}</span>
          </div>
        </div>
        
        <div className="pt-2">
          <span className="text-sm text-muted-foreground">Projects ({(stakeholder.projects || []).length})</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {(stakeholder.projects || []).slice(0, 3).map((project: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">
                {project}
              </Badge>
            ))}
            {(stakeholder.projects || []).length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{(stakeholder.projects || []).length - 3} more
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(stakeholder)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(stakeholder)}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StakeholderCard;
