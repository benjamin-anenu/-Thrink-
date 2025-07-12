
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, AlertTriangle, CheckCircle, Zap, FileText, Download } from 'lucide-react';

interface AIReviewStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const AIReviewStep: React.FC<AIReviewStepProps> = ({ data, onDataChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateAIAnalysis = async () => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate AI processing
    const steps = [
      'Analyzing project requirements...',
      'Evaluating resource allocation...',
      'Identifying potential risks...',
      'Generating project plan...',
      'Creating recommendations...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
    }

    // Generate AI content based on project data
    const aiGenerated = {
      projectPlan: `# ${data.name || 'New Project'} - AI Generated Project Plan

## Executive Summary
Based on the requirements and resource analysis, this project has a high probability of success with proper risk mitigation.

## Project Phases
1. **Planning & Setup** (Weeks 1-2)
   - Finalize requirements documentation
   - Set up development environment
   - Team onboarding

2. **Development Phase** (Weeks 3-8)
   - Core functionality implementation
   - Regular stakeholder reviews
   - Quality assurance testing

3. **Testing & Deployment** (Weeks 9-10)
   - User acceptance testing
   - Performance optimization
   - Production deployment

## Success Metrics
- On-time delivery: 95% probability
- Budget adherence: Within 5% variance
- Quality standards: All requirements met`,

      riskAssessment: `# Risk Assessment Report

## High Priority Risks
- **Resource Availability**: Team allocation conflicts may arise
- **Timeline Pressure**: Ambitious deadline requires careful monitoring
- **Technical Complexity**: Integration challenges anticipated

## Medium Priority Risks
- **Stakeholder Alignment**: Multiple sign-offs required
- **Budget Constraints**: Additional costs may emerge
- **Scope Creep**: Requirements may expand during development

## Risk Mitigation Strategies
- Weekly resource planning reviews
- Bi-weekly stakeholder check-ins
- 15% budget contingency allocated
- Change control process implementation`,

      recommendations: [
        'Implement daily standups for improved communication',
        'Set up automated testing pipeline early in development',
        'Establish clear change management process',
        'Schedule bi-weekly stakeholder demos',
        'Create detailed technical documentation',
        'Plan for user training and adoption',
        'Set up monitoring and alerting systems',
        'Prepare rollback procedures for deployment'
      ]
    };

    onDataChange({ aiGenerated });
    setIsGenerating(false);
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
            Let AI analyze your project and generate comprehensive planning documents.
          </p>
        </div>
        <Button 
          onClick={generateAIAnalysis} 
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
                <CardDescription>Comprehensive project execution plan</CardDescription>
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
                <CardDescription>Identified risks and mitigation strategies</CardDescription>
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
              <CardDescription>Best practices and suggestions for success</CardDescription>
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
