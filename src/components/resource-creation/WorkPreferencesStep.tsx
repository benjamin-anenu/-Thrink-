import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Settings, Clock, Users, Zap } from 'lucide-react';
import { ResourceFormData } from '../ResourceCreationWizard';

interface WorkPreferencesStepProps {
  formData: ResourceFormData;
  updateFormData: (updates: Partial<ResourceFormData>) => void;
}

const WORK_STYLES = [
  'Collaborative',
  'Independent',
  'Mixed',
  'Leadership-focused'
];

const TASK_SWITCHING_PREFERENCES = [
  'Low - Prefers focus on single tasks',
  'Medium - Can handle moderate switching',
  'High - Thrives on multitasking'
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney'
];

const WEEK_DAYS = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const PRODUCTIVITY_PERIODS = [
  'Early Morning (6-9 AM)',
  'Late Morning (9-12 PM)',
  'Early Afternoon (12-3 PM)',
  'Late Afternoon (3-6 PM)',
  'Evening (6-9 PM)',
  'Night (9-12 AM)'
];

export function WorkPreferencesStep({ formData, updateFormData }: WorkPreferencesStepProps) {
  const toggleWorkDay = (day: string) => {
    const isSelected = formData.workDays.includes(day);
    const updatedDays = isSelected
      ? formData.workDays.filter(d => d !== day)
      : [...formData.workDays, day];
    updateFormData({ workDays: updatedDays });
  };

  const toggleProductivityPeriod = (period: string) => {
    const isSelected = formData.peakProductivityPeriods.includes(period);
    const updatedPeriods = isSelected
      ? formData.peakProductivityPeriods.filter(p => p !== period)
      : [...formData.peakProductivityPeriods, period];
    updateFormData({ peakProductivityPeriods: updatedPeriods });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Task & Workload Preferences
          </CardTitle>
          <CardDescription>
            Configure optimal task allocation and working patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Optimal Tasks per Day: {formData.optimalTaskCountPerDay}</Label>
              <Slider
                value={[formData.optimalTaskCountPerDay]}
                onValueChange={([value]) => updateFormData({ optimalTaskCountPerDay: value })}
                max={15}
                min={1}
                step={1}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Recommended daily task load for optimal performance
              </p>
            </div>

            <div className="space-y-2">
              <Label>Optimal Tasks per Week: {formData.optimalTaskCountPerWeek}</Label>
              <Slider
                value={[formData.optimalTaskCountPerWeek]}
                onValueChange={([value]) => updateFormData({ optimalTaskCountPerWeek: value })}
                max={75}
                min={5}
                step={5}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Weekly task capacity for sustainable productivity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preferred Work Style</Label>
              <Select
                value={formData.preferredWorkStyle}
                onValueChange={(value) => updateFormData({ preferredWorkStyle: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Task Switching Preference</Label>
              <Select
                value={formData.taskSwitchingPreference}
                onValueChange={(value) => updateFormData({ taskSwitchingPreference: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_SWITCHING_PREFERENCES.map((pref) => (
                    <SelectItem key={pref} value={pref}>
                      {pref}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule & Time Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => updateFormData({ timezone: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Available Work Days</Label>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map((day) => (
                <Badge
                  key={day}
                  variant={formData.workDays.includes(day) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleWorkDay(day)}
                >
                  {day}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Peak Productivity Periods</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {PRODUCTIVITY_PERIODS.map((period) => (
                <div key={period} className="flex items-center space-x-2">
                  <Checkbox
                    id={period}
                    checked={formData.peakProductivityPeriods.includes(period)}
                    onCheckedChange={() => toggleProductivityPeriod(period)}
                  />
                  <Label htmlFor={period} className="text-sm">
                    {period}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}