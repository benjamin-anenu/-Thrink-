import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectDraftService, ProjectDraft } from '@/services/ProjectDraftService';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import { Trash2, Calendar, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DraftManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: ProjectDraft) => void;
}

export const DraftManagementModal: React.FC<DraftManagementModalProps> = ({
  isOpen,
  onClose,
  onLoadDraft,
}) => {
  const [drafts, setDrafts] = useState<ProjectDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    if (isOpen && currentWorkspace) {
      loadDrafts();
    }
  }, [isOpen, currentWorkspace]);

  const loadDrafts = async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    try {
      const draftList = await ProjectDraftService.getDrafts(currentWorkspace.id);
      setDrafts(draftList);
    } catch (error) {
      console.error('Error loading drafts:', error);
      toast.error('Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    setDeleting(draftId);
    try {
      await ProjectDraftService.deleteDraft(draftId);
      setDrafts(drafts.filter(d => d.id !== draftId));
      toast.success('Draft deleted successfully');
    } catch (error) {
      console.error('Error deleting draft:', error);
      toast.error('Failed to delete draft');
    } finally {
      setDeleting(null);
    }
  };

  const handleLoadDraft = (draft: ProjectDraft) => {
    onLoadDraft(draft);
    onClose();
  };

  const getStepName = (step: number) => {
    const steps = [
      'Project Details',
      'Requirements Gathering', 
      'Resource Planning',
      'Stakeholder Management',
      'Milestone Planning',
      'Kickoff Session',
      'AI Review',
      'Project Initiation'
    ];
    return steps[step - 1] || `Step ${step}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Project Drafts</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No drafts found. Start creating a project to save drafts automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{draft.draft_name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Last modified {formatDistanceToNow(new Date(draft.last_modified))} ago
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Created {formatDistanceToNow(new Date(draft.created_at))} ago
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary">
                        {getStepName(draft.current_step)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadDraft(draft)}
                    >
                      Load Draft
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDraft(draft.id)}
                      disabled={deleting === draft.id}
                    >
                      {deleting === draft.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};