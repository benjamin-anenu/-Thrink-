import { supabase } from '@/integrations/supabase/client';

export interface AIServiceResult {
  success: boolean;
  response: string;
  dataCount?: number;
  processingTime: number;
  model?: string;
  insights?: string[];
}

export class AIService {
  private openRouterApiKey: string;
  private selectedModel: string;

  constructor(apiKey: string, model: string = 'anthropic/claude-3.5-sonnet') {
    this.openRouterApiKey = apiKey;
    this.selectedModel = model;
  }

  async processQuery(
    userInput: string, 
    workspaceId: string, 
    conversationHistory: any[] = [],
    mode: 'agent' | 'chat' = 'agent'
  ): Promise<AIServiceResult> {
    const startTime = Date.now();
    
    try {
      console.log('Processing AI query:', userInput, 'Mode:', mode);
      
      if (mode === 'agent') {
        return await this.processAgentQuery(userInput, workspaceId, conversationHistory, startTime);
      } else {
        return await this.processChatQuery(userInput, conversationHistory, startTime);
      }
    } catch (error) {
      console.error('AI Service error:', error);
      return {
        success: false,
        response: "I'm experiencing technical difficulties right now. Please try again in a moment.",
        processingTime: Date.now() - startTime
      };
    }
  }

  private async processAgentQuery(
    userInput: string, 
    workspaceId: string, 
    conversationHistory: any[], 
    startTime: number
  ): Promise<AIServiceResult> {
    try {
      // Use the enhanced AI context edge function
      const { data, error } = await supabase.functions.invoke('enhanced-ai-context', {
        body: {
          userQuestion: userInput,
          workspaceId: workspaceId,
          conversationHistory: conversationHistory,
          model: this.selectedModel
        }
      });

      if (error) {
        console.error('Enhanced AI context error:', error);
        return await this.fallbackToBasicChat(userInput, conversationHistory, startTime);
      }

      return {
        success: true,
        response: data.response || "I couldn't process your request at the moment.",
        dataCount: data.dataCount,
        processingTime: Date.now() - startTime,
        model: this.selectedModel,
        insights: data.insights
      };
    } catch (error) {
      console.error('Agent query error:', error);
      return await this.fallbackToBasicChat(userInput, conversationHistory, startTime);
    }
  }

  private async processChatQuery(
    userInput: string, 
    conversationHistory: any[], 
    startTime: number
  ): Promise<AIServiceResult> {
    try {
      // Use the Tink AI chat edge function
      const { data, error } = await supabase.functions.invoke('tink-ai-chat', {
        body: {
          userQuestion: userInput,
          mode: 'chat',
          conversationHistory: conversationHistory,
          model: this.selectedModel
        }
      });

      if (error) {
        console.error('Chat query error:', error);
        return await this.fallbackToBasicChat(userInput, conversationHistory, startTime);
      }

      return {
        success: true,
        response: data.response || "I couldn't generate a response at the moment.",
        processingTime: Date.now() - startTime,
        model: this.selectedModel
      };
    } catch (error) {
      console.error('Chat processing error:', error);
      return await this.fallbackToBasicChat(userInput, conversationHistory, startTime);
    }
  }

  private async fallbackToBasicChat(
    userInput: string, 
    conversationHistory: any[], 
    startTime: number
  ): Promise<AIServiceResult> {
    // Generate a basic project management response
    const basicResponse = this.generateBasicResponse(userInput);
    
    return {
      success: false,
      response: basicResponse,
      processingTime: Date.now() - startTime,
      model: 'fallback'
    };
  }

  private generateBasicResponse(userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    
    // Basic pattern matching for common project management queries
    if (lowerInput.includes('project') && lowerInput.includes('status')) {
      return "I'd be happy to help you check your project status. To get the most accurate information, I need to connect to the AI service. Please ensure your OpenRouter API key is configured correctly.";
    }
    
    if (lowerInput.includes('task') || lowerInput.includes('todo')) {
      return "Task management is one of my specialties! Once I'm properly connected to the AI service, I can help you analyze your tasks, identify priorities, and suggest optimizations.";
    }
    
    if (lowerInput.includes('team') || lowerInput.includes('resource')) {
      return "Team insights and resource management are crucial for project success. With proper AI connectivity, I can provide detailed analysis of your team's workload and performance.";
    }
    
    if (lowerInput.includes('deadline') || lowerInput.includes('overdue')) {
      return "Deadline tracking is essential for project success. When connected to the AI service, I can analyze your upcoming deadlines and suggest prioritization strategies.";
    }
    
    // Generic project management advice
    return `I understand you're asking about "${userInput}". While I'm having connectivity issues with the AI service right now, here are some general project management best practices that might help:

• Break down complex tasks into smaller, manageable pieces
• Set clear priorities and deadlines
• Communicate regularly with your team
• Monitor progress and adjust plans as needed
• Use data-driven insights to make decisions

For specific analysis of your workspace data, please ensure your OpenRouter API key is properly configured.`;
  }

  updateModel(newModel: string): void {
    this.selectedModel = newModel;
  }

  updateApiKey(newApiKey: string): void {
    this.openRouterApiKey = newApiKey;
  }
}