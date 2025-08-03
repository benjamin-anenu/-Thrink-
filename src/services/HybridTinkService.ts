import { IntentClassifier, type Intent } from './IntentClassifier';
import { EntityExtractor, type Entity } from './EntityExtractor';
import { QuickResponseGenerator, type QuickResponse } from './QuickResponseGenerator';
import { EnhancedTinkService, type TinkProcessingResult } from './EnhancedTinkService';
import { supabase } from '@/integrations/supabase/client';

export interface HybridProcessingResult extends TinkProcessingResult {
  processingMethod: 'quick' | 'enhanced';
  intent?: string;
  entities?: Entity[];
}

export class HybridTinkService {
  private intentClassifier: IntentClassifier;
  private entityExtractor: EntityExtractor;
  private quickResponseGenerator: QuickResponseGenerator;
  private enhancedTinkService: EnhancedTinkService | null;

  constructor(openRouterApiKey?: string, selectedModel?: string) {
    this.intentClassifier = new IntentClassifier();
    this.entityExtractor = new EntityExtractor();
    this.quickResponseGenerator = new QuickResponseGenerator();
    
    // Only initialize enhanced service if API key is available
    this.enhancedTinkService = openRouterApiKey 
      ? new EnhancedTinkService(openRouterApiKey, selectedModel)
      : null;
  }

  async processQuery(
    userInput: string,
    workspaceId: string,
    conversationHistory: any[] = [],
    mode: 'chat' | 'agent' = 'agent'
  ): Promise<HybridProcessingResult> {
    const startTime = Date.now();

    try {
      // Step 1: Classify intent and extract entities
      const intent = await this.intentClassifier.classify(userInput);
      const entities = await this.entityExtractor.extract(userInput);

      console.log('Intent classification:', intent);
      console.log('Extracted entities:', entities);

      // Step 2: Decide on processing method
      const shouldUseQuickResponse = this.shouldUseQuickResponse(intent, userInput, conversationHistory);

      if (shouldUseQuickResponse) {
        // Use quick template-based response
        try {
          const quickResult = await this.quickResponseGenerator.generateQuickResponse(
            intent.intent,
            entities,
            workspaceId
          );

          return {
            success: true,
            response: quickResult.content,
            processingTime: Date.now() - startTime,
            processingMethod: 'quick',
            intent: intent.intent,
            entities,
            model: 'template-based',
            insights: this.generateQuickInsights(intent.intent, entities)
          };
        } catch (error) {
          // Fallback to enhanced service if quick response fails
          console.log('Quick response failed, falling back to enhanced service');
          return this.fallbackToEnhanced(userInput, workspaceId, conversationHistory, mode, startTime, intent, entities);
        }
      } else {
        // Use enhanced Claude-based service for complex queries
        return this.fallbackToEnhanced(userInput, workspaceId, conversationHistory, mode, startTime, intent, entities);
      }

    } catch (error) {
      console.error('Hybrid processing error:', error);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        processingMethod: 'enhanced',
        intent: 'unknown',
        entities: []
      };
    }
  }

  private shouldUseQuickResponse(intent: Intent, userInput: string, conversationHistory: any[]): boolean {
    // Use quick response if:
    // 1. Intent is simple and confidence is high
    // 2. Query is short and direct
    // 3. No complex conversation context
    
    if (intent.complexity !== 'simple') return false;
    if (intent.confidence < 0.8) return false;
    if (userInput.length > 100) return false; // Long queries likely need Claude
    if (conversationHistory.length > 3) return false; // Complex conversation context
    
    // Check for complexity indicators
    const complexityKeywords = [
      'analyze', 'compare', 'why', 'how', 'explain', 'recommend', 
      'suggest', 'optimize', 'forecast', 'predict', 'correlation'
    ];
    
    const hasComplexityKeywords = complexityKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword)
    );
    
    return !hasComplexityKeywords;
  }

  private async fallbackToEnhanced(
    userInput: string,
    workspaceId: string,
    conversationHistory: any[],
    mode: 'chat' | 'agent',
    startTime: number,
    intent: Intent,
    entities: Entity[]
  ): Promise<HybridProcessingResult> {
    if (!this.enhancedTinkService) {
      // For search mode, try a simple database search instead
      if (mode === 'chat') {
        try {
          const searchResult = await this.performSimpleSearch(userInput, workspaceId);
          return {
            success: true,
            response: searchResult,
            processingTime: Date.now() - startTime,
            processingMethod: 'quick',
            intent: intent.intent,
            entities,
            model: 'simple-search'
          };
        } catch (error) {
          return {
            success: false,
            error: 'No results found. Try keywords like "my tasks", "overdue projects", or "team performance".',
            processingTime: Date.now() - startTime,
            processingMethod: 'enhanced',
            intent: intent.intent,
            entities
          };
        }
      }
      
      return {
        success: false,
        error: 'I\'m having trouble accessing your data right now, but I don\'t want to leave you hanging. While I work on resolving this technical issue, could you tell me more about what specific insights you\'re looking for? I might be able to suggest some manual approaches or alternative ways to get the information you need.',
        processingTime: Date.now() - startTime,
        processingMethod: 'enhanced',
        intent: intent.intent,
        entities
      };
    }

    try {
      const result = await this.enhancedTinkService.processIntelligentQuery(
        userInput,
        workspaceId,
        conversationHistory,
        mode
      );

      return {
        ...result,
        processingMethod: 'enhanced',
        intent: intent.intent,
        entities
      };
    } catch (error) {
      console.error('Enhanced service error:', error);
      return {
        success: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        processingMethod: 'enhanced',
        intent: intent.intent,
        entities
      };
    }
  }

  private async performSimpleSearch(userInput: string, workspaceId: string): Promise<string> {
    // Basic search across project and task data
    const searchTerm = userInput.toLowerCase();
    
    // Search for projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status, progress')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null)
      .ilike('name', `%${searchTerm}%`)
      .limit(3);

    // Search for tasks
    const { data: tasks } = await supabase
      .from('project_tasks')
      .select('id, name, status, project_id, projects(name)')
      .ilike('name', `%${searchTerm}%`)
      .limit(5);

    let results = '';
    
    if (projects && projects.length > 0) {
      results += '**Projects Found:**\n';
      projects.forEach(project => {
        results += `• ${project.name} (${project.status})\n`;
      });
      results += '\n';
    }
    
    if (tasks && tasks.length > 0) {
      results += '**Tasks Found:**\n';
      tasks.forEach(task => {
        results += `• ${task.name} (${task.status})\n`;
      });
    }
    
    if (!results) {
      return 'No results found. Try keywords like "my tasks", "overdue projects", or "team performance".';
    }
    
    return results;
  }

  private generateQuickInsights(intent: string, entities: Entity[]): string[] {
    const insights = [];

    switch (intent) {
      case 'project_status':
        insights.push('💡 Track progress regularly to identify bottlenecks early');
        break;
      case 'deadlines':
        insights.push('⚠️ Consider prioritizing overdue tasks');
        insights.push('📅 Plan buffer time for critical deadlines');
        break;
      case 'team_performance':
        insights.push('👥 Balance workload across team members');
        break;
      case 'task_status':
        insights.push('✅ Focus on completing in-progress tasks before starting new ones');
        break;
    }

    return insights;
  }

  setApiKey(apiKey: string, selectedModel: string = 'anthropic/claude-3.5-sonnet') {
    this.enhancedTinkService = new EnhancedTinkService(apiKey, selectedModel);
  }

  updateModel(selectedModel: string) {
    if (this.enhancedTinkService) {
      this.enhancedTinkService.setModel(selectedModel);
    }
  }
}