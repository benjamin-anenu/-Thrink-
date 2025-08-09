import React from 'react';
import Layout from '@/components/Layout';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SystemPortfolio: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();
  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio (Coming Soon)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Cross-workspace portfolio analytics are coming soon for system owners.</p>
                  <div className="mt-4"><Badge variant="secondary">Coming soon</Badge></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default SystemPortfolio;
