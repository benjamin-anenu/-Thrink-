import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, CheckCircle, XCircle, AlertTriangle, Settings, Zap } from 'lucide-react';
import { aiService } from '@/services/AIService';

interface AIConfigStatusProps {
  showDetails?: boolean;
  onConfigClick?: () => void;
}

const AIConfigStatus: React.FC<AIConfigStatusProps> = ({ 
  showDetails = true, 
  onConfigClick 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const config = aiService.getConfiguration();

  const testAIConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await aiService.generateCompletion([
        { 
          role: 'user', 
          content: 'Respond with "AI service is working correctly" if you receive this message.' 
        }
      ], {
        temperature: 0.1,
        maxTokens: 50,
        systemPrompt: 'You are a test assistant. Respond exactly as requested.'
      });

      const isWorking = response.content.toLowerCase().includes('working correctly') ||
                       response.content.toLowerCase().includes('working') ||
                       response.content.length > 10; // Basic check

      setTestResult({
        success: isWorking,
        message: isWorking 
          ? 'AI service is responding correctly!' 
          : 'AI responded but may not be working as expected',
        details: {
          response: response.content.substring(0, 100),
          usage: response.usage
        }
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error?.toString() }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!config.configured) return <XCircle className="h-4 w-4 text-destructive" />;
    if (testResult?.success) return <CheckCircle className="h-4 w-4 text-success" />;
    if (testResult?.success === false) return <XCircle className="h-4 w-4 text-destructive" />;
    return <AlertTriangle className="h-4 w-4 text-warning" />;
  };

  const getStatusBadge = () => {
    if (!config.configured) return <Badge variant="destructive">Not Configured</Badge>;
    if (testResult?.success) return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
    if (testResult?.success === false) return <Badge variant="destructive">Error</Badge>;
    return <Badge variant="secondary">Ready to Test</Badge>;
  };

  const getStatusMessage = () => {
    if (!config.configured) {
      return 'AI service is not configured. Add your API key to enable AI features.';
    }
    if (testResult) {
      return testResult.message;
    }
    return 'AI service is configured and ready to use.';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Service Status</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
        <CardDescription>
          Monitor and test your AI service connection
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">
              {config.provider.toUpperCase()} - {config.model}
            </p>
            <p className="text-xs text-muted-foreground">
              {getStatusMessage()}
            </p>
          </div>
        </div>

        {/* Configuration Details */}
        {showDetails && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Configuration</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Provider:</span>
                <span className="ml-2 font-mono">{config.provider}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Model:</span>
                <span className="ml-2 font-mono">{config.model}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Configured:</span>
                <span className="ml-2">{config.configured ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Method:</span>
                <span className="ml-2">
                  {import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true' ? 'Edge Function' : 'Direct API'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {testResult && (
          <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">{testResult.message}</p>
                {testResult.details?.response && (
                  <p className="text-xs bg-white/60 p-2 rounded border">
                    Response: "{testResult.details.response}..."
                  </p>
                )}
                {testResult.details?.usage && (
                  <p className="text-xs text-muted-foreground">
                    Tokens used: {testResult.details.usage.totalTokens}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={testAIConnection}
            disabled={!config.configured || isLoading}
            size="sm"
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-current" />
                Testing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3" />
                Test Connection
              </div>
            )}
          </Button>
          
          {onConfigClick && (
            <Button
              onClick={onConfigClick}
              size="sm"
              variant="ghost"
            >
              <Settings className="h-3 w-3 mr-1" />
              Configure
            </Button>
          )}
        </div>

        {/* Setup Instructions */}
        {!config.configured && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Setup Required</p>
                <ol className="text-xs space-y-1 list-decimal list-inside">
                  <li>Get an API key from OpenAI or Anthropic</li>
                  <li>Add VITE_OPENAI_API_KEY to your .env.local file</li>
                  <li>Restart your development server</li>
                  <li>Test the connection using the button above</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-2">
                  For production, use Supabase Edge Functions by setting VITE_USE_EDGE_FUNCTIONS=true
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AIConfigStatus;