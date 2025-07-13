import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, Plus, Trash2, Clock, Globe, Repeat } from 'lucide-react';
import { format } from 'date-fns';

interface BlackoutPeriod {
  id: string;
  name: string;
  description?: string;
  type: 'one-time' | 'recurring' | 'weekly' | 'holiday';
  startDate: Date;
  endDate: Date;
  startTime?: string;
  endTime?: string;
  timezone: string;
  days?: string[]; // For weekly recurring
  isActive: boolean;
}

const BlackoutPeriodsManager: React.FC = () => {
  const [blackoutPeriods, setBlackoutPeriods] = useState<BlackoutPeriod[]>([
    {
      id: '1',
      name: 'Company Holidays',
      description: 'No notifications during company holidays',
      type: 'holiday',
      startDate: new Date('2024-12-25'),
      endDate: new Date('2024-12-25'),
      timezone: 'UTC',
      isActive: true
    },
    {
      id: '2',
      name: 'Weekend Blackout',
      description: 'No notifications on weekends',
      type: 'weekly',
      startDate: new Date(),
      endDate: new Date(),
      days: ['Saturday', 'Sunday'],
      timezone: 'UTC',
      isActive: true
    }
  ]);

  const [newPeriod, setNewPeriod] = useState<Partial<BlackoutPeriod>>({
    name: '',
    type: 'one-time',
    timezone: 'UTC',
    isActive: true
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney'
  ];

  const weekDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleAddPeriod = () => {
    if (newPeriod.name && newPeriod.startDate) {
      const period: BlackoutPeriod = {
        id: Date.now().toString(),
        name: newPeriod.name,
        description: newPeriod.description,
        type: newPeriod.type || 'one-time',
        startDate: newPeriod.startDate,
        endDate: newPeriod.endDate || newPeriod.startDate,
        startTime: newPeriod.startTime,
        endTime: newPeriod.endTime,
        timezone: newPeriod.timezone || 'UTC',
        days: newPeriod.days,
        isActive: true
      };
      
      setBlackoutPeriods([...blackoutPeriods, period]);
      setNewPeriod({ name: '', type: 'one-time', timezone: 'UTC', isActive: true });
      setShowAddForm(false);
    }
  };

  const handleDeletePeriod = (id: string) => {
    setBlackoutPeriods(blackoutPeriods.filter(p => p.id !== id));
  };

  const togglePeriodStatus = (id: string) => {
    setBlackoutPeriods(blackoutPeriods.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'one-time': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'recurring': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'weekly': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'holiday': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Blackout Periods</h3>
          <p className="text-sm text-muted-foreground">
            Configure when notifications should be suppressed
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus size={16} />
          Add Period
        </Button>
      </div>

      {/* Add New Period Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Blackout Period</CardTitle>
            <CardDescription>Configure a new blackout period for notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={newPeriod.type} onValueChange={(value) => setNewPeriod({...newPeriod, type: value as any})}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="one-time">One-time</TabsTrigger>
                <TabsTrigger value="recurring">Recurring</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="holiday">Holiday</TabsTrigger>
              </TabsList>

              <TabsContent value="one-time" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Period Name</Label>
                    <Input
                      id="name"
                      value={newPeriod.name || ''}
                      onChange={(e) => setNewPeriod({...newPeriod, name: e.target.value})}
                      placeholder="e.g., System Maintenance"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={newPeriod.timezone} onValueChange={(value) => setNewPeriod({...newPeriod, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map(tz => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newPeriod.description || ''}
                    onChange={(e) => setNewPeriod({...newPeriod, description: e.target.value})}
                    placeholder="Brief description of the blackout period"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPeriod.startDate ? format(newPeriod.startDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPeriod.startDate}
                          onSelect={(date) => setNewPeriod({...newPeriod, startDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPeriod.endDate ? format(newPeriod.endDate, 'PPP') : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPeriod.endDate}
                          onSelect={(date) => setNewPeriod({...newPeriod, endDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time (Optional)</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={newPeriod.startTime || ''}
                      onChange={(e) => setNewPeriod({...newPeriod, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time (Optional)</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={newPeriod.endTime || ''}
                      onChange={(e) => setNewPeriod({...newPeriod, endTime: e.target.value})}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="weekly" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Period Name</Label>
                    <Input
                      id="name"
                      value={newPeriod.name || ''}
                      onChange={(e) => setNewPeriod({...newPeriod, name: e.target.value})}
                      placeholder="e.g., Weekend Blackout"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={newPeriod.timezone} onValueChange={(value) => setNewPeriod({...newPeriod, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map(tz => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Select Days</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {weekDays.map(day => (
                      <label key={day} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPeriod.days?.includes(day) || false}
                          onChange={(e) => {
                            const days = newPeriod.days || [];
                            if (e.target.checked) {
                              setNewPeriod({...newPeriod, days: [...days, day]});
                            } else {
                              setNewPeriod({...newPeriod, days: days.filter(d => d !== day)});
                            }
                          }}
                          className="rounded border-border"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddPeriod}>Add Period</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Blackout Periods */}
      <div className="space-y-4">
        {blackoutPeriods.map((period) => (
          <Card key={period.id} className={`${period.isActive ? '' : 'opacity-60'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{period.name}</h4>
                      <Badge className={getTypeColor(period.type)}>
                        {period.type}
                      </Badge>
                      {period.type === 'weekly' && (
                        <Repeat size={14} className="text-muted-foreground" />
                      )}
                      {period.timezone !== 'UTC' && (
                        <Globe size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    {period.description && (
                      <p className="text-sm text-muted-foreground mb-2">{period.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {format(period.startDate, 'MMM dd, yyyy')}
                        {period.endDate && period.endDate !== period.startDate && 
                          ` - ${format(period.endDate, 'MMM dd, yyyy')}`
                        }
                      </span>
                      {period.startTime && period.endTime && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {period.startTime} - {period.endTime}
                        </span>
                      )}
                      {period.days && (
                        <span>{period.days.join(', ')}</span>
                      )}
                      <span>{period.timezone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={period.isActive}
                    onCheckedChange={() => togglePeriodStatus(period.id)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePeriod(period.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {blackoutPeriods.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p>No blackout periods configured</p>
              <p className="text-sm mt-2">Add blackout periods to suppress notifications during specific times</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlackoutPeriodsManager;
