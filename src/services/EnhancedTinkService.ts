
import { supabase } from '@/integrations/supabase/client';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow: number;
  costTier: 'free' | 'low' | 'medium' | 'high';
}

export interface TinkProcessingResult {
  success: boolean;
  query?: string;
  data?: any;
  response?: string;
  error?: string;
  model?: string;
  processingTime?: number;
  insights?: string[];
}

export class EnhancedTinkService {
  private openRouterApiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions';
  private selectedModel: string;

  constructor(apiKey: string, selectedModel: string = 'deepseek/deepseek-chat') {
    this.openRouterApiKey = apiKey;
    this.selectedModel = selectedModel;
  }

  static getAvailableModels(): ModelOption[] {
    return [
      // Cost-effective options first
      {
        id: 'deepseek/deepseek-chat',
        name: 'DeepSeek Chat',
        provider: 'DeepSeek',
        description: 'Very cost-effective general purpose model',
        contextWindow: 32000,
        costTier: 'free'
      },
      {
        id: 'deepseek/deepseek-coder',
        name: 'DeepSeek Coder',
        provider: 'DeepSeek',
        description: 'Cost-effective coding and analysis model',
        contextWindow: 32000,
        costTier: 'free'
      },
      {
        id: 'google/gemini-pro',
        name: 'Gemini Pro',
        provider: 'Google',
        description: 'Balanced performance and cost',
        contextWindow: 32000,
        costTier: 'low'
      },
      {
        id: 'meta-llama/llama-3.1-8b-instruct',
        name: 'Llama 3.1 8B',
        provider: 'Meta',
        description: 'Open source, good for general tasks',
        contextWindow: 128000,
        costTier: 'free'
      },
      {
        id: 'anthropic/claude-3.5-haiku',
        name: 'Claude 3.5 Haiku',
        provider: 'Anthropic',
        description: 'Fast and efficient for quick responses',
        contextWindow: 200000,
        costTier: 'low'
      },
      {
        id: 'openai/gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'OpenAI',
        description: 'Cost-effective with good performance',
        contextWindow: 128000,
        costTier: 'low'
      },
      {
        id: 'microsoft/wizardlm-2-8x22b',
        name: 'WizardLM 2 8x22B',
        provider: 'Microsoft',
        description: 'Strong reasoning capabilities',
        contextWindow: 65536,
        costTier: 'medium'
      },
      // Premium options
      {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        description: 'Most capable model for analysis and reasoning',
        contextWindow: 200000,
        costTier: 'high'
      },
      {
        id: 'openai/gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        description: 'Excellent for complex reasoning and analysis',
        contextWindow: 128000,
        costTier: 'high'
      }
    ];
  }

  setModel(modelId: string) {
    this.selectedModel = modelId;
  }

  getClaudeSystemPrompt(mode: 'chat' | 'agent'): string {
    const basePersonality = `You are Tink, an intelligent AI assistant with Claude's thoughtful and analytical personality. You are genuinely helpful, insightful, and conversational. You think step-by-step and provide reasoning for your insights.

Core traits:
- Thoughtful and genuinely helpful
- Natural conversation flow like a knowledgeable colleague
- Contextual awareness and memory
- Ask clarifying questions when needed
- Acknowledge and validate user feedback
- Show your reasoning process
- Admit limitations honestly
- Provide actionable insights and suggestions`;

    if (mode === 'chat') {
      return `${basePersonality}

**Chat Mode Behavior:**
- You're a project management expert consultant
- Provide comprehensive advice on planning, risk management, team dynamics, and best practices
- Ask thoughtful follow-up questions to better understand the situation
- Reference previous conversation context
- Offer multiple perspectives and solutions
- Be conversational and engaging, not robotic

**Response Style:**
- Start naturally, skip robotic phrases like "I can help you with that"
- Show your thought process: "That's an interesting challenge. Let me think through a few approaches..."
- Provide specific, actionable advice
- End with relevant follow-up questions or next steps

Example: Instead of "Here are some project management tips:", say "That timeline crunch sounds familiar - I've seen teams navigate similar challenges successfully. The key is usually..."`;
    } else {
      return `${basePersonality}

**Agent Mode Behavior:**
You are a data analyst AI with access to project management data. When processing queries:

1. **Pre-Query Explanation**: Explain what data you're looking for
   - "To answer that, I need to analyze your team's task completion rates..."

2. **Data Analysis**: Provide insights, not just raw numbers
   - Identify patterns, trends, and anomalies
   - Compare against benchmarks (70-85% utilization is healthy)
   - Spot concerning issues that need attention

3. **Conversational Data Presentation**:
   - Start with key insight: "Looking at your team's workload, I notice..."
   - Provide supporting details with context
   - Explain what the numbers mean practically
   - End with actionable suggestions

4. **Handle Data Issues Gracefully**:
   - No data: "I don't see data for that period. Would you like me to check a different timeframe?"
   - Incomplete data: "I have partial data - let me show what I can see and suggest how to get the complete picture"

**Response Format:**
🔍 **Key Insight**: [Main finding]
📊 **Details**: [Supporting data with context]
💡 **What this means**: [Interpretation]
🎯 **Suggestions**: [Actionable next steps]
❓ **Follow-up**: [Related questions]

Always be genuinely interested in helping users understand and improve their project management.`;
    }
  }

