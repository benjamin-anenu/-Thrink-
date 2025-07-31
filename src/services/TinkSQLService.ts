import { supabase } from '@/integrations/supabase/client';

export interface SQLProcessingResult {
  success: boolean;
  query?: string;
  data?: any;
  response?: string;
  error?: string;
}

// Input validation and sanitization utilities
class SecurityValidator {
  private static readonly MAX_QUERY_LENGTH = 1000;
  private static readonly DANGEROUS_PATTERNS = [
    /\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|EXECUTE|UNION|SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR)\b/i,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /;\s*DROP/gi,
    /\/\*.*?\*\//gi,
    /--.*$/gm
  ];

  static validateInput(input: string): { isValid: boolean; sanitized: string; error?: string } {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'Input must be a non-empty string' };
    }

    // Sanitize input
    let sanitized = input.trim().substring(0, this.MAX_QUERY_LENGTH);
    
    // Remove potentially dangerous content
    sanitized = sanitized.replace(/[<>]/g, '');
    
    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        return { 
          isValid: false, 
          sanitized: '', 
          error: 'Input contains potentially dangerous content' 
        };
      }
    }

    return { isValid: true, sanitized };
  }

  static validateWorkspaceId(workspaceId: string): boolean {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return typeof workspaceId === 'string' && uuidPattern.test(workspaceId);
  }
}

export class TinkSQLService {
  private openRouterApiKey: string;
  private baseURL = 'https://openrouter.ai/api/v1/chat/completions';
  private rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(apiKey: string) {
    this.openRouterApiKey = apiKey;
  }

  // Rate limiting
  private checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    const current = this.rateLimitStore.get(identifier);
    
    if (!current || current.resetTime < windowStart) {
      this.rateLimitStore.set(identifier, { count: 1, resetTime: now });
      return true;
    }
    
    if (current.count >= maxRequests) {
      return false;
    }
    
