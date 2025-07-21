import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Settings, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface EscalationTrigger {
  id: string;
  name: string;
  description?: string;
  condition_type: string;
  threshold_value?: number;
  threshold_unit?: string;
  is_active: boolean;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

const EscalationTriggersManagement = () => {
  const { currentWorkspace } = useWorkspace();
  const [triggers, setTriggers] = useState<EscalationTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTriggers();
  }, [currentWorkspace]);

  const fetchTriggers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('escalation_triggers')
        .select('*')
        .order('name');

      if (error) throw error;
      setTriggers(data || []);
    } catch (error) {
      console.error('Error fetching escalation triggers:', error);
      toast.error('Failed to load escalation triggers');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (triggerId: string, isActive: boolean) => {
    if (!currentWorkspace) return;

    try {
      // When enabling, set workspace_id; when disabling, remove workspace_id
      const updateData = isActive 
        ? {
            workspace_id: currentWorkspace.id,
            is_active: true,
            updated_at: new Date().toISOString()
          }
        : {
            workspace_id: null,
            is_active: false,
            updated_at: new Date().toISOString()
          };

      const { error } = await supabase
        .from('escalation_triggers')
        .update(updateData)
        .eq('id', triggerId);

      if (error) throw error;

      setTriggers(prev => prev.map(trigger => 
        trigger.id === triggerId 
          ? { 
              ...trigger, 
              is_active: isActive,
              workspace_id: isActive ? currentWorkspace.id : null 
            }
          : trigger
      ));

      toast.success(`Trigger ${isActive ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating trigger:', error);
      toast.error('Failed to update trigger');
    }
  };

  const handleUpdateThreshold = async (triggerId: string, value: number, unit: string) => {
    if (!currentWorkspace) return;

    try {
      const { error } = await supabase
        .from('escalation_triggers')
        .update({
          threshold_value: value,
          threshold_unit: unit,
          updated_at: new Date().toISOString()
        })
        .eq('id', triggerId);

      if (error) throw error;

      setTriggers(prev => prev.map(trigger => 
        trigger.id === triggerId 
          ? { 
              ...trigger, 
              threshold_value: value, 
              threshold_unit: unit
            }
          : trigger
      ));

      toast.success('Threshold updated successfully');
    } catch (error) {
      console.error('Error updating threshold:', error);
      toast.error('Failed to update threshold');
    }
  };

  const handleSaveAll = async () => {
    if (!currentWorkspace) return;

    setSaving(true);
    try {
      const activeWorkspaceTriggers = triggers.filter(trigger => 
        trigger.workspace_id === currentWorkspace.id && trigger.is_active
      );

      if (activeWorkspaceTriggers.length > 0) {
        const updatePromises = activeWorkspaceTriggers.map(trigger => 
          supabase
            .from('escalation_triggers')
            .update({
              workspace_id: currentWorkspace.id,
              is_active: trigger.is_active,
              threshold_value: trigger.threshold_value,
              threshold_unit: trigger.threshold_unit,
              updated_at: new Date().toISOString()
            })
            .eq('id', trigger.id)
        );

        const results = await Promise.all(updatePromises);
        const errors = results.filter(result => result.error);

        if (errors.length > 0) {
          throw new Error(`Failed to save ${errors.length} triggers`);
        }
      }

      toast.success('Escalation triggers saved successfully');
    } catch (error) {
      console.error('Error saving triggers:', error);
      toast.error('Failed to save escalation triggers');
    } finally {
      setSaving(false);
    }
  };

  const filteredTriggers = triggers.filter(trigger =>
    trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trigger.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUnitOptions = (conditionType: string) => {
    switch (conditionType) {
      case 'task_overdue':
      case 'milestone_delay':
      case 'communication_gap':
      case 'dependency_blocking':
      case 'resource_unavailable':
        return ['days', 'hours'];
      case 'budget_exceeded':
      case 'resource_overallocation':
      case 'quality_score':
      case 'client_satisfaction':
      case 'velocity_drop':
      case 'risk_level':
      case 'scope_creep':
      case 'testing_failure':
        return ['percentage'];
      case 'deployment_issues':
        return ['count'];
      case 'stakeholder_unavailable':
        return ['hours', 'days'];
      default:
        return ['days', 'hours', 'percentage', 'count'];
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Escalation Triggers</h3>
          <p className="text-sm text-muted-foreground">
            Configure automatic escalation conditions for your projects
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save All'}
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search escalation triggers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredTriggers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No escalation triggers found</h3>
              <p className="text-muted-foreground">
                No triggers match your search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTriggers.map((trigger) => {
            const isWorkspaceEnabled = trigger.workspace_id === currentWorkspace?.id;
            const unitOptions = getUnitOptions(trigger.condition_type);
            
            return (
              <Card key={trigger.id} className={isWorkspaceEnabled ? 'border-primary/20' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isWorkspaceEnabled && trigger.is_active}
                        onCheckedChange={(checked) => 
                          handleToggleActive(trigger.id, !!checked)
                        }
                      />
                      <div>
                        <CardTitle className="text-base">{trigger.name}</CardTitle>
                        {trigger.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {trigger.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={isWorkspaceEnabled ? 'default' : 'secondary'}>
                      {isWorkspaceEnabled ? 'Enabled' : 'Available'}
                    </Badge>
                  </div>
                </CardHeader>
                
                {isWorkspaceEnabled && (
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Threshold:</Label>
                        <Input
                          type="number"
                          value={trigger.threshold_value || 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0;
                            handleUpdateThreshold(
                              trigger.id, 
                              value, 
                              trigger.threshold_unit || unitOptions[0]
                            );
                          }}
                          className="w-20"
                          min="1"
                        />
                        <Select
                          value={trigger.threshold_unit || unitOptions[0]}
                          onValueChange={(unit) => 
                            handleUpdateThreshold(
                              trigger.id, 
                              trigger.threshold_value || 1, 
                              unit
                            )
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {unitOptions.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EscalationTriggersManagement;
