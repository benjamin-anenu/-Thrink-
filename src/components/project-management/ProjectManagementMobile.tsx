import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Settings,
  CalendarDays,
  Users,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProjectManagementMobileProps {
  project: any;
  teamSize: number;
  totalTasks: number;
  formatDate: (dateString?: string) => string;
  onCalendarClick: () => void;
  onSettingsClick: () => void;
}

const ProjectManagementMobile: React.FC<ProjectManagementMobileProps> = ({
  project,
  teamSize,
  totalTasks,
  formatDate,
  onCalendarClick,
  onSettingsClick
}) => {
  const [showProjectStats, setShowProjectStats] = useState(true);
  const [showTaskStats, setShowTaskStats] = useState(true);

  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="space-y-4">
        <div className="flex-1">
          <h1 className="text-xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{project.description}</p>
          <div className="mt-2">
            <Badge variant={project.status === 'In Progress' ? 'default' : 'secondary'}>
              {project.status}
            </Badge>
          </div>
        </div>
        
        {/* Mobile actions - full width buttons */}
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCalendarClick}
            className="w-full h-11 flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSettingsClick}
            className="w-full h-11"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Collapsible Project Stats */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Project Details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProjectStats(!showProjectStats)}
              className="h-8 w-8 p-0"
            >
              {showProjectStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {showProjectStats && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Card className="h-20">
                <CardContent className="pt-3 p-3">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="ml-2 min-w-0">
                      <p className="text-xs font-medium truncate">Start Date</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(() => {
                          const displayDate = project.computed_start_date || project.startDate;
                          return formatDate(displayDate);
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-20">
                <CardContent className="pt-3 p-3">
                  <div className="flex items-center">
                    <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="ml-2 min-w-0">
                      <p className="text-xs font-medium truncate">End Date</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {(() => {
                          const displayDate = project.computed_end_date || project.endDate;
                          return formatDate(displayDate);
                        })()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-20">
                <CardContent className="pt-3 p-3">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="ml-2 min-w-0">
                      <p className="text-xs font-medium truncate">Team Size</p>
                      <p className="text-xs text-muted-foreground truncate">{teamSize} members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-20">
                <CardContent className="pt-3 p-3">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="ml-2 min-w-0">
                      <p className="text-xs font-medium truncate">Tasks</p>
                      <p className="text-xs text-muted-foreground truncate">{totalTasks} tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default ProjectManagementMobile;