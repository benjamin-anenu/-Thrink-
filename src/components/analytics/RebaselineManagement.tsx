import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, User, FolderOpen } from 'lucide-react';
import { useRebaselineData } from '@/hooks/useRebaselineData';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const RebaselineManagement: React.FC = () => {
  const { loading, reminders, rebaselineRequests, reviewRebaselineRequest, updateReminderResponse, processScheduledReminders } = useRebaselineData();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReview = async (requestId: string, decision: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    setIsReviewing(true);
    try {
      await reviewRebaselineRequest(requestId, decision, reviewNotes, 'Current User');
      setSelectedRequest(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error reviewing request:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReminderResponse = async (reminderId: string, response: {
    onTrack: boolean;
    confidence: number;
    needsRebaseline: boolean;
    reasons?: string[];
    newEstimate?: string;
  }) => {
    try {
      await updateReminderResponse(reminderId, response);
      toast({
        title: "Response recorded",
        description: "Team member response has been recorded successfully.",
      });
    } catch (error) {
      console.error('Error recording response:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getReminderTypeLabel = (type: string) => {
    switch (type) {
      case 'week_before': return '1 Week Before';
      case 'three_days': return '3 Days Before';
      case 'day_before': return '1 Day Before';
      case 'day_of': return 'Day Of';
      case 'overdue': return 'Overdue';
      default: return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading rebaseline data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rebaseline Management</h2>
        <Button onClick={processScheduledReminders} variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Process Reminders
        </Button>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">
            Rebaseline Requests ({rebaselineRequests.length})
          </TabsTrigger>
          <TabsTrigger value="reminders">
            Task Reminders ({reminders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          {rebaselineRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No rebaseline requests found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {rebaselineRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Task Rebaseline Request</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <User className="h-4 w-4" />
                          Resource ID: {request.resource_id}
                        </div>
                      </div>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Original Deadline</label>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.original_deadline), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Proposed Deadline</label>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.proposed_deadline), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Reasons</label>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {request.reasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>

                      {request.impact && (
                        <div>
                          <label className="text-sm font-medium">Impact</label>
                          <p className="text-sm text-muted-foreground">{request.impact}</p>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedRequest(request.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve Rebaseline Request</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Add review notes (optional)"
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedRequest(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleReview(request.id, 'approved')}
                                    disabled={isReviewing}
                                  >
                                    {isReviewing ? 'Processing...' : 'Approve'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => setSelectedRequest(request.id)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Rebaseline Request</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  placeholder="Provide reason for rejection"
                                  value={reviewNotes}
                                  onChange={(e) => setReviewNotes(e.target.value)}
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedRequest(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleReview(request.id, 'rejected')}
                                    disabled={isReviewing}
                                  >
                                    {isReviewing ? 'Processing...' : 'Reject'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}

                      {request.reviewed_at && (
                        <div className="border-t pt-4">
                          <div className="text-sm">
                            <span className="font-medium">Reviewed:</span>{' '}
                            {format(new Date(request.reviewed_at), 'MMM dd, yyyy HH:mm')}
                            {request.reviewed_by && ` by ${request.reviewed_by}`}
                          </div>
                          {request.review_notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {request.review_notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          {reminders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No task reminders found.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reminders.map((reminder) => (
                <Card key={reminder.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{reminder.task_name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <FolderOpen className="h-4 w-4" />
                          {reminder.project_name}
                        </div>
                      </div>
                      <Badge variant={reminder.sent ? 'default' : 'secondary'}>
                        {getReminderTypeLabel(reminder.reminder_type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Deadline</label>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(reminder.deadline), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Assigned To</label>
                          <p className="text-sm text-muted-foreground">
                            {reminder.resource_name} ({reminder.resource_email})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={reminder.sent ? 'default' : 'secondary'}>
                          {reminder.sent ? 'Sent' : 'Pending'}
                        </Badge>
                        {reminder.response_required && (
                          <Badge variant={reminder.response_received ? 'default' : 'outline'}>
                            {reminder.response_received ? 'Response Received' : 'Response Required'}
                          </Badge>
                        )}
                      </div>

                      {reminder.response_data && (
                        <div className="border-t pt-4">
                          <label className="text-sm font-medium">Team Response</label>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>On Track: {reminder.response_data.onTrack ? 'Yes' : 'No'}</p>
                            <p>Confidence: {reminder.response_data.confidence}%</p>
                            {reminder.response_data.needsRebaseline && (
                              <p className="text-orange-600 font-medium">
                                Rebaseline requested
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {reminder.sent_at && (
                        <div className="text-sm text-muted-foreground">
                          Sent: {format(new Date(reminder.sent_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RebaselineManagement;