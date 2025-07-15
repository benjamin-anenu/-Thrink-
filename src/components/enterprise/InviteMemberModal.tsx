import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useEnterprise } from '@/contexts/EnterpriseContext';
import { WorkspaceService } from '@/services/WorkspaceService';
import { InvitationFormData } from '@/types/enterprise';
import { toast } from 'sonner';

const invitationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member', 'viewer']),
  message: z.string().max(500, 'Message must be 500 characters or less').optional(),
});

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInviteSent: () => void;
}

export function InviteMemberModal({ open, onOpenChange, onInviteSent }: InviteMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { currentWorkspace } = useEnterprise();

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      role: 'member',
      message: '',
    },
  });

  const onSubmit = async (data: InvitationFormData) => {
    if (!currentWorkspace) return;

    try {
      setIsLoading(true);
      await WorkspaceService.inviteMember(currentWorkspace.id, data);
      toast.success('Invitation sent successfully');
      form.reset();
      onOpenChange(false);
      onInviteSent();
    } catch (error: any) {
      console.error('Failed to send invitation:', error);
      if (error.message?.includes('duplicate')) {
        toast.error('This user has already been invited or is already a member');
      } else {
        toast.error('Failed to send invitation');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join {currentWorkspace?.name}. They'll receive an email with instructions to accept.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="colleague@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="viewer">
                        <div className="flex flex-col">
                          <span className="font-medium">Viewer</span>
                          <span className="text-xs text-muted-foreground">
                            Can view projects and data
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="member">
                        <div className="flex flex-col">
                          <span className="font-medium">Member</span>
                          <span className="text-xs text-muted-foreground">
                            Can create and edit projects
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex flex-col">
                          <span className="font-medium">Admin</span>
                          <span className="text-xs text-muted-foreground">
                            Can manage team and workspace settings
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the appropriate access level for this team member.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personal Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hi! I'd like to invite you to join our team..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add a personal note to make the invitation more welcoming.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}