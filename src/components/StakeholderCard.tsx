
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, MessageSquare, Edit, AlertTriangle } from 'lucide-react';

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  avatar?: string;
  communicationPreference: 'email' | 'phone' | 'slack' | 'teams';
  escalationLevel: number;
  influence: 'high' | 'medium' | 'low';
  interest: 'high' | 'medium' | 'low';
  projects: string[];
}

interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onEdit: (stakeholder: Stakeholder) => void;
}

const StakeholderCard = ({ stakeholder, onEdit }: StakeholderCardProps) => {
  const getInfluenceColor = (influence: string) => {
    switch (influence) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getCommIcon = (preference: string) => {
    switch (preference) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
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
          <Button variant="ghost" size="sm" onClick={() => onEdit(stakeholder)}>
            <Edit className="h-4 w-4" />
          </Button>
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
            <span className="text-sm capitalize">{stakeholder.communicationPreference}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Escalation Level</span>
          <div className="flex items-center space-x-1">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Level {stakeholder.escalationLevel}</span>
          </div>
        </div>
        
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
