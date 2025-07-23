
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Users, Link, Activity } from 'lucide-react';
import { useEscalationLevels } from '@/hooks/useEscalationLevels';
import { useEscalationAssignments } from '@/hooks/useEscalationAssignments';
import { useEscalationTriggers } from '@/hooks/useEscalationTriggers';
import { useStakeholders } from '@/hooks/useStakeholders';

const EscalationOverview: React.FC = () => {
  const { levels } = useEscalationLevels();
  const { assignments } = useEscalationAssignments();
  const { triggers } = useEscalationTriggers();
  const { stakeholders } = useStakeholders();

  const stats = {
    totalLevels: levels.length,
    totalAssignments: assignments.length,
    totalTriggers: triggers.length,
    assignedTriggers: [...new Set(assignments.map(a => a.trigger_id))].length,
    assignedStakeholders: [...new Set(assignments.map(a => a.stakeholder_id))].length
  };

  const coveragePercentage = stats.totalTriggers > 0 
    ? (stats.assignedTriggers / stats.totalTriggers) * 100 
    : 0;

  const getTriggersByLevel = (levelId: string) => {
    return assignments.filter(a => a.level_id === levelId);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Escalation Levels</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalLevels}</div>
            <p className="text-xs text-muted-foreground">
              Configured levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Assignments</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              Total assignments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Trigger Coverage</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(coveragePercentage)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.assignedTriggers} of {stats.totalTriggers} triggers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Stakeholders</span>
            </div>
            <div className="text-2xl font-bold">{stats.assignedStakeholders}</div>
            <p className="text-xs text-muted-foreground">
              Involved in escalations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Escalation Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Trigger Assignment Coverage</span>
              <span>{Math.round(coveragePercentage)}%</span>
            </div>
            <Progress value={coveragePercentage} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.assignedTriggers} of {stats.totalTriggers} triggers have been assigned to escalation levels
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Level Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Level Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {levels.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No escalation levels configured yet
            </p>
          ) : (
            <div className="space-y-3">
              {levels.sort((a, b) => a.level_order - b.level_order).map((level) => {
                const levelAssignments = getTriggersByLevel(level.id);
                
                return (
                  <div key={level.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {level.level_order}
                      </div>
                      <div>
                        <div className="font-medium">{level.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {levelAssignments.length} assignments
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {levelAssignments.length} triggers
                      </Badge>
                      <Badge variant="outline">
                        {[...new Set(levelAssignments.map(a => a.stakeholder_id))].length} stakeholders
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EscalationOverview;
