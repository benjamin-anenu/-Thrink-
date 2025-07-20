import { supabase } from '@/integrations/supabase/client';
import { ProjectCreationData } from './ProjectCreationService';

export interface AIGeneratedContent {
  projectPlan: string;
  riskAssessment: string;
  recommendations: string[];
}

export interface AITaskSuggestion {
  name: string;
  description: string;
  estimatedDuration: string;
  priority: string;
  dependencies: string[];
}

export interface AIInsight {
  type: 'timeline' | 'resource' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class AIProjectService {
  static async generateProjectPlan(projectData: ProjectCreationData): Promise<AIGeneratedContent> {
    // Simulate AI generation with realistic content
    const projectPlan = this.generateRealisticProjectPlan(projectData);
    const riskAssessment = this.generateRiskAssessment(projectData);
    const recommendations = this.generateRecommendations(projectData);

    const aiContent: AIGeneratedContent = {
      projectPlan,
      riskAssessment,
      recommendations
    };

    // Store in database
    try {
      const { error } = await supabase
        .from('project_ai_data')
        .insert({
          project_id: projectData.workspaceId, // Temporary until we have actual project ID
          project_plan: projectPlan,
          risk_assessment: riskAssessment,
          recommendations
        });

      if (error) {
        console.warn('Could not save AI data to database:', error);
      }
    } catch (error) {
      console.warn('Error saving AI data:', error);
    }

    return aiContent;
  }

  static async saveAIDataForProject(projectId: string, aiContent: AIGeneratedContent): Promise<void> {
    try {
      const { error } = await supabase
        .from('project_ai_data')
        .upsert({
          project_id: projectId,
          project_plan: aiContent.projectPlan,
          risk_assessment: aiContent.riskAssessment,
          recommendations: aiContent.recommendations
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving AI data for project:', error);
      throw error;
    }
  }

  static async getAIDataForProject(projectId: string): Promise<AIGeneratedContent | null> {
    try {
      const { data, error } = await supabase
        .from('project_ai_data')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No data found
        throw error;
      }

      return {
        projectPlan: data.project_plan || '',
        riskAssessment: data.risk_assessment || '',
        recommendations: data.recommendations || []
      };
    } catch (error) {
      console.error('Error fetching AI data for project:', error);
      return null;
    }
  }

  static generateTaskSuggestions(projectData: ProjectCreationData): AITaskSuggestion[] {
    const baseTaskSuggestions: AITaskSuggestion[] = [
      {
        name: 'Project Kickoff Meeting',
        description: 'Conduct initial project kickoff meeting with all stakeholders',
        estimatedDuration: '2 hours',
        priority: 'High',
        dependencies: []
      },
      {
        name: 'Requirements Analysis',
        description: 'Analyze and document project requirements',
        estimatedDuration: '1 week',
        priority: 'High',
        dependencies: ['Project Kickoff Meeting']
      },
      {
        name: 'Technical Design',
        description: 'Create technical design documents and architecture',
        estimatedDuration: '1 week',
        priority: 'High',
        dependencies: ['Requirements Analysis']
      },
      {
        name: 'Development Phase 1',
        description: 'Begin initial development work',
        estimatedDuration: '2 weeks',
        priority: 'Medium',
        dependencies: ['Technical Design']
      },
      {
        name: 'Testing & QA',
        description: 'Conduct testing and quality assurance',
        estimatedDuration: '1 week',
        priority: 'High',
        dependencies: ['Development Phase 1']
      }
    ];

    // Customize based on project data
    const customizedTasks = baseTaskSuggestions.map(task => ({
      ...task,
      description: task.description + ` (Tailored for: ${projectData.name})`
    }));

    // Add milestone-specific tasks
    projectData.milestones.forEach(milestone => {
      customizedTasks.push({
        name: `${milestone.name} Review`,
        description: `Review and validate completion of ${milestone.name}`,
        estimatedDuration: '1 day',
        priority: 'High',
        dependencies: []
      });
    });

    return customizedTasks;
  }

  static generateProjectInsights(projectData: ProjectCreationData): AIInsight[] {
    const insights: AIInsight[] = [];

    // Timeline insight
    if (projectData.resources.timeline.start && projectData.resources.timeline.end) {
      const startDate = new Date(projectData.resources.timeline.start);
      const endDate = new Date(projectData.resources.timeline.end);
      const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      if (duration < 30) {
        insights.push({
          type: 'timeline',
          title: 'Tight Timeline Detected',
          description: `The project timeline of ${Math.round(duration)} days is quite aggressive. Consider adding buffer time.`,
          confidence: 85,
          impact: 'medium',
          recommendations: [
            'Add 20% buffer to critical path tasks',
            'Identify tasks that can be parallelized',
            'Consider reducing scope for initial release'
          ]
        });
      }
    }

    // Resource insight
    if (projectData.resources.teamMembers.length < 3) {
      insights.push({
        type: 'resource',
        title: 'Small Team Size',
        description: 'The team size may limit project velocity and create bottlenecks.',
        confidence: 75,
        impact: 'medium',
        recommendations: [
          'Consider adding specialized roles',
          'Cross-train team members',
          'Plan for knowledge sharing sessions'
        ]
      });
    }

    // Risk insight
    if (projectData.stakeholders.length > 5) {
      insights.push({
        type: 'risk',
        title: 'High Stakeholder Count',
        description: 'Multiple stakeholders may lead to conflicting requirements and delays.',
        confidence: 70,
        impact: 'high',
        recommendations: [
          'Establish clear decision-making hierarchy',
          'Schedule regular stakeholder alignment meetings',
          'Document all requirements changes'
        ]
      });
    }

    // Opportunity insight
    if (projectData.requirements.functional.length > 0 && projectData.requirements.nonFunctional.length > 0) {
      insights.push({
        type: 'opportunity',
        title: 'Well-Defined Requirements',
        description: 'Both functional and non-functional requirements are documented, which increases success probability.',
        confidence: 90,
        impact: 'high',
        recommendations: [
          'Leverage clear requirements for accurate estimates',
          'Use requirements as basis for testing criteria',
          'Consider requirements as competitive advantage'
        ]
      });
    }

    return insights;
  }

  private static generateRealisticProjectPlan(projectData: ProjectCreationData): string {
    return `# ${projectData.name} - Project Plan

## Executive Summary
This project aims to ${projectData.description || 'deliver value to stakeholders through systematic execution'}.

## Project Phases

### Phase 1: Planning & Setup (Weeks 1-2)
- Finalize project requirements
- Set up development environment
- Establish team communication protocols
- Complete stakeholder onboarding

### Phase 2: Design & Architecture (Weeks 3-4)
- Create technical specifications
- Design system architecture
- Define data models and APIs
- Review with stakeholders

### Phase 3: Development (Weeks 5-8)
- Implement core functionality
- Conduct iterative testing
- Regular stakeholder demos
- Documentation updates

### Phase 4: Testing & Deployment (Weeks 9-10)
- Comprehensive testing
- Performance optimization
- Deployment preparation
- Go-live planning

## Key Milestones
${projectData.milestones.map(m => `- ${m.name}: ${m.date || 'TBD'}`).join('\n')}

## Success Criteria
- All functional requirements implemented
- Performance targets met
- Stakeholder approval received
- Team knowledge transfer completed`;
  }

  private static generateRiskAssessment(projectData: ProjectCreationData): string {
    return `# Risk Assessment for ${projectData.name}

## High Priority Risks

### Technical Risks
- **Complexity Risk**: Complex requirements may lead to implementation challenges
- **Integration Risk**: Multiple systems integration could cause delays
- **Performance Risk**: System may not meet performance requirements

### Resource Risks
- **Team Availability**: Key team members may become unavailable
- **Skill Gap**: Team may lack specific technical expertise
- **Budget Constraints**: Project may exceed allocated budget

### Schedule Risks
- **Scope Creep**: Requirements may expand beyond original scope
- **Dependency Delays**: External dependencies may cause delays
- **Testing Delays**: Insufficient testing time may impact quality

## Mitigation Strategies
1. **Regular Risk Reviews**: Weekly risk assessment meetings
2. **Contingency Planning**: 20% buffer in timeline and budget
3. **Clear Communication**: Daily standups and weekly stakeholder updates
4. **Quality Gates**: Mandatory reviews at each milestone

## Risk Monitoring
- Weekly risk register updates
- Stakeholder risk communication
- Mitigation action tracking`;
  }

  private static generateRecommendations(projectData: ProjectCreationData): string[] {
    const recommendations = [
      'Establish clear communication protocols from day one',
      'Implement daily standups to track progress and blockers',
      'Set up automated testing to catch issues early',
      'Plan for regular stakeholder demos to maintain alignment'
    ];

    // Add specific recommendations based on project data
    if (projectData.resources.teamMembers.length < 5) {
      recommendations.push('Consider cross-training team members to reduce single points of failure');
    }

    if (projectData.milestones.length > 5) {
      recommendations.push('Break down large milestones into smaller, more manageable checkpoints');
    }

    if (projectData.stakeholders.length > 3) {
      recommendations.push('Establish a stakeholder communication matrix to manage expectations');
    }

    return recommendations;
  }
}