import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { ResourceFormData } from '../ResourceCreationWizard';

interface AvailabilityPatternsStepProps {
  formData: ResourceFormData;
  updateFormData: (updates: Partial<ResourceFormData>) => void;
}

const TIME_OFF_REASONS = [
  'Vacation',
  'Personal Leave',
  'Medical Leave',
  'Training',
  'Conference',
  'Other'
];

const COMMITMENT_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const TIME_SLOTS = [
  '9:00-10:00 AM',
  '10:00-11:00 AM',
  '11:00-12:00 PM',
  '12:00-1:00 PM',
  '1:00-2:00 PM',
  '2:00-3:00 PM',
  '3:00-4:00 PM',
  '4:00-5:00 PM',
  '5:00-6:00 PM'
];

export function AvailabilityPatternsStep({ formData, updateFormData }: AvailabilityPatternsStepProps) {
  const [newTimeOff, setNewTimeOff] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [newCommitment, setNewCommitment] = useState({
    day: '',
    timeSlot: '',
    description: ''
  });

  const addTimeOff = () => {
    if (!newTimeOff.startDate || !newTimeOff.endDate || !newTimeOff.reason) return;

    updateFormData({
      plannedTimeOff: [...formData.plannedTimeOff, newTimeOff]
    });

    setNewTimeOff({ startDate: '', endDate: '', reason: '' });
  };

  const removeTimeOff = (index: number) => {
    const updated = formData.plannedTimeOff.filter((_, i) => i !== index);
    updateFormData({ plannedTimeOff: updated });
  };

  const addCommitment = () => {
    if (!newCommitment.day || !newCommitment.timeSlot || !newCommitment.description) return;

    updateFormData({
      recurringCommitments: [...formData.recurringCommitments, newCommitment]
    });

    setNewCommitment({ day: '', timeSlot: '', description: '' });
  };

  const removeCommitment = (index: number) => {
    const updated = formData.recurringCommitments.filter((_, i) => i !== index);
    updateFormData({ recurringCommitments: updated });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Contract & Employment Details
          </CardTitle>
          <CardDescription>
            Employment term information for planning purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contractEndDate">Contract End Date (Optional)</Label>
            <Input
              id="contractEndDate"
              type="date"
              value={formData.contractEndDate || ''}
              onChange={(e) => updateFormData({ contractEndDate: e.target.value || undefined })}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty for permanent positions
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Planned Time Off
          </CardTitle>
          <CardDescription>
            Known vacation days, leaves, and unavailable periods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newTimeOff.startDate}
                onChange={(e) => setNewTimeOff(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={newTimeOff.endDate}
                onChange={(e) => setNewTimeOff(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select
                value={newTimeOff.reason}
                onValueChange={(value) => setNewTimeOff(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_OFF_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Button
                onClick={addTimeOff}
                disabled={!newTimeOff.startDate || !newTimeOff.endDate || !newTimeOff.reason}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Time Off
              </Button>
            </div>
          </div>

          {formData.plannedTimeOff.length > 0 && (
            <div className="space-y-2">
              <Label>Current Time Off Plans</Label>
              {formData.plannedTimeOff.map((timeOff, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{timeOff.reason}</span>
                    <span className="text-muted-foreground ml-2">
                      {timeOff.startDate} to {timeOff.endDate}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeTimeOff(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recurring Commitments
          </CardTitle>
          <CardDescription>
            Regular meetings, training sessions, or other scheduled commitments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label>Day</Label>
              <Select
                value={newCommitment.day}
                onValueChange={(value) => setNewCommitment(prev => ({ ...prev, day: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {COMMITMENT_DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select
                value={newCommitment.timeSlot}
                onValueChange={(value) => setNewCommitment(prev => ({ ...prev, timeSlot: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="e.g., Team standup"
                value={newCommitment.description}
                onChange={(e) => setNewCommitment(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="md:col-span-3">
              <Button
                onClick={addCommitment}
                disabled={!newCommitment.day || !newCommitment.timeSlot || !newCommitment.description}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Recurring Commitment
              </Button>
            </div>
          </div>

          {formData.recurringCommitments.length > 0 && (
            <div className="space-y-2">
              <Label>Current Recurring Commitments</Label>
              {formData.recurringCommitments.map((commitment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <span className="font-medium">{commitment.description}</span>
                    <span className="text-muted-foreground ml-2">
                      {commitment.day}s at {commitment.timeSlot}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeCommitment(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}