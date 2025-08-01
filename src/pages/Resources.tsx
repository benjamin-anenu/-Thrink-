
import React, { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import WorkspaceGuard from '@/components/WorkspaceGuard';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search } from 'lucide-react';
import ResourceCreationModal from '@/components/ResourceCreationModal';
import { useResources } from '@/contexts/ResourceContext';

const Resources = () => {
  const { resources, loading, error, refreshResourceAvailability } = useResources();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResources, setFilteredResources] = useState(resources);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);

  useEffect(() => {
    setFilteredResources(
      resources.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [resources, searchTerm]);

  const refreshResources = () => {
    refreshResourceAvailability();
  };

  return (
    <AuthGuard>
      <WorkspaceGuard>
        <Layout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Resources</h1>
                <p className="text-muted-foreground mt-2">
                  Manage your resources and allocate them efficiently across projects
                </p>
              </div>
              <Button onClick={() => setIsCreationModalOpen(true)} className="gap-2">
                <Plus size={16} />
                New Resource
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resource List</CardTitle>
                <CardDescription>Search and manage your resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {loading && <p className="text-muted-foreground">Loading resources...</p>}
                {error && <p className="text-destructive">Error loading resources: {error}</p>}

                {!loading && !error && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredResources.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No resources found.
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredResources.map(resource => (
                        <TableRow key={resource.id}>
                          <TableCell>{resource.name}</TableCell>
                          <TableCell>{resource.role}</TableCell>
                          <TableCell>{resource.status}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" disabled>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <ResourceCreationModal
              open={isCreationModalOpen}
              onOpenChange={setIsCreationModalOpen}
              onCreated={refreshResources}
            />
          </div>
        </Layout>
      </WorkspaceGuard>
    </AuthGuard>
  );
};

export default Resources;
