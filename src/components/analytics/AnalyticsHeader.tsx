
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Settings, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { systemValidationService } from '@/services/SystemValidationService';

interface AnalyticsHeaderProps {
  systemHealth?: any;
}

const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ systemHealth }) => {
  const handleRefresh = async () => {
    await systemValidationService.performSystemValidation();
    window.location.reload();
  };

  const getHealthStatus = () => {
    if (!systemHealth) return { variant: 'secondary' as const, text: 'Checking...', icon: RefreshCw };
    
    if (systemHealth.isHealthy) {
      return { 
        variant: 'default' as const, 
        text: `Healthy (${systemHealth.overallScore}%)`, 
        icon: CheckCircle 
      };
    } else {
      return { 
        variant: 'destructive' as const, 
        text: `Issues Detected (${systemHealth.overallScore}%)`, 
        icon: AlertTriangle 
      };
    }
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor project performance, team productivity, and system health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={healthStatus.variant} className="flex items-center gap-1">
            <HealthIcon className="h-3 w-3" />
            System {healthStatus.text}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
