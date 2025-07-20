// import OpenAI from 'openai'; // Disabled until API key is provided
import { supabase } from '@/integrations/supabase/client';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
  useEdgeFunctions: boolean;
}

class AIService {
  private config: AIServiceConfig;
  private openai: any | null = null; // Changed to any to avoid OpenAI type dependency

  constructor() {
    this.config = {
      provider: (import.meta.env.VITE_AI_SERVICE_PROVIDER || 'openai') as 'openai' | 'anthropic',
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
      model: import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini',
      useEdgeFunctions: import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true'
    };

    this.initializeProvider();
  }

  private initializeProvider() {
    // Only initialize if OpenAI package is available and API key is provided
    if (this.config.provider === 'openai' && this.config.apiKey && !this.config.useEdgeFunctions) {
      try {
        // Dynamic import would go here when OpenAI is installed
        console.log('[AI Service] OpenAI package not installed. Install with: npm install openai');
        this.openai = null;
      } catch (error) {
        console.warn('[AI Service] OpenAI not available:', error);
        this.openai = null;
      }
    }
  }

  async generateCompletion(messages: AIMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<AIResponse> {
    if (this.config.useEdgeFunctions) {
      return this.generateViaEdgeFunction(messages, options);
    }

    if (this.config.provider === 'openai' && this.openai) {
      return this.generateOpenAICompletion(messages, options);
    }

    // Fallback to simulated response
    console.warn('[AI Service] No AI provider configured, using fallback simulation');
    return this.generateSimulatedResponse(messages);
  }

  private async generateOpenAICompletion(
    messages: AIMessage[], 
    options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }
  ): Promise<AIResponse> {
    // Fallback since OpenAI is not installed
    console.log('[AI Service] OpenAI not available, using intelligent simulation');
    return this.generateSimulatedResponse(messages);
  }

