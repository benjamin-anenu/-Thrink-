
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings } from 'lucide-react';
import { DepartmentManager } from './config/DepartmentManager';
import { SkillManager } from './config/SkillManager';
import { EscalationTriggerManager } from './config/EscalationTriggerManager';

export const GlobalConfigModal = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Global Config
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Global Configuration</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="departments" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="escalation">Escalation Triggers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="departments" className="space-y-4">
            <DepartmentManager />
          </TabsContent>
          
          <TabsContent value="skills" className="space-y-4">
            <SkillManager />
          </TabsContent>
          
          <TabsContent value="escalation" className="space-y-4">
            <EscalationTriggerManager />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
