
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Calendar, Clock, Users, MessageSquare, Paperclip, 
  CheckCircle, AlertTriangle, Plus, Edit3, Save, X 
} from 'lucide-react';
import { Task } from './TaskCard';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, isOpen, onClose, onSave }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(task);

  React.useEffect(() => {
    setEditedTask(task);
    setEditMode(false);
  }, [task]);

  if (!task || !editedTask) return null;

  const handleSave = () => {
    onSave(editedTask);
    setEditMode(false);
  };

  const mockComments = [
    { id: '1', author: 'Sarah Chen', content: 'Initial requirements have been clarified with the client.', timestamp: '2 hours ago', avatar: 'SC' },
    { id: '2', author: 'Mike Johnson', content: 'Added wireframes to the attachments section.', timestamp: '4 hours ago', avatar: 'MJ' },
    { id: '3', author: 'Alex Kim', content: 'Timeline looks aggressive but achievable with current resources.', timestamp: '1 day ago', avatar: 'AK' }
  ];

  const mockAttachments = [
    { id: '1', name: 'requirements-doc.pdf', size: '2.4 MB', type: 'pdf' },
    { id: '2', name: 'wireframes-v2.fig', size: '1.8 MB', type: 'figma' },
    { id: '3', name: 'user-stories.xlsx', size: '856 KB', type: 'excel' }
  ];

  const subtasks = [
    { id: '1', title: 'Research user requirements', completed: true },
    { id: '2', title: 'Create initial wireframes', completed: true },
    { id: '3', title: 'Design system setup', completed: false },
    { id: '4', title: 'Component development', completed: false },
    { id: '5', title: 'Testing and refinement', completed: false }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">{editedTask.title}</DialogTitle>
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button onClick={() => setEditMode(false)} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Task Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Task Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {editMode ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <Input 
                            value={editedTask.title}
                            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <Textarea 
                            value={editedTask.description}
                            onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                          <p className="text-sm">{editedTask.description}</p>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {editedTask.tag.label}
                      </Badge>
                      {editedTask.health && (
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${
                            editedTask.health.status === 'green' ? 'bg-green-500' :
                            editedTask.health.status === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-sm text-muted-foreground">Health: {editedTask.health.score}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Progress & Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Progress & Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{Math.round((editedTask.progress.completed / editedTask.progress.total) * 100)}%</span>
                      </div>
                      <Progress value={(editedTask.progress.completed / editedTask.progress.total) * 100} />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Due Date</p>
                          <p className="text-muted-foreground">{editedTask.dueDate}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Assignees</p>
                          <p className="text-muted-foreground">{editedTask.assignees} members</p>
                        </div>
                      </div>
                    </div>

                    {editedTask.project && (
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Project</label>
                        <p className="text-sm font-medium">{editedTask.project}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="subtasks" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Subtasks</CardTitle>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Subtask
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                          subtask.completed ? 'bg-green-500 border-green-500' : 'border-muted-foreground'
                        }`}>
                          {subtask.completed && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`flex-1 ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {subtask.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                          {comment.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.author}</span>
                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-3 pt-4 border-t">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        You
                      </div>
                      <div className="flex-1">
                        <Textarea placeholder="Add a comment..." rows={3} />
                        <Button size="sm" className="mt-2">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Attachments</CardTitle>
                    <Button size="sm">
                      <Paperclip className="h-4 w-4 mr-1" />
                      Add File
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockAttachments.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Paperclip className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{file.size}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
