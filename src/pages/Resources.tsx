
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ResourceGrid from '@/components/ResourceGrid';
import EnhancedResourceGrid from '@/components/EnhancedResourceGrid';
import ResourceCreationWizard from '@/components/ResourceCreationWizard';
import { ViewToggle } from '@/components/ViewToggle';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Resources: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'standard' | 'enhanced'>('enhanced');

  const handleResourceCreated = () => {
    setIsWizardOpen(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Resource Management</h1>
          <div className="flex items-center gap-4">
            <ViewToggle
              currentView={currentView}
              onViewChange={setCurrentView}
              views={[
                { key: 'standard', label: 'Standard', icon: 'Grid' },
                { key: 'enhanced', label: 'Enhanced', icon: 'Sparkles' }
              ]}
            />
            <Button onClick={() => setIsWizardOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {currentView === 'enhanced' ? (
            <EnhancedResourceGrid />
          ) : (
            <ResourceGrid />
          )}
        </div>

        {isWizardOpen && (
          <ResourceCreationWizard
            isOpen={true}
            onClose={() => setIsWizardOpen(false)}
            onResourceCreated={handleResourceCreated}
          />
        )}
      </div>
    </Layout>
  );
};

export default Resources;
