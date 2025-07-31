import { supabase } from '@/integrations/supabase/client';
import { securityMonitor } from './SecurityMonitoringService';

export interface SQLProcessingResult {
  success: boolean;
  query?: string;
  data?: any;
  response?: string;
  error?: string;
}

// Enhanced input validation and sanitization utilities
class SecurityValidator {
  private static readonly MAX_QUERY_LENGTH = 500;
  private static readonly DANGEROUS_PATTERNS = [
    /\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|EXECUTE|UNION|SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR)\b/i,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /;\s*DROP/gi,
    /\/\*.*?\*\//gi,
    /--.*$/gm,
    /\bEXEC\b/gi,
    /\bSP_/gi
  ];

  static validateInput(input: string): { isValid: boolean; sanitized: string; error?: string } {
    if (!input || typeof input !== 'string') {
      return { isValid: false, sanitized: '', error: 'Input must be a non-empty string' };
    }

    // Sanitize input more aggressively
    let sanitized = input.trim().substring(0, this.MAX_QUERY_LENGTH);
    
    // Remove potentially dangerous content
    sanitized = sanitized
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/\/\*.*?\*\//gi, '')
      .replace(/--.*$/gm, '');
    
    // Check for dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(sanitized)) {
        // Log the security incident
        securityMonitor.logSecurityEvent({
          event_type: 'sql_injection_attempt',
          severity: 'critical',
          description: 'Dangerous SQL pattern detected in user input',
          metadata: {
            input_preview: input.substring(0, 100),
            detected_pattern: pattern.toString()
          }
        });
        
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

  // Enhanced rate limiting with security logging
  private async checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 60000): Promise<boolean> {
    return securityMonitor.checkRateLimit(identifier, maxRequests, windowMs, 'sql_generation');
  }

  // Enhanced database schema with security notes
  getDatabaseSchema(): string {
    return `
Database Schema for Tink Project Management Platform:

SECURITY NOTICE: This system uses parameterized queries and strict validation.

ALLOWED TABLES ONLY:
1. projects (id UUID, name TEXT, description TEXT, status TEXT, priority TEXT, 
   workspace_id UUID, start_date DATE, end_date DATE, progress INTEGER, 
   created_at TIMESTAMP, updated_at TIMESTAMP)

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

6. phases (id UUID, name TEXT, project_id UUID, start_date DATE, end_date DATE,
   status TEXT, progress INTEGER, created_at TIMESTAMP, updated_at TIMESTAMP)

7. client_satisfaction (id UUID, project_id UUID, client_name TEXT, 
   satisfaction_score INTEGER, survey_date DATE, feedback_text TEXT,
   workspace_id UUID, created_at TIMESTAMP, updated_at TIMESTAMP)

8. monthly_performance_reports (id UUID, resource_id UUID, workspace_id UUID,
   year INTEGER, month TEXT, overall_score NUMERIC, productivity_score NUMERIC,
   quality_score NUMERIC, created_at TIMESTAMP)

SECURITY CONSTRAINTS:
- ONLY SELECT and COUNT queries allowed via execute_secure_query()
- Automatic workspace_id filtering enforced
- Query length limited to 500 characters
- Results limited to 50-100 records maximum
- All inputs are sanitized and validated
- Execution timeout: 5 seconds
- Comprehensive logging of all queries

Key Relationships:
- All tables filtered by workspace_id for security
- projects.workspace_id → workspaces.id
- project_tasks.project_id → projects.id
- resources.workspace_id → workspaces.id
- performance_profiles.workspace_id → workspaces.id
`;
  }

  async convertTextToSQL(userQuestion: string, conversationHistory: any[] = []): Promise<string> {
    // Enhanced input validation
    const validation = SecurityValidator.validateInput(userQuestion);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid input');
    }

    const sanitizedQuestion = validation.sanitized;
    
    // Rate limiting with security context
    if (!await this.checkRateLimit('sql_generation', 3, 60000)) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }

    const conversationContext = conversationHistory.length > 0 
      ? `\n\nRecent conversation context:\n${conversationHistory.slice(-2).map(msg => `${msg.message_role}: ${msg.message_content}`).join('\n')}`
      : '';

    const prompt = `You are a secure SQL assistant for a project management platform. 
Convert the user's natural language question into safe database function calls.

${this.getDatabaseSchema()}

User Question: "${sanitizedQuestion}"${conversationContext}

CRITICAL SECURITY REQUIREMENTS:
- You MUST use the execute_secure_query() function instead of raw SQL
- Format: SELECT execute_secure_query('select', 'table_name', workspace_id::uuid, additional_filters::jsonb, limit_count::int)
- Only 'select' and 'count' query_types are allowed
- All queries are automatically workspace-filtered for security
- Use specific table names from the allowed list only
- Include proper LIMIT clauses (max 100)

FUNCTION EXAMPLES:
For "show me projects": 
SELECT execute_secure_query('select', 'projects', $1, '{}'::jsonb, 50);

For "count active tasks":
SELECT execute_secure_query('count', 'project_tasks', $1, '{"status": "In Progress"}'::jsonb, 1);

For "team performance data":
SELECT execute_secure_query('select', 'performance_profiles', $1, '{}'::jsonb, 25);

Return ONLY the secure function call, nothing else:`;

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'X-Request-Source': 'TinkSQL-Service'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 400,
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
      
      // Validate the generated query uses secure function
      if (!this.validateSecureQuery(sqlQuery)) {
        throw new Error('Generated query failed security validation');
      }
      
      return sqlQuery;
    } catch (error) {
      console.error('Error generating SQL:', error);
      
      // Log security event with valid event type
      await securityMonitor.logSecurityEvent({
        event_type: 'suspicious_activity',
        severity: 'medium',
        description: 'SQL generation failed',
        metadata: {
          error: error.message,
          question_preview: sanitizedQuestion.substring(0, 50),
          reason: 'sql_generation_failed'
        }
      });
      
      throw new Error('Failed to generate secure SQL query');
    }
  }

  private validateSecureQuery(sql: string): boolean {
    if (!sql || typeof sql !== 'string') return false;
    
    // Must use execute_secure_query function
    if (!sql.includes('execute_secure_query')) return false;
    
    // Must contain workspace filtering parameter
    if (!sql.includes('$1')) return false;
    
    // Check for forbidden raw SQL operations
    const forbidden = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'CREATE', 'ALTER', 'TRUNCATE', 'EXECUTE'];
    const upperSQL = sql.toUpperCase();
    for (const word of forbidden) {
      if (upperSQL.includes(word) && !upperSQL.includes('execute_secure_query')) {
        return false;
      }
    }
    
    return true;
  }

  async executeSQL(sqlQuery: string, workspaceId: string): Promise<any> {
    try {
      // Validate workspace ID
      if (!SecurityValidator.validateWorkspaceId(workspaceId)) {
        throw new Error('Invalid workspace ID format');
      }

      // Validate SQL query uses secure function
      if (!this.validateSecureQuery(sqlQuery)) {
        throw new Error('SQL query failed security validation');
      }

      // Rate limiting for execution
      if (!await this.checkRateLimit(`execution_${workspaceId}`, 10, 60000)) {
        throw new Error('Execution rate limit exceeded');
      }

      console.log('[TinkSQL] Executing secure query via database function');
      
      // Replace $1 parameter with actual workspace ID for the secure function
      const parameterizedQuery = sqlQuery.replace(/\$1/g, `'${workspaceId}'::uuid`);
      
      const { data, error } = await supabase.rpc('execute_sql', { 
        query: parameterizedQuery
      });

      if (error) {
        console.error('Secure SQL execution error:', error);
        
        // Log the security event with valid event type
        await securityMonitor.logSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'medium',
          description: 'Secure database query execution failed',
          metadata: {
            error_message: error.message,
            workspace_id: workspaceId,
            reason: 'secure_query_failed'
          }
        });
        
        throw new Error('Database query failed due to security constraints');
      }

      // Log successful query execution
      await securityMonitor.logSecurityEvent({
        event_type: 'suspicious_activity',
        severity: 'low',
        description: 'Secure database query executed successfully',
        metadata: {
          workspace_id: workspaceId,
          result_count: Array.isArray(data) ? data.length : 0,
          reason: 'secure_query_executed'
        }
      });

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
- Never include raw SQL or technical database details

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
          'X-Request-Source': 'TinkSQL-Formatting'
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
      // Enhanced input validation
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
      console.log(`[TinkSQL] Generated secure function call: ${sqlQuery}`);
      
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
        await securityMonitor.logSecurityEvent({
          event_type: 'suspicious_activity',
          severity: 'high',
          description: 'Potential security violation in SQL processing',
          metadata: { 
            error_message: error.message,
            reason: 'security_violation'
          }
        });
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
