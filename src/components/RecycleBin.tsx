
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Trash2, RotateCcw, Calendar, User, FolderOpen } from 'lucide-react';
import { useRecycleBin } from '@/hooks/useRecycleBin';
import { formatDistanceToNow } from 'date-fns';

interface RecycleBinProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecycleBin: React.FC<RecycleBinProps> = ({ isOpen, onClose }) => {
  const { items, loading, restoreItem, permanentlyDelete } = useRecycleBin();
  const [activeTab, setActiveTab] = useState('all');

  const filteredItems = activeTab === 'all' ? items : items.filter(item => item.item_type === activeTab);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'project':
        return <FolderOpen className="h-4 w-4" />;
      case 'resource':
        return <User className="h-4 w-4" />;
      case 'stakeholder':
        return <User className="h-4 w-4" />;
      default:
        return <FolderOpen className="h-4 w-4" />;
    }
  };

  const getItemName = (item: any) => {
    return item.item_data?.name || `${item.item_type} ${item.item_id}`;
  };

  const getTimeUntilAutoDelete = (autoDeleteAt: string) => {
    const autoDeleteDate = new Date(autoDeleteAt);
    const now = new Date();
    
    if (autoDeleteDate < now) {
      return 'Scheduled for deletion';
    }
    
    return `Auto-delete in ${formatDistanceToNow(autoDeleteDate)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Recycle Bin
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="project">Projects ({items.filter(i => i.item_type === 'project').length})</TabsTrigger>
            <TabsTrigger value="resource">Resources ({items.filter(i => i.item_type === 'resource').length})</TabsTrigger>
            <TabsTrigger value="stakeholder">Stakeholders ({items.filter(i => i.item_type === 'stakeholder').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading recycle bin...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <Trash2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No items in recycle bin</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getItemIcon(item.item_type)}
                          <div>
                            <CardTitle className="text-base">{getItemName(item)}</CardTitle>
                            <CardDescription>
                              <Badge variant="outline" className="capitalize">
                                {item.item_type}
                              </Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Deleted {formatDistanceToNow(new Date(item.deleted_at))} ago</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{getTimeUntilAutoDelete(item.auto_delete_at)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => restoreItem(item.id)}
                          className="flex-1"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="flex-1">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Forever
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Permanently Delete Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete "{getItemName(item)}" 
                                and remove all associated data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => permanentlyDelete(item.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete Forever
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RecycleBin;