    current.count++;
    return true;
  }

  // Enhanced database schema with actual relationships
  getDatabaseSchema(): string {
    return `
Database Schema for Tink Project Management Platform:

ALLOWED TABLES ONLY:
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

SECURITY CONSTRAINTS:
- ONLY SELECT queries allowed
- Must use $1 for workspace_id filtering
- Query length limited to 500 characters
- No subqueries or complex operations
- Execution timeout: 5 seconds
- Results limited to 50 records

Key Relationships:
- projects.workspace_id → workspaces.id
- project_tasks.project_id → projects.id
- project_tasks.assignee_id → resources.id
- project_tasks.milestone_id → milestones.id
- milestones.project_id → projects.id
- performance_profiles.resource_id → resources.id
`;
  }

  async convertTextToSQL(userQuestion: string, conversationHistory: any[] = []): Promise<string> {
    // Input validation
    const validation = SecurityValidator.validateInput(userQuestion);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid input');
    }

    const sanitizedQuestion = validation.sanitized;
    
    // Rate limiting
    if (!this.checkRateLimit('sql_generation', 5, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    const conversationContext = conversationHistory.length > 0 
      ? `\n\nRecent conversation context:\n${conversationHistory.slice(-2).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const prompt = `You are an expert SQL assistant for a project management platform. 
Convert the user's natural language question into a safe, optimized PostgreSQL query.

${this.getDatabaseSchema()}

User Question: "${sanitizedQuestion}"${conversationContext}

CRITICAL SECURITY REQUIREMENTS:
- Generate ONLY SELECT queries (no INSERT, UPDATE, DELETE, DROP)
- Use parameterized query with $1 for workspace_id filtering
- Include proper JOINs and table aliases for readability
- Use appropriate aggregate functions (COUNT, SUM, AVG, MAX, MIN)
- Add ORDER BY for consistent results
- Limit results to 50 unless specifically requested otherwise
- Handle NULL values appropriately with COALESCE or IS NULL checks
- Use date functions like CURRENT_DATE, CURRENT_TIMESTAMP when needed
- ONLY access allowed tables: projects, project_tasks, resources, performance_profiles, milestones

QUERY EXAMPLES:
For "team utilization": 
SELECT r.name, r.role, pp.current_score, COUNT(pt.id) as task_count 
FROM resources r 
LEFT JOIN performance_profiles pp ON r.id = pp.resource_id 
LEFT JOIN project_tasks pt ON r.id = pt.assignee_id 
WHERE r.workspace_id = $1 
GROUP BY r.id, r.name, r.role, pp.current_score 
ORDER BY pp.current_score DESC LIMIT 50;

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
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      let sqlQuery = data.choices[0]?.message?.content?.trim() || '';
      
      // Clean up the response
      sqlQuery = sqlQuery.replace(/```sql\n?/g, '').replace(/```/g, '').trim();
      
      // Additional validation of generated SQL
      if (!this.validateGeneratedSQL(sqlQuery)) {
        throw new Error('Generated SQL failed security validation');
      }
      
      return sqlQuery;
    } catch (error) {
      console.error('Error generating SQL:', error);
      throw new Error('Failed to generate secure SQL query');
    }
  }

  private validateGeneratedSQL(sql: string): boolean {
    if (!sql || typeof sql !== 'string') return false;
    
    // Must start with SELECT
    if (!sql.trim().toUpperCase().startsWith('SELECT')) return false;
    
    // Must contain workspace filtering
    if (!sql.includes('$1')) return false;
    
    // Check for forbidden operations
    const forbidden = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE', 'EXECUTE'];
    const upperSQL = sql.toUpperCase();
    for (const word of forbidden) {
      if (upperSQL.includes(word)) return false;
    }
    
    return true;
  }

  async executeSQL(sqlQuery: string, workspaceId: string): Promise<any> {
    try {
      // Validate workspace ID
      if (!SecurityValidator.validateWorkspaceId(workspaceId)) {
        throw new Error('Invalid workspace ID format');
      }

      // Validate SQL query
      if (!this.validateGeneratedSQL(sqlQuery)) {
        throw new Error('SQL query failed security validation');
      }

      // Rate limiting for execution
      if (!this.checkRateLimit(`execution_${workspaceId}`, 8, 60000)) {
        throw new Error('Execution rate limit exceeded');
      }

      console.log('[TinkSQL] Executing secure SQL query');
      
      const { data, error } = await supabase.rpc('execute_sql', { 
        query: sqlQuery.replace(/\$1/g, `'${workspaceId}'`)
      });

      if (error) {
        console.error('SQL execution error:', error);
        throw new Error('Database query failed due to security constraints');
      }

      return data || [];
    } catch (error) {
      console.error('SQL execution error:', error);
      throw error;
    }
  }

  async formatResultsNaturally(userQuestion: string, sqlResults: any, conversationHistory: any[] = []): Promise<string> {
    const validation = SecurityValidator.validateInput(userQuestion);
    if (!validation.isValid) {
      return "I'm having trouble processing your question. Please rephrase it and try again.";
    }

    const conversationContext = conversationHistory.length > 0 
      ? `\n\nConversation context:\n${conversationHistory.slice(-2).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const resultsContext = sqlResults && sqlResults.length > 0 
      ? `\n\nQuery Results:\n${JSON.stringify(sqlResults, null, 2)}`
      : '\n\nNo data was found matching your query.';

    const prompt = `You are Tink, a friendly AI assistant specializing in project management analytics.
The user asked: "${validation.sanitized}"

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
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I had trouble formatting that response, but I'm here to help with your project management needs!";
    } catch (error) {
      console.error('Error formatting results:', error);
      return this.generateFallbackResponse(sqlResults);
    }
  }

  private generateFallbackResponse(sqlResults: any): string {
    if (sqlResults && sqlResults.length > 0) {
      return `I found ${sqlResults.length} results for your query. Here's a summary of the data I retrieved, though I'm having trouble formatting it in a more natural way right now.`;
    } else {
      return "I couldn't find any data matching your query. Try asking about your projects, tasks, team performance, or upcoming deadlines.";
    }
  }

  async processNaturalLanguageQuery(userQuestion: string, workspaceId: string, conversationHistory: any[] = []): Promise<SQLProcessingResult> {
    const startTime = Date.now();
    
    try {
      // Input validation
      const validation = SecurityValidator.validateInput(userQuestion);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          response: "Please check your input and try again."
        };
      }

      if (!SecurityValidator.validateWorkspaceId(workspaceId)) {
        return {
          success: false,
          error: 'Invalid workspace ID',
          response: "There seems to be an issue with your workspace. Please try refreshing the page."
        };
      }

      console.log(`[TinkSQL] Processing: "${validation.sanitized.substring(0, 50)}..." for workspace: ${workspaceId}`);
      
      // Step 1: Convert text to SQL with enhanced security
      const sqlQuery = await this.convertTextToSQL(validation.sanitized, conversationHistory);
      console.log(`[TinkSQL] Generated secure SQL: ${sqlQuery}`);
      
      // Step 2: Execute SQL query with security checks
      const sqlResults = await this.executeSQL(sqlQuery, workspaceId);
      console.log(`[TinkSQL] Query returned ${sqlResults?.length || 0} rows`);
      
      // Step 3: Format results naturally
      const naturalResponse = await this.formatResultsNaturally(validation.sanitized, sqlResults, conversationHistory);
      
      return {
        success: true,
        query: sqlQuery,
        data: sqlResults,
        response: naturalResponse
      };
    } catch (error) {
      console.error('[TinkSQL] Error processing query:', error);
      
      // Log potential security incidents
      if (error.message.includes('dangerous') || error.message.includes('security')) {
        console.warn('[SECURITY] Potential security issue detected:', error.message);
      }
      
      return {
        success: false,
        error: 'Processing failed',
        response: this.generateSecureErrorResponse(userQuestion)
      };
    }
  }

  private generateSecureErrorResponse(userQuestion: string): string {
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
