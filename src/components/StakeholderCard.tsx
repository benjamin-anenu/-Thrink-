
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MessageSquare, Edit, AlertTriangle, Users } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  communicationPreference: 'Email' | 'Phone' | 'Slack' | 'In-person';
  escalationLevel?: number;
  influence: 'High' | 'Medium' | 'Low';
  interest: 'High' | 'Medium' | 'Low';
  projects: string[];
}

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onEdit: (stakeholder: Stakeholder) => void;
  onDelete?: (stakeholder: Stakeholder) => void;
}

const StakeholderCard = ({ stakeholder, onEdit, onDelete }: StakeholderCardProps) => {
  const getInfluenceColor = (influence: string) => {
    switch (influence.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getCommIcon = (preference: string) => {
    switch (preference.toLowerCase()) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'slack': return <MessageSquare className="h-4 w-4" />;
      case 'in-person': return <Users className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={stakeholder.avatar} />
              <AvatarFallback>{stakeholder.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{stakeholder.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onEdit(stakeholder)}>
              <Edit className="h-4 w-4" />
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(stakeholder)}
                className="text-destructive border-destructive hover:text-destructive hover:border-destructive flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Department</span>
          <Badge variant="outline">{stakeholder.department}</Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Influence</span>
          <Badge className={getInfluenceColor(stakeholder.influence)}>
            {stakeholder.influence}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Interest</span>
          <Badge className={getInfluenceColor(stakeholder.interest)}>
            {stakeholder.interest}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Preferred Contact</span>
          <div className="flex items-center space-x-1">
            {getCommIcon(stakeholder.communicationPreference)}
            <span className="text-sm">{stakeholder.communicationPreference}</span>
          </div>
        </div>
        
        {stakeholder.escalationLevel && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Escalation Level</span>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Level {stakeholder.escalationLevel}</span>
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <span className="text-sm text-muted-foreground">Projects ({stakeholder.projects.length})</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {stakeholder.projects.slice(0, 3).map((project, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {project}
              </Badge>
            ))}
            {stakeholder.projects.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{stakeholder.projects.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StakeholderCard;
