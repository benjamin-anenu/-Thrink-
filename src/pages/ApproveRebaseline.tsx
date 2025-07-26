import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function ApproveRebaseline() {
  const { approvalId } = useParams();
  const navigate = useNavigate();
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [approval, setApproval] = useState<any>(null);

  useEffect(() => {
    const fetchApproval = async () => {
      const { data, error } = await supabase
        .from('rebaseline_approvals')
        .select(`*, confirmation:resource_delivery_confirmations(*, task:project_tasks(*))`)
        .eq('id', approvalId)
        .single();
      if (data) setApproval(data);
    };
    fetchApproval();
  }, [approvalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) {
      toast.error('Please select a decision');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('rebaseline_approvals')
      .update({
        status: decision,
        decision_date: new Date().toISOString(),
        decision_notes: notes
      })
      .eq('id', approvalId);
    setLoading(false);
    if (error) {
      toast.error('Failed to submit decision');
    } else {
      toast.success('Decision submitted successfully');
      navigate('/projects');
    }
  };

  if (!approval) {
    return <div className="container max-w-2xl mx-auto py-8 text-center">Loading approval details...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Rebaseline Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="mb-2 font-semibold">Task: {approval.confirmation?.task?.name}</div>
            <div className="mb-2">Original Date: {approval.original_date}</div>
            <div className="mb-2">Proposed Date: {approval.proposed_date}</div>
            <div className="mb-2">Reason: {approval.reason}</div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Decision</Label>
              <div className="flex gap-4 mt-2">
                <Button type="button" variant={decision === 'approved' ? 'default' : 'outline'} onClick={() => setDecision('approved')}>
                  Approve
                </Button>
                <Button type="button" variant={decision === 'rejected' ? 'destructive' : 'outline'} onClick={() => setDecision('rejected')}>
                  Reject
                </Button>
              </div>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes for your decision..."
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              Submit Decision
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 