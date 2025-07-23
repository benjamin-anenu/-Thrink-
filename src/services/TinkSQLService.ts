
import { supabase } from '@/integrations/supabase/client';

export interface SQLProcessingResult {
  success: boolean;
  query?: string;
  data?: any;
  response?: string;
  error?: string;
}

export class TinkSQLService {
  private openRouterApiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.openRouterApiKey = apiKey;
  }

  // Enhanced database schema with actual relationships
  getDatabaseSchema(): string {
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

Common Query Patterns:
- Team utilization: JOIN resources with project_tasks and performance_profiles
- Project progress: Aggregate task completion rates within projects
- Performance metrics: Analyze performance_profiles with trend analysis
- Resource allocation: Cross-reference resources with project assignments
- Deadline analysis: Compare task end_dates with current date
- Risk assessment: Analyze overdue tasks and performance trends
`;
  }

  async convertTextToSQL(userQuestion: string, conversationHistory: any[] = []): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nRecent conversation context:\n${conversationHistory.slice(-2).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const prompt = `You are an expert SQL assistant for a project management platform. 
Convert the user's natural language question into a safe, optimized PostgreSQL query.

${this.getDatabaseSchema()}

User Question: "${userQuestion}"${conversationContext}

CRITICAL REQUIREMENTS:
- Generate ONLY SELECT queries (no INSERT, UPDATE, DELETE, DROP)
- Use parameterized query with $1 for workspace_id filtering
- Include proper JOINs and table aliases for readability
- Use appropriate aggregate functions (COUNT, SUM, AVG, MAX, MIN)
- Add ORDER BY for consistent results
- Limit results to 50 unless specifically requested otherwise
- Handle NULL values appropriately with COALESCE or IS NULL checks
- Use date functions like CURRENT_DATE, CURRENT_TIMESTAMP when needed

QUERY EXAMPLES:
For "team utilization": 
SELECT r.name, r.role, pp.current_score, COUNT(pt.id) as task_count 
FROM resources r 
LEFT JOIN performance_profiles pp ON r.id = pp.resource_id 
LEFT JOIN project_tasks pt ON r.id = pt.assignee_id 
WHERE r.workspace_id = $1 
GROUP BY r.id, r.name, r.role, pp.current_score 
ORDER BY pp.current_score DESC LIMIT 50;

For "overdue tasks":
SELECT pt.name, pt.end_date, r.name as assignee, p.name as project 
FROM project_tasks pt 
JOIN projects p ON pt.project_id = p.id 
LEFT JOIN resources r ON pt.assignee_id = r.id 
WHERE p.workspace_id = $1 AND pt.end_date < CURRENT_DATE AND pt.status != 'Completed' 
ORDER BY pt.end_date ASC LIMIT 50;

Return ONLY the SQL query, nothing else:`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 600,
          temperature: 0.1 // Low temperature for consistent SQL
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      let sqlQuery = data.choices[0]?.message?.content?.trim() || '';
      
      // Clean up the response
      sqlQuery = sqlQuery.replace(/```sql\n?/g, '').replace(/```/g, '').trim();
      
      return sqlQuery;
    } catch (error) {
      console.error('Error generating SQL:', error);
      throw new Error('Failed to generate SQL query');
    }
  }

  async executeSQL(sqlQuery: string, workspaceId: string): Promise<any> {
    try {
      // Replace $1 placeholder with actual workspace_id
      const processedSQL = sqlQuery.replace(/\$1/g, `'${workspaceId}'`);
      
      const { data, error } = await supabase.rpc('execute_sql', { 
        sql_query: processedSQL 
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

  async formatResultsNaturally(userQuestion: string, sqlResults: any, conversationHistory: any[] = []): Promise<string> {
    const conversationContext = conversationHistory.length > 0 
      ? `\n\nConversation context:\n${conversationHistory.slice(-2).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const resultsContext = sqlResults && sqlResults.length > 0 
      ? `\n\nQuery Results:\n${JSON.stringify(sqlResults, null, 2)}`
      : '\n\nNo data was found matching your query.';

    const prompt = `You are Tink, a friendly AI assistant specializing in project management analytics.
The user asked: "${userQuestion}"

${resultsContext}${conversationContext}

INSTRUCTIONS:
- Respond conversationally and helpfully as Tink
- Use the actual data to provide specific insights and numbers
- Highlight key trends, patterns, and actionable recommendations
- If no data found, explain why and suggest alternatives
- Use bullet points or formatting for clarity when appropriate
- Include relevant metrics and percentages from the data
- End with a helpful follow-up question or suggestion
- Keep responses informative but not overly technical
- Show genuine interest in helping with project management

Examples of good responses:
- "I found 12 tasks that are overdue! Here's the breakdown..."
- "Your team's performance looks strong overall, with an average score of 84..."
- "Based on the data, I notice your development team is at 95% capacity..."

Respond as Tink:`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 800,
          temperature: 0.7 // Higher temperature for natural conversation
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I had trouble formatting that response, but I'm here to help with your project management needs!";
    } catch (error) {
      console.error('Error formatting results:', error);
      // Fallback to basic formatting
      if (sqlResults && sqlResults.length > 0) {
        return `I found ${sqlResults.length} results for your query. Here's a summary of the data I retrieved, though I'm having trouble formatting it in a more natural way right now.`;
      } else {
        return "I couldn't find any data matching your query. Try asking about your projects, tasks, team performance, or upcoming deadlines.";
      }
    }
  }

  async processNaturalLanguageQuery(userQuestion: string, workspaceId: string, conversationHistory: any[] = []): Promise<SQLProcessingResult> {
    try {
      console.log(`[TinkSQL] Processing: "${userQuestion}" for workspace: ${workspaceId}`);
      
      // Step 1: Convert text to SQL
      const sqlQuery = await this.convertTextToSQL(userQuestion, conversationHistory);
      console.log(`[TinkSQL] Generated SQL: ${sqlQuery}`);
      
      // Step 2: Execute SQL query
      const sqlResults = await this.executeSQL(sqlQuery, workspaceId);
      console.log(`[TinkSQL] Query returned ${sqlResults?.length || 0} rows`);
      
      // Step 3: Format results naturally
      const naturalResponse = await this.formatResultsNaturally(userQuestion, sqlResults, conversationHistory);
      
      return {
        success: true,
        query: sqlQuery,
        data: sqlResults,
        response: naturalResponse
      };
    } catch (error) {
      console.error('[TinkSQL] Error processing query:', error);
      return {
        success: false,
        error: error.message,
        response: this.generateErrorResponse(userQuestion, error.message)
      };
    }
  }

  private generateErrorResponse(userQuestion: string, errorMessage: string): string {
    const suggestions = [
      "Try asking about your current projects or tasks",
      "Ask about team performance or utilization",
      "Check on upcoming deadlines or milestones",
      "Inquire about resource allocation across projects"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    return `I'm having trouble finding that information right now. ${randomSuggestion}. 

If you're looking for specific data, try being more specific about what you'd like to know about your projects or team.`;
  }
}
