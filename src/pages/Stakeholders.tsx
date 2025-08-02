
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import StakeholderForm from '@/components/StakeholderForm';
import StakeholderGridView from '@/components/StakeholderGridView';
import StakeholderListView from '@/components/StakeholderListView';
import ViewToggle from '@/components/ViewToggle';
import { Card, CardContent } from '@/components/ui/card';

const Stakeholders = () => {
  const { stakeholders, loading } = useStakeholders();
  const { currentWorkspace } = useWorkspace();
  const [showStakeholderForm, setShowStakeholderForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter stakeholders based on search
  const filteredStakeholders = useMemo(() => {
    return stakeholders.filter(stakeholder =>
      stakeholder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stakeholder.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stakeholder.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      stakeholder.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stakeholders, searchTerm]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">Loading stakeholders...</div>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Workspace Selected</h2>
          <p className="text-muted-foreground">Please select a workspace to view stakeholders.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stakeholders</h1>
          <p className="text-muted-foreground mt-2">
            Manage project stakeholders and their involvement
          </p>
        </div>
        <Button onClick={() => setShowStakeholderForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Stakeholder
        </Button>
      </div>

      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search stakeholders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-muted' : ''}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <ViewToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Stakeholders Display */}
      {viewMode === 'grid' ? (
        <StakeholderGridView stakeholders={filteredStakeholders} />
      ) : (
        <StakeholderListView stakeholders={filteredStakeholders} />
      )}

      {filteredStakeholders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">No stakeholders found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm
                ? 'Try adjusting your search terms.'
                : 'Get started by adding your first stakeholder.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowStakeholderForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Stakeholder
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stakeholder Form Modal */}
      {showStakeholderForm && (
        <StakeholderForm 
          open={showStakeholderForm}
          onClose={() => setShowStakeholderForm(false)}
          onSave={() => setShowStakeholderForm(false)}
        />
      )}
    </div>
  );
};

export default Stakeholders;
