import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Target, Calendar as CalendarIcon2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TimelineStepProps {
  onNext: () => void;
  onBack: () => void;
  formData: any;
  updateFormData: (data: any) => void;
}

const TimelineStep: React.FC<TimelineStepProps> = ({
  onNext,
  onBack,
  formData,
  updateFormData
}) => {
  const [startDate, setStartDate] = useState<Date | undefined>(
    formData.startDate ? new Date(formData.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    formData.endDate ? new Date(formData.endDate) : undefined
  );
  const [milestones, setMilestones] = useState<Array<{
    id: string;
    name: string;
    date: Date;
    description: string;
  }>>(formData.milestones || []);

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const addMilestone = () => {
    const newMilestone = {
      id: `milestone-${Date.now()}`,
      name: '',
      date: new Date(),
      description: ''
    };
    setMilestones([...milestones, newMilestone]);
  };

  const updateMilestone = (id: string, field: string, value: any) => {
    setMilestones(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const handleNext = () => {
    if (!startDate || !endDate) {
      alert('Please select start and end dates');
      return;
    }

    updateFormData({
      ...formData,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      duration: calculateDuration(),
      milestones: milestones.map(m => ({
        ...m,
        date: m.date.toISOString().split('T')[0]
      }))
    });
    onNext();
  };

  const getPhaseRecommendation = () => {
    const duration = calculateDuration();
    if (duration <= 30) return 'Sprint-based (2-4 weeks)';
    if (duration <= 90) return 'Phase-based (1-3 months)';
    if (duration <= 180) return 'Quarter-based (3-6 months)';
    return 'Long-term (6+ months)';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon2 className="h-5 w-5" />
            Project Timeline
          </CardTitle>
          <CardDescription>
            Set project start and end dates, and define key milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Duration Summary */}
          {startDate && endDate && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{calculateDuration()}</div>
                <div className="text-sm text-muted-foreground">Total Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.ceil(calculateDuration() / 7)}
                </div>
                <div className="text-sm text-muted-foreground">Weeks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {Math.ceil(calculateDuration() / 30)}
                </div>
                <div className="text-sm text-muted-foreground">Months</div>
              </div>
            </div>
          )}

          {/* Phase Recommendation */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Recommended Approach</Label>
            </div>
            <Badge variant="secondary">{getPhaseRecommendation()}</Badge>
          </div>

          {/* Milestones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Key Milestones</Label>
              <Button variant="outline" size="sm" onClick={addMilestone}>
                Add Milestone
              </Button>
            </div>

            {milestones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon2 className="h-8 w-8 mx-auto mb-2" />
                <p>No milestones defined yet</p>
                <p className="text-sm">Add key project milestones to track progress</p>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Milestone {index + 1}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(milestone.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Name</Label>
                        <Input
                          value={milestone.name}
                          onChange={(e) => updateMilestone(milestone.id, 'name', e.target.value)}
                          placeholder="e.g., Design Complete"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {format(milestone.date, "PPP")}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={milestone.date}
                              onSelect={(date) => updateMilestone(milestone.id, 'date', date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Description</Label>
                      <Input
                        value={milestone.description}
                        onChange={(e) => updateMilestone(milestone.id, 'description', e.target.value)}
                        placeholder="Brief description of this milestone"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline Validation */}
          {startDate && endDate && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Timeline Summary</span>
              </div>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Project duration: {calculateDuration()} days</p>
                <p>• {milestones.length} milestone{milestones.length !== 1 ? 's' : ''} defined</p>
                <p>• Recommended approach: {getPhaseRecommendation()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!startDate || !endDate}
        >
          Next: Budget Planning
        </Button>
      </div>
    </div>
  );
};

export default TimelineStep; 