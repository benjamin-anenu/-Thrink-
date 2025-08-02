
import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Building2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const FirstUserOnboarding: React.FC = () => {
  const { addWorkspace } = useWorkspace();
  const { refreshAuth } = useAuth();
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!workspaceName.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    setIsCreating(true);
    
    try {
      await addWorkspace(workspaceName.trim(), workspaceDescription.trim() || undefined);
      
      setIsCompleted(true);
      toast.success('Workspace created successfully!');
      
      // Refresh auth to update first user status and redirect to dashboard
      setTimeout(async () => {
        await refreshAuth();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace. Please try again.');
      setIsCreating(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <div className="absolute inset-0 animate-ping">
                  <CheckCircle className="h-16 w-16 text-green-500 opacity-75" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome to Your Workspace!
            </h2>
            <p className="text-muted-foreground mb-4">
              Your workspace "{workspaceName}" has been created successfully.
              Redirecting you to the dashboard...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Building2 className="h-12 w-12 text-primary" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome to Tink!
          </h1>
          <p className="text-muted-foreground">
            Let's start by creating your first workspace
          </p>
        </div>

        {/* Workspace Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Create Your Workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">
                  Workspace Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="workspace-name"
                  type="text"
                  placeholder="e.g., My Company, Team Alpha"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workspace-description">
                  Description (Optional)
                </Label>
                <Textarea
                  id="workspace-description"
                  placeholder="Briefly describe your workspace..."
                  value={workspaceDescription}
                  onChange={(e) => setWorkspaceDescription(e.target.value)}
                  disabled={isCreating}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCreating || !workspaceName.trim()}
                size="lg"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Workspace...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Create Workspace
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Benefits List */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            What you'll get:
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Project management tools</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Resource allocation & tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>AI-powered insights</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>Team collaboration features</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirstUserOnboarding;