  async convertTextToSQL(userQuestion: string, conversationHistory: any[] = []): Promise<{ sql: string; explanation: string }> {
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nConversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const prompt = `You are an expert SQL analyst. Convert the user's question into a PostgreSQL query with explanation.

${this.getDatabaseSchema()}

User Question: "${userQuestion}"${conversationContext}

CRITICAL REQUIREMENTS:
- Generate ONLY SELECT queries (no INSERT, UPDATE, DELETE, DROP)
- Use parameterized query with $1 for workspace_id filtering
- Include proper JOINs and table aliases
- Add ORDER BY for consistent results
- Limit results to 50 unless requested otherwise
- Handle NULL values appropriately

Before generating SQL, explain what data you're looking for in a conversational way.

Response format:
{
  "explanation": "To answer your question about team performance, I need to look at...",
  "sql": "SELECT ... FROM ... WHERE workspace_id = $1 ORDER BY ... LIMIT 50"
}`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.selectedModel,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content?.trim() || '';
      
      try {
        const parsed = JSON.parse(content);
        return {
          sql: parsed.sql || '',
          explanation: parsed.explanation || 'Let me analyze your data...'
        };
      } catch (parseError) {
        return {
          sql: content.replace(/```sql\n?/g, '').replace(/```/g, '').trim(),
          explanation: 'Let me look at your data to answer that question...'
        };
      }
    } catch (error) {
      console.error('Error generating SQL:', error);
      throw new Error('Failed to generate SQL query');
    }
  }

  async executeSQL(sqlQuery: string, workspaceId: string): Promise<any> {
    try {
      const processedSQL = sqlQuery.replace(/\$1/g, `'${workspaceId}'`);
      
      const { data, error } = await supabase.rpc('execute_sql', { 
        query: processedSQL 
      });

      if (error) {
        console.error('SQL execution error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  async formatResultsWithClaudeStyle(userQuestion: string, sqlResults: any, conversationHistory: any[] = [], preQueryExplanation: string = ''): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nConversation context:\n${conversationHistory.slice(-3).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const resultsContext = sqlResults && sqlResults.length > 0 
      ? `\n\nQuery Results (${sqlResults.length} records):\n${JSON.stringify(sqlResults, null, 2)}`
      : '\n\nNo data found for this query.';

    const prompt = `${this.getClaudeSystemPrompt('agent')}

User asked: "${userQuestion}"
${preQueryExplanation ? `\nPre-query explanation: ${preQueryExplanation}` : ''}

${resultsContext}${conversationContext}

Analyze this data like Claude would - be thoughtful, insightful, and genuinely helpful. Provide specific insights, identify patterns, and offer actionable recommendations.

Use the response format specified in the system prompt with emojis and clear sections.`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.selectedModel,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I'm having trouble analyzing that data right now. Let me try a different approach - what specific aspect of your project data are you most interested in?";
    } catch (error) {
      console.error('Error formatting results:', error);
      return this.generateClaudeStyleFallback(userQuestion, sqlResults);
    }
  }

  async generateChatResponse(userQuestion: string, conversationHistory: any[] = []): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nConversation context:\n${conversationHistory.slice(-4).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const prompt = `${this.getClaudeSystemPrompt('chat')}

User: "${userQuestion}"${conversationContext}

Respond as Claude would - thoughtful, helpful, and genuinely interested in helping with project management challenges. Ask follow-up questions when appropriate.`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.selectedModel,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1000,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "That's an interesting project management question. Let me think through some approaches that might help...";
    } catch (error) {
      console.error('Error generating chat response:', error);
      return "I'm having some technical difficulties, but I'd love to help you with your project management challenge. Could you tell me more about what specific aspect you're dealing with?";
    }
  }

  async processIntelligentQuery(userQuestion: string, workspaceId: string, conversationHistory: any[] = [], mode: 'chat' | 'agent' = 'agent'): Promise<TinkProcessingResult> {
    const startTime = Date.now();
    
    try {
      console.log(`[Enhanced Tink] Processing: "${userQuestion}" (mode: ${mode}, model: ${this.selectedModel})`);
      
      if (mode === 'chat') {
        const response = await this.generateChatResponse(userQuestion, conversationHistory);
        return {
          success: true,
          response,
          model: this.selectedModel,
          processingTime: Date.now() - startTime
        };
      } else {
        // Agent mode: SQL + Analysis
        const { sql, explanation } = await this.convertTextToSQL(userQuestion, conversationHistory);
        console.log(`[Enhanced Tink] Generated SQL: ${sql}`);
        
        const sqlResults = await this.executeSQL(sql, workspaceId);
        console.log(`[Enhanced Tink] Query returned ${sqlResults?.length || 0} rows`);
        
        const response = await this.formatResultsWithClaudeStyle(userQuestion, sqlResults, conversationHistory, explanation);
        
        return {
          success: true,
          query: sql,
          data: sqlResults,
          response,
          model: this.selectedModel,
          processingTime: Date.now() - startTime,
          insights: this.extractInsights(sqlResults)
        };
      }
    } catch (error) {
      console.error('[Enhanced Tink] Error processing query:', error);
      return {
        success: false,
        error: error.message,
        response: this.generateClaudeStyleError(userQuestion, error.message, mode),
        model: this.selectedModel,
        processingTime: Date.now() - startTime
      };
    }
  }

  private generateClaudeStyleFallback(userQuestion: string, sqlResults: any): string {
    if (sqlResults && sqlResults.length > 0) {
      return `I can see you have ${sqlResults.length} records in your data. While I'm having trouble providing a full analysis right now, I notice this data could give us insights into your project performance. Would you like me to focus on a specific aspect of these results?`;
    } else {
      return `I don't see any data matching your query. This could mean either the data doesn't exist for this timeframe, or we might need to adjust our search criteria. Would you like me to try looking at a different date range or aspect of your projects?`;
    }
  }

  private generateClaudeStyleError(userQuestion: string, errorMessage: string, mode: 'chat' | 'agent'): string {
    if (mode === 'chat') {
      return `I'm experiencing some technical difficulties right now. However, I'd still love to help you think through your project management challenge. Based on your question about "${userQuestion}", let me share some general approaches that might be helpful while I work on getting back to full functionality...`;
    } else {
      return `I'm having trouble accessing your data right now, but I don't want to leave you hanging. While I work on resolving this technical issue, could you tell me more about what specific insights you're looking for? I might be able to suggest some manual approaches or alternative ways to get the information you need.`;
    }
  }

  private extractInsights(data: any[]): string[] {
    if (!data || data.length === 0) return [];
    
    const insights = [];
    
    // Basic pattern detection
    if (data.length > 10) {
      insights.push(`Found ${data.length} records - substantial dataset for analysis`);
    }
    
    // Look for common patterns in the data structure
    const firstRecord = data[0];
    if (firstRecord) {
      const keys = Object.keys(firstRecord);
      if (keys.includes('progress')) {
        insights.push('Progress tracking data available');
      }
      if (keys.includes('status')) {
        insights.push('Status information included');
      }
    }
    
    return insights;
  }

  private getDatabaseSchema(): string {
    return `
Database Schema for Tink Project Management Platform:

Core Tables:
1. projects (id UUID, name TEXT, description TEXT, status TEXT, priority TEXT, 
   workspace_id UUID, start_date DATE, end_date DATE, progress INTEGER, 
   created_at TIMESTAMP, updated_at TIMESTAMP, resources UUID[])

2. project_tasks (id UUID, name TEXT, description TEXT, start_date DATE, 
   end_date DATE, status TEXT, priority TEXT, progress INTEGER, 
   project_id UUID, assignee_id UUID, milestone_id UUID, 
   dependencies TEXT[], created_at TIMESTAMP, updated_at TIMESTAMP)

3. resources (id UUID, name TEXT, email TEXT, role TEXT, department TEXT, 
   skills TEXT[], workspace_id UUID, availability_hours INTEGER, 
   created_at TIMESTAMP, updated_at TIMESTAMP)

4. milestones (id UUID, name TEXT, description TEXT, due_date DATE, 
   project_id UUID, status TEXT, progress INTEGER, 
   created_at TIMESTAMP, updated_at TIMESTAMP)

5. performance_profiles (id UUID, resource_id UUID, resource_name TEXT, 
   workspace_id UUID, current_score NUMERIC, monthly_score NUMERIC, 
   trend TEXT, risk_level TEXT, strengths TEXT[], improvement_areas TEXT[], 
   created_at TIMESTAMP, updated_at TIMESTAMP)

Key Relationships:
- projects.workspace_id → workspaces.id
- project_tasks.project_id → projects.id
- project_tasks.assignee_id → resources.id
- project_tasks.milestone_id → milestones.id
- milestones.project_id → projects.id
- performance_profiles.resource_id → resources.id

Query Guidelines:
- Always filter by workspace_id = $1
- Use proper JOINs for related data
- Include ORDER BY for consistent results
- Limit to 50 records unless specified
- Handle NULL values appropriately
`;
  }
}
