import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function CheckIn() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    statusUpdate: '',
    blockers: '',
    keyAccomplishments: '',
    nextSteps: '',
    stakeholderNotes: '',
    progressUpdate: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('project_daily_checkins')
      .insert({
        project_id: projectId,
        checkin_date: new Date().toISOString().split('T')[0],
        status_update: formData.statusUpdate,
        blockers: formData.blockers.split('\n').filter(Boolean),
        progress_update: formData.progressUpdate,
        key_accomplishments: formData.keyAccomplishments.split('\n').filter(Boolean),
        next_steps: formData.nextSteps.split('\n').filter(Boolean),
        stakeholder_notes: formData.stakeholderNotes
      });

    if (error) {
      toast.error('Failed to submit check-in');
    } else {
      toast.success('Check-in submitted successfully');
      navigate('/projects');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Daily Project Check-In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Status Update</Label>
              <Textarea
                value={formData.statusUpdate}
                onChange={(e) => setFormData({...formData, statusUpdate: e.target.value})}
                placeholder="Overall project status..."
                required
              />
            </div>

            <div>
              <Label>Key Accomplishments (one per line)</Label>
              <Textarea
                value={formData.keyAccomplishments}
                onChange={(e) => setFormData({...formData, keyAccomplishments: e.target.value})}
                placeholder="What was completed today..."
              />
            </div>

            <div>
              <Label>Blockers (one per line)</Label>
              <Textarea
                value={formData.blockers}
                onChange={(e) => setFormData({...formData, blockers: e.target.value})}
                placeholder="Any issues blocking progress..."
              />
            </div>

            <div>
              <Label>Next Steps (one per line)</Label>
              <Textarea
                value={formData.nextSteps}
                onChange={(e) => setFormData({...formData, nextSteps: e.target.value})}
                placeholder="What's planned next..."
              />
            </div>

            <div>
              <Label>Notes for Stakeholders</Label>
              <Textarea
                value={formData.stakeholderNotes}
                onChange={(e) => setFormData({...formData, stakeholderNotes: e.target.value})}
                placeholder="Any specific updates for stakeholders..."
              />
            </div>

            <div>
              <Label>Progress Update (%)</Label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progressUpdate}
                onChange={(e) => setFormData({...formData, progressUpdate: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            <Button type="submit" className="w-full">
              Submit Daily Check-In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 