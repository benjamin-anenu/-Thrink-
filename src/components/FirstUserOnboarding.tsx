
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Crown, Building2, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

const FirstUserOnboarding: React.FC = () => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { user, profile } = useAuth();
  const { addWorkspace } = useWorkspace();
  const { toast } = useToast();

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;

    setIsCreating(true);
    
    try {
      await addWorkspace(workspaceName.trim(), workspaceDescription.trim());
      
      toast({
        title: "Welcome to your workspace! 🎉",
        description: `${workspaceName} has been created and you're ready to start managing projects.`,
      });
    } catch (error) {
      console.error('Error creating first workspace:', error);
      toast({
        title: "Error creating workspace",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/10">
              <Crown className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome, System Owner! 👑
            </h1>
            <p className="text-lg text-muted-foreground">
              Hi {profile?.full_name || user?.email?.split('@')[0] || 'there'}! You're the first user, 
              which makes you the system owner with full access to manage all workspaces.
            </p>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Building2 className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">Unlimited Workspaces</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Create and manage multiple workspaces for different teams, projects, or clients.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">Global Access</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                As system owner, you have access to all workspaces and can manage users across the entire system.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workspace Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create Your First Workspace
            </CardTitle>
            <CardDescription>
              Let's start by creating your first workspace. You can always create more later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspaceName">Workspace Name *</Label>
                <Input
                  id="workspaceName"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g., Acme Corp, Marketing Team, Personal Projects"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workspaceDescription">Description (optional)</Label>
                <Textarea
                  id="workspaceDescription"
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  placeholder="Describe what this workspace is for..."
                  rows={3}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!workspaceName.trim() || isCreating}
              >
                {isCreating ? (
                  'Creating Workspace...'
                ) : (
                  <>
                    Create Workspace & Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Pro Tip */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="p-1 rounded-full bg-primary/10 flex-shrink-0">
                <Crown className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Pro Tip</h4>
                <p className="text-xs text-muted-foreground">
                  As the system owner, you can invite users to any workspace and promote them to admins 
                  for cross-workspace access. Regular members will only see their assigned workspaces.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FirstUserOnboarding;
