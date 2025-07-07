
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, Clock, Users, ArrowUp } from 'lucide-react';

interface EscalationRule {
  level: number;
  title: string;
  timeframe: string;
  stakeholders: Array<{
    name: string;
    role: string;
    avatar?: string;
  }>;
  conditions: string[];
}

const escalationRules: EscalationRule[] = [
  {
    level: 1,
    title: "Team Lead Escalation",
    timeframe: "Within 2 hours",
    stakeholders: [
      { name: "Sarah Johnson", role: "Project Manager", avatar: "/placeholder.svg" },
      { name: "Mike Chen", role: "Tech Lead", avatar: "/placeholder.svg" }
    ],
    conditions: ["Task overdue by 1 day", "Resource unavailable", "Minor blockers"]
  },
  {
    level: 2,
    title: "Management Escalation",
    timeframe: "Within 4 hours",
    stakeholders: [
      { name: "David Wilson", role: "Engineering Manager", avatar: "/placeholder.svg" },
      { name: "Lisa Park", role: "Product Manager", avatar: "/placeholder.svg" }
    ],
    conditions: ["Task overdue by 3 days", "Budget variance >10%", "Resource conflicts"]
  },
  {
    level: 3,
    title: "Director Escalation",
    timeframe: "Within 8 hours",
    stakeholders: [
      { name: "James Rodriguez", role: "Director of Engineering", avatar: "/placeholder.svg" },
      { name: "Anna Kim", role: "Director of Product", avatar: "/placeholder.svg" }
    ],
    conditions: ["Project delayed by 1 week", "Budget variance >25%", "Client complaints"]
  },
  {
    level: 4,
    title: "Executive Escalation",
    timeframe: "Within 24 hours",
    stakeholders: [
      { name: "Robert Chen", role: "CTO", avatar: "/placeholder.svg" },
      { name: "Maria Garcia", role: "CEO", avatar: "/placeholder.svg" }
    ],
    conditions: ["Project at risk of failure", "Budget variance >50%", "Legal/compliance issues"]
  }
];

const EscalationMatrix = () => {
  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 2: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
      case 4: return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <AlertTriangle className="h-6 w-6 text-orange-500" />
        <h2 className="text-2xl font-bold">Escalation Matrix</h2>
      </div>
      
      <div className="grid gap-4">
        {escalationRules.map((rule) => (
          <Card key={rule.level} className={`border-2 ${getLevelColor(rule.level)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <ArrowUp className="h-5 w-5" />
                    <CardTitle className="text-lg">Level {rule.level}</CardTitle>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {rule.title}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{rule.timeframe}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">Responsible Stakeholders</h4>
                </div>
                <div className="flex flex-wrap gap-3">
                  {rule.stakeholders.map((stakeholder, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-background/50 rounded-lg p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={stakeholder.avatar} />
                        <AvatarFallback>{stakeholder.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{stakeholder.name}</p>
                        <p className="text-xs text-muted-foreground">{stakeholder.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm mb-2">Escalation Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {rule.conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EscalationMatrix;
