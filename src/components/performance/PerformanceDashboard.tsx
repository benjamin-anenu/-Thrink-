
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Clock,
  Mail,
  FileText,
  Award,
  Target
} from 'lucide-react';
import { PerformanceTracker } from '@/services/PerformanceTracker';
import { EmailReminderService } from '@/services/EmailReminderService';
import { PerformanceProfile, TaskDeadlineReminder, RebaselineRequest } from '@/types/performance';

const PerformanceDashboard: React.FC = () => {
  const [performanceProfiles, setPerformanceProfiles] = useState<PerformanceProfile[]>([]);
  const [reminders, setReminders] = useState<TaskDeadlineReminder[]>([]);
  const [rebaselineRequests, setRebaselineRequests] = useState<RebaselineRequest[]>([]);

  useEffect(() => {
    const tracker = PerformanceTracker.getInstance();
    const emailService = EmailReminderService.getInstance();
    
    setPerformanceProfiles(tracker.getAllProfiles());
    setReminders(emailService.getReminders());
    setRebaselineRequests(emailService.getRebaselineRequests());
  }, []);

  const getPerformanceStats = () => {
    const totalResources = performanceProfiles.length;
    const highPerformers = performanceProfiles.filter(p => p.currentScore > 80).length;
    const atRisk = performanceProfiles.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
    const improving = performanceProfiles.filter(p => p.trend === 'improving').length;
    const avgScore = totalResources > 0 ? performanceProfiles.reduce((sum, p) => sum + p.currentScore, 0) / totalResources : 75;

    return { totalResources, highPerformers, atRisk, improving, avgScore };
  };

  const getEmailStats = () => {
    const totalReminders = reminders.length;
    const sentReminders = reminders.filter(r => r.sent).length;
    const pendingResponses = reminders.filter(r => r.responseRequired && !r.responseReceived).length;
    const pendingRebaselines = rebaselineRequests.filter(r => r.status === 'pending').length;

    return { totalReminders, sentReminders, pendingResponses, pendingRebaselines };
  };

  const stats = getPerformanceStats();
  const emailStats = getEmailStats();

  const handleApproveRebaseline = (requestId: string) => {
    const emailService = EmailReminderService.getInstance();
    emailService.approveRebaseline(requestId, 'Current User', 'Approved via dashboard');
    setRebaselineRequests(emailService.getRebaselineRequests());
  };

  const handleRejectRebaseline = (requestId: string) => {
    const emailService = EmailReminderService.getInstance();
    emailService.rejectRebaseline(requestId, 'Current User', 'Rejected - deadline must be maintained');
    setRebaselineRequests(emailService.getRebaselineRequests());
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Team Average</p>
                <p className="font-semibold">{Math.round(stats.avgScore)}/100</p>
                <Progress value={stats.avgScore} className="mt-1 h-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">High Performers</p>
                <p className="font-semibold">{stats.highPerformers}/{stats.totalResources}</p>
                <p className="text-xs text-green-600">80+ score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="font-semibold">{stats.atRisk}</p>
                <p className="text-xs text-orange-600">Need attention</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Improving</p>
                <p className="font-semibold">{stats.improving}</p>
                <p className="text-xs text-purple-600">Positive trend</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="emails">Email System</TabsTrigger>
          <TabsTrigger value="rebaselines">Rebaselines</TabsTrigger>
          <TabsTrigger value="reports">AI Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Overview</CardTitle>
              <CardDescription>Real-time performance tracking and insights</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceProfiles.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Performance tracking is initializing...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    AI will start collecting performance data as team members complete tasks
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {performanceProfiles.map((profile) => (
                    <div key={profile.resourceId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-medium text-primary">
                              {profile.resourceName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{profile.resourceName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Score: {Math.round(profile.currentScore)}/100
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={profile.trend === 'improving' ? 'default' : 
                                   profile.trend === 'declining' ? 'destructive' : 'secondary'}
                            className="flex items-center gap-1"
                          >
                            {profile.trend === 'improving' ? <TrendingUp className="h-3 w-3" /> :
                             profile.trend === 'declining' ? <TrendingDown className="h-3 w-3" /> :
                             <div className="w-3 h-3 rounded-full bg-current" />}
                            {profile.trend}
                          </Badge>
                          <Badge 
                            variant={profile.riskLevel === 'low' ? 'outline' :
                                   profile.riskLevel === 'medium' ? 'secondary' :
                                   'destructive'}
                          >
                            {profile.riskLevel} risk
                          </Badge>
                        </div>
                      </div>
                      <Progress value={profile.currentScore} className="mb-2" />
                      <div className="text-xs text-muted-foreground">
                        Recent activities: {profile.metrics.slice(-3).map(m => m.description).join(', ') || 'No recent activity'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Reminders</p>
                    <p className="font-semibold">{emailStats.totalReminders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sent</p>
                    <p className="font-semibold">{emailStats.sentReminders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Responses</p>
                    <p className="font-semibold">{emailStats.pendingResponses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Rebaseline Requests</p>
                    <p className="font-semibold">{emailStats.pendingRebaselines}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Email Activity</CardTitle>
              <CardDescription>Smart deadline reminders and responses</CardDescription>
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No email reminders scheduled yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    System will automatically schedule reminders when tasks have deadlines
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.slice(-5).map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className={`h-4 w-4 ${reminder.sent ? 'text-green-500' : 'text-orange-500'}`} />
                        <div>
                          <p className="font-medium text-sm">{reminder.taskName}</p>
                          <p className="text-xs text-muted-foreground">
                            {reminder.resourceName} • {reminder.reminderType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={reminder.sent ? 'default' : 'secondary'}>
                          {reminder.sent ? 'Sent' : 'Pending'}
                        </Badge>
                        {reminder.responseReceived && (
                          <Badge variant="outline" className="text-xs">
                            Responded
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rebaselines" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rebaseline Requests</CardTitle>
              <CardDescription>Timeline adjustment requests from team members</CardDescription>
            </CardHeader>
            <CardContent>
              {rebaselineRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No rebaseline requests</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Team members can request deadline extensions through email responses
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rebaselineRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">Task ID: {request.taskId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Resource ID: {request.resourceId}
                          </p>
                        </div>
                        <Badge 
                          variant={request.status === 'pending' ? 'secondary' :
                                 request.status === 'approved' ? 'default' : 'destructive'}
                        >
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm font-medium">Original Deadline</p>
                          <p className="text-sm text-muted-foreground">
                            {request.originalDeadline.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Proposed Deadline</p>
                          <p className="text-sm text-muted-foreground">
                            {request.proposedDeadline.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1">Reasons:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {request.reasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveRebaseline(request.id)}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleRejectRebaseline(request.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Reports</CardTitle>
              <CardDescription>Monthly performance reports and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Monthly reports will be generated automatically</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Reports include performance metrics, achievements, challenges, and AI insights
                </p>
                <Button className="mt-4" onClick={() => {
                  const tracker = PerformanceTracker.getInstance();
                  if (performanceProfiles.length > 0) {
                    const report = tracker.generateMonthlyReport(performanceProfiles[0].resourceId);
                    console.log('Generated monthly report:', report);
                  }
                }}>
                  Generate Sample Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceDashboard;
