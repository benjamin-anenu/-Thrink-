
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, AlertTriangle, CheckCircle, Zap, FileText, Download } from 'lucide-react';
import { AIProjectService, AIGeneratedContent, AIInsight } from '@/services/AIProjectService';
import { useProject } from '@/contexts/ProjectContext';

interface AIReviewStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const AIReviewStep: React.FC<AIReviewStepProps> = ({ data, onDataChange }) => {
  const [aiContent, setAiContent] = useState<AIGeneratedContent | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addProject } = useProject();

  useEffect(() => {
    if (!data.aiGenerated?.projectPlan) {
      generateAIContent();
    }
    generateInsights();
  }, []);

  const generateAIContent = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress steps
      const steps = [
        'Analyzing project requirements...',
        'Evaluating resource allocation...',
        'Identifying potential risks...',
        'Generating project plan...',
        'Creating recommendations...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress(((i + 1) / steps.length) * 100);
      }

      const content = await AIProjectService.generateProjectPlan(data);
      setAiContent(content);
      
      // Update the data with AI-generated content
      onDataChange({
        ...data,
        aiGenerated: {
          projectPlan: content.projectPlan,
          riskAssessment: content.riskAssessment,
          recommendations: content.recommendations
        }
      });
    } catch (error) {
      console.error('Error generating AI content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInsights = () => {
    const projectInsights = AIProjectService.generateProjectInsights(data);
    setInsights(projectInsights);
  };

  const handleRegenerateInsights = () => {
    generateAIContent();
    generateInsights();
  };

  const downloadProjectPlan = () => {
    const content = `${data.aiGenerated.projectPlan}\n\n${data.aiGenerated.riskAssessment}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.name || 'project'}-plan.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasAnalysis = data.aiGenerated?.projectPlan && data.aiGenerated?.riskAssessment;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">AI Review & Project Planning</h3>
          <p className="text-muted-foreground">
            Let AI analyze your project and generate comprehensive planning documents with ongoing insights.
          </p>
        </div>
        <Button 
          onClick={handleRegenerateInsights} 
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Generate AI Analysis'}
        </Button>
      </div>

      {isGenerating && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Zap className="h-6 w-6 text-primary animate-pulse" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">AI Analysis in Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-muted-foreground mt-2">
                  Setting up ongoing project monitoring and AI insights...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasAnalysis && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  AI-Generated Project Plan
                </CardTitle>
                <CardDescription>Comprehensive project execution plan with ongoing monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={data.aiGenerated.projectPlan}
                  onChange={(e) => onDataChange({
                    aiGenerated: {
                      ...data.aiGenerated,
                      projectPlan: e.target.value
                    }
                  })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Identified risks with continuous monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={data.aiGenerated.riskAssessment}
                  onChange={(e) => onDataChange({
                    aiGenerated: {
                      ...data.aiGenerated,
                      riskAssessment: e.target.value
                    }
                  })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
              <CardDescription>Best practices and suggestions with ongoing optimization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.aiGenerated.recommendations.map((recommendation: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{recommendation}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-info" />
                  <span className="text-sm font-medium text-info">Ongoing AI Monitoring</span>
                </div>
                <p className="text-xs text-info/80">
                  AI insights will continue analyzing your project throughout its lifecycle, providing updated recommendations based on actual progress and performance.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button onClick={downloadProjectPlan} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Project Plan
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AIReviewStep;