  private async generateViaEdgeFunction(
    messages: AIMessage[], 
    options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }
  ): Promise<AIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-completion', {
        body: {
          messages,
          options: {
            model: this.config.model,
            temperature: options?.temperature || 0.7,
            maxTokens: options?.maxTokens || 2000,
            systemPrompt: options?.systemPrompt
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('[AI Service] Edge function error:', error);
      throw new Error(`AI generation via edge function failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateSimulatedResponse(messages: AIMessage[]): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    // Generate contextual simulated response
    let simulatedContent = '';
    
    if (lastUserMessage.toLowerCase().includes('project plan')) {
      simulatedContent = `# Project Plan\n\nBased on the requirements provided, here's a comprehensive project plan:\n\n## Phase 1: Planning & Setup\n- Requirements gathering and analysis\n- Team assembly and role assignments\n- Technical architecture design\n\n## Phase 2: Development\n- Core functionality implementation\n- Integration testing\n- Performance optimization\n\n## Phase 3: Deployment\n- Production deployment\n- User training\n- Go-live support\n\nThis plan should be adjusted based on specific project constraints and requirements.`;
    } else if (lastUserMessage.toLowerCase().includes('risk')) {
      simulatedContent = `# Risk Assessment\n\n## High Priority Risks\n\n1. **Technical Complexity**: Implementation may be more complex than anticipated\n2. **Resource Availability**: Key team members may become unavailable\n3. **Timeline Pressure**: Aggressive deadlines may impact quality\n\n## Mitigation Strategies\n\n- Regular risk review meetings\n- Maintain 20% buffer in timelines\n- Cross-train team members\n- Implement quality gates at each phase`;
    } else {
      simulatedContent = `Based on your request, I would recommend:\n\n1. Start with a clear scope definition\n2. Establish regular communication protocols\n3. Set up proper monitoring and tracking\n4. Plan for iterative feedback and improvements\n\nThis is a simulated response. Please configure a real AI service for production use.`;
    }

    return {
      content: simulatedContent,
      usage: {
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300,
      }
    };
  }

  // Specialized methods for different use cases
  async generateProjectPlan(projectData: any): Promise<string> {
    const systemPrompt = `You are an expert project manager. Generate a comprehensive project plan in markdown format based on the provided project data. Include phases, timelines, deliverables, and key milestones.`;

    const userMessage = `Generate a detailed project plan for:
    
Project Name: ${projectData.name}
Description: ${projectData.description}
Timeline: ${projectData.resources?.timeline?.start} to ${projectData.resources?.timeline?.end}
Team Size: ${projectData.resources?.teamMembers?.length || 'Not specified'}
Key Requirements: ${JSON.stringify(projectData.requirements || {})}
Milestones: ${JSON.stringify(projectData.milestones || [])}

Please provide a structured project plan with phases, tasks, and timelines.`;

    const response = await this.generateCompletion([
      { role: 'user', content: userMessage }
    ], {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 2000
    });

    return response.content;
  }

  async generateRiskAssessment(projectData: any): Promise<string> {
    const systemPrompt = `You are a risk management expert. Analyze the project data and generate a comprehensive risk assessment including potential risks, their impact, probability, and mitigation strategies.`;

    const userMessage = `Analyze risks for this project:
    
Project: ${projectData.name}
Description: ${projectData.description}
Timeline: ${projectData.resources?.timeline?.start} to ${projectData.resources?.timeline?.end}
Team: ${JSON.stringify(projectData.resources?.teamMembers || [])}
Stakeholders: ${JSON.stringify(projectData.stakeholders || [])}
Requirements: ${JSON.stringify(projectData.requirements || {})}

Identify potential risks, assess their impact and probability, and suggest mitigation strategies.`;

    const response = await this.generateCompletion([
      { role: 'user', content: userMessage }
    ], {
      systemPrompt,
      temperature: 0.6,
      maxTokens: 1500
    });

    return response.content;
  }

  async generateRecommendations(projectData: any): Promise<string[]> {
    const systemPrompt = `You are a project management consultant. Provide specific, actionable recommendations for project success based on the project data. Return recommendations as a JSON array of strings.`;

    const userMessage = `Provide recommendations for:
    
Project: ${projectData.name}
Description: ${projectData.description}
Team Size: ${projectData.resources?.teamMembers?.length || 'Unknown'}
Duration: ${projectData.resources?.timeline ? 'Defined' : 'Not defined'}
Complexity: ${JSON.stringify(projectData.requirements || {})}

Return 5-8 specific, actionable recommendations as a JSON array.`;

    const response = await this.generateCompletion([
      { role: 'user', content: userMessage }
    ], {
      systemPrompt,
      temperature: 0.5,
      maxTokens: 800
    });

    try {
      const recommendations = JSON.parse(response.content);
      return Array.isArray(recommendations) ? recommendations : [response.content];
    } catch {
      // If JSON parsing fails, split by lines and clean up
      return response.content
        .split('\n')
        .filter(line => line.trim() && !line.trim().startsWith('#'))
        .map(line => line.replace(/^[-*]\s*/, '').trim())
        .filter(rec => rec.length > 10)
        .slice(0, 8);
    }
  }

  async generateInsights(projectMetrics: any): Promise<any[]> {
    const systemPrompt = `You are an AI project analyst. Based on project metrics, generate insights about project performance, risks, and opportunities. Return insights as a JSON array with type, title, description, confidence, and impact fields.`;

    const userMessage = `Analyze these project metrics and generate insights:
    
Project Status: ${projectMetrics.status}
Progress: ${projectMetrics.progress}%
Team Utilization: ${projectMetrics.resourceUtilization}%
Budget Health: ${projectMetrics.budgetHealth}%
Risk Score: ${projectMetrics.riskScore}
Active Projects: ${projectMetrics.projectsInProgress}
Overdue Tasks: ${projectMetrics.overdueTasks || 0}

Generate 3-5 insights as JSON array with fields: type, title, description, confidence, impact.`;

    const response = await this.generateCompletion([
      { role: 'user', content: userMessage }
    ], {
      systemPrompt,
      temperature: 0.6,
      maxTokens: 1200
    });

    try {
      const insights = JSON.parse(response.content);
      return Array.isArray(insights) ? insights : [];
    } catch {
      // Fallback to structured insights if JSON parsing fails
      return [{
        type: 'analysis',
        title: 'AI Analysis Complete',
        description: response.content.substring(0, 200) + '...',
        confidence: 75,
        impact: 'medium'
      }];
    }
  }

  isConfigured(): boolean {
    return !!(this.config.apiKey || this.config.useEdgeFunctions);
  }

  getConfiguration(): { provider: string; model: string; configured: boolean } {
    return {
      provider: this.config.provider,
      model: this.config.model,
      configured: this.isConfigured()
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
export default aiService;