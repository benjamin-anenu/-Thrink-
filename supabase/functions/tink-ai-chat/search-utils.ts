// Enhanced Search Mode Utilities for Tink AI Chat - Human-like offline assistant
export async function processLocalSearch(userQuestion: string, workspaceId: string, supabase: any, userId: string): Promise<string> {
  
  // NLP Pattern Matching System
  const nlpPatterns = {
    greetings: {
      patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
      response: async (userId: string) => {
        const { data: user } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', userId)
          .single();
        
        const hour = new Date().getHours();
        const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        const name = user?.full_name || user?.email?.split('@')[0] || 'there';
        
        return `${greeting}, ${name}! 👋 I'm your offline workspace assistant. I can help you find information about your projects, tasks, and team.

What would you like to know? Try asking:
• "What are my tasks?" 
• "Show me project status"
• "Who's available on my team?"
• "What's overdue?"

💡 I work offline using smart keyword matching, but for conversations and complex analysis, please use Tink Agent or Chat mode when online.`;
      }
    },

    casual: {
      patterns: ['how are you', 'what can you do', 'help', 'who are you'],
      response: (workspaceName: string) => `I'm your offline workspace assistant for ${workspaceName || 'your workspace'}! 🤖

I work differently from the full AI chat - I use smart pattern matching to help you find data when you're offline or when AI services are unavailable.

**What I can help you with:**
📋 Task Management
• "my tasks" - Your assigned tasks
• "overdue tasks" - Late items
• "tasks today/this week" - Upcoming deadlines

📊 Project Insights  
• "project status" - Active projects
• "projects at risk" - Problem projects
• "project summary" - Overview stats

👥 Team Information
• "team members" - Team overview
• "available resources" - Who's free
• "team performance" - Performance metrics

🔍 **Smart Search Tips:**
• Use simple keywords like "overdue", "my", "team"
• I understand variations: "tasks" = "work" = "assignments" 
• I can search by project names
• Ask follow-up questions for related info

For complex conversations, creative brainstorming, or detailed analysis, please switch to **Tink Agent** or **Chat** mode when online! 🚀`
    },

    taskPatterns: {
      patterns: [
        { regex: /(?:show|get|find|what are|list)(?: me)?(?: my)? (?:tasks?|assignments?|work)/i, type: 'user_tasks' },
        { regex: /tasks? (?:for|due|by) (today|tomorrow|this week|next week)/i, type: 'tasks_by_time' },
        { regex: /(?:overdue|late|delayed) tasks?/i, type: 'overdue_tasks' },
        { regex: /tasks? (?:for|in|on) (?:project )?(.+)/i, type: 'project_tasks' }
      ]
    },

    projectPatterns: {
      patterns: [
        { regex: /(?:show|list|what are)(?: me)?(?: all| my)? projects?/i, type: 'all_projects' },
        { regex: /projects? (?:at risk|risky|delayed|behind)/i, type: 'at_risk_projects' },
        { regex: /(?:status|details?|info) (?:of|for|about) (?:project )?(.+)/i, type: 'project_details' },
        { regex: /(?:completed|finished|done) projects?/i, type: 'completed_projects' }
      ]
    },

    teamPatterns: {
      patterns: [
        { regex: /(?:team|resources?|members?|people)/i, type: 'team_list' },
        { regex: /(?:available|free) (?:team|resources?|people)/i, type: 'available_resources' },
        { regex: /(?:busy|overloaded|overworked) (?:team|resources?|people)/i, type: 'overloaded_resources' },
        { regex: /(?:who is|who's) (?:working on|assigned to) (.+)/i, type: 'resource_by_project' }
      ]
    }
  };

  const keywordMappings: Record<string, { query: string; params: string[] }> = {
    'my projects': { 
      query: 'SELECT * FROM projects WHERE workspace_id = $1 AND status = \'Active\'', 
      params: ['workspace_id'] 
    },
    'overdue projects': { 
      query: 'SELECT * FROM projects WHERE workspace_id = $1 AND end_date < CURRENT_DATE AND status != \'Completed\'', 
      params: ['workspace_id'] 
    },
    'projects at risk': { 
      query: 'SELECT * FROM projects WHERE workspace_id = $1 AND health_status IN (\'yellow\', \'red\')', 
      params: ['workspace_id'] 
    },
    'my tasks': { 
      query: 'SELECT pt.*, p.name as project_name FROM project_tasks pt JOIN projects p ON pt.project_id = p.id WHERE pt.assignee_id = $2 AND pt.status = \'In Progress\'', 
      params: ['workspace_id', 'user_id'] 
    },
    'overdue tasks': { 
      query: 'SELECT pt.*, p.name as project_name FROM project_tasks pt JOIN projects p ON pt.project_id = p.id WHERE pt.assignee_id = $2 AND pt.end_date < CURRENT_DATE AND pt.status != \'Completed\'', 
      params: ['workspace_id', 'user_id'] 
    },
    'tasks today': { 
      query: 'SELECT pt.*, p.name as project_name FROM project_tasks pt JOIN projects p ON pt.project_id = p.id WHERE pt.assignee_id = $2 AND DATE(pt.end_date) = CURRENT_DATE', 
      params: ['workspace_id', 'user_id'] 
    },
    'team members': { 
      query: 'SELECT * FROM resources WHERE workspace_id = $1', 
      params: ['workspace_id'] 
    },
    'available resources': { 
      query: 'SELECT r.*, rum.utilization_percentage FROM resources r LEFT JOIN resource_utilization_metrics rum ON r.id = rum.resource_id WHERE r.workspace_id = $1 AND (rum.utilization_percentage < 80 OR rum.utilization_percentage IS NULL)', 
      params: ['workspace_id'] 
    },
    'my performance': { 
      query: 'SELECT * FROM performance_profiles WHERE resource_id = $2', 
      params: ['workspace_id', 'user_id'] 
    },
    'project summary': { 
      query: 'SELECT COUNT(*) as total, SUM(CASE WHEN status = \'Active\' THEN 1 ELSE 0 END) as active, SUM(CASE WHEN status = \'Completed\' THEN 1 ELSE 0 END) as completed FROM projects WHERE workspace_id = $1', 
      params: ['workspace_id'] 
    }
  };

  // Check for greetings first
  const input = userQuestion.toLowerCase().trim();
  
  for (const pattern of nlpPatterns.greetings.patterns) {
    if (input.includes(pattern)) {
      return await nlpPatterns.greetings.response(userId);
    }
  }

  // Check for casual conversation
  for (const pattern of nlpPatterns.casual.patterns) {
    if (input.includes(pattern)) {
      const { data: workspace } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', workspaceId)
        .single();
      return nlpPatterns.casual.response(workspace?.name);
    }
  }

  // Smart pattern matching with natural language processing
  let queryInfo = await buildSmartQuery(input, userId, workspaceId, supabase);

  if (!queryInfo) {
    return `🤔 I understand you're asking about "${userQuestion}", but I couldn't find a specific match.

**Here's what I can help you with:**

📋 **Tasks & Work**
• "my tasks" or "what's my work?"
• "overdue tasks" or "what's late?"
• "tasks today" or "today's work"

📊 **Projects** 
• "project status" or "how are projects?"
• "projects at risk" or "problem projects"
• "project summary" or "overview"

👥 **Team & Resources**
• "team members" or "who's on the team?"
• "available resources" or "who's free?"
• "my performance" or "how am I doing?"

💡 **Smart Tips:**
• I understand variations and similar words
• Try searching by project names
• Ask follow-up questions for more details

For complex analysis or conversations, please use **Tink Agent** or **Chat** mode when online! 🚀`;
  }

  try {
    // Execute the smart query
    const results = await executeSmartQuery(queryInfo, workspaceId, userId, supabase);
    
    if (!results || results.length === 0) {
      return `📭 No results found for "${userQuestion}".

**Possible reasons:**
• No data matches your criteria yet
• Try broader terms like "projects" instead of specific project names
• Check if you have the right permissions

**Quick alternatives:**
• "project summary" - Get overall stats
• "team members" - See who's available
• "my tasks" - Check your current work

Need help? Switch to **Chat mode** when online for conversational assistance! 💬`;
    }

    // Format results naturally
    const formattedResponse = await formatNaturalResponse(queryInfo.type, results, input, workspaceId, supabase);
    
    // Add related suggestions
    const suggestions = await generateRelatedSuggestions(queryInfo.type, results, workspaceId);
    
    return formattedResponse + (suggestions ? `\n\n${suggestions}` : '');
    
  } catch (error) {
    console.error('Search error:', error);
    return `❌ I encountered an issue while searching your workspace data.

**What happened:** ${error.message}

**Try these instead:**
• Use simpler keywords like "tasks", "projects", "team"
• Check your connection and try again
• Switch to **Tink Agent** or **Chat** mode for complex queries

I work best with direct questions about your workspace data! 🔍`;
  }
}

function formatSearchResults(results: any[], queryType: string): string {
  if (!results || results.length === 0) {
    return `📭 No results found for "${queryType}". Try different keywords or check if you have data in your workspace.`;
  }

  if (queryType.includes('project') && !queryType.includes('summary')) {
    return `📋 Found ${results.length} project(s):

${results.map((project, index) => 
  `${index + 1}. ${project.name}
   Status: ${project.status}
   Progress: ${project.progress || 0}%
   Health: ${project.health_status || 'Unknown'}`
).join('\n\n')}`;
  }

  if (queryType.includes('task')) {
    return `✅ Found ${results.length} task(s):

${results.map((task, index) => 
  `${index + 1}. ${task.name}
   Project: ${task.project_name || 'Unknown'}
   Due: ${task.end_date ? new Date(task.end_date).toLocaleDateString() : 'No date'}
   Priority: ${task.priority || 'Normal'}`
).join('\n\n')}`;
  }

  if (queryType.includes('team') || queryType.includes('resource')) {
    return `👥 Found ${results.length} team member(s):

${results.map((resource, index) => 
  `${index + 1}. ${resource.name}
   Role: ${resource.role || 'Team Member'}
   Utilization: ${resource.utilization_percentage || 0}%
   Hours: ${resource.availability_hours || 'N/A'}`
).join('\n\n')}`;
  }

  if (queryType.includes('performance')) {
    const perf = results[0];
    return `📊 Your Performance Metrics:

Overall Score: ${perf?.current_score || 'N/A'}/100
Efficiency: ${perf?.efficiency_score || 'N/A'}%
Quality: ${perf?.quality_score || 'N/A'}%
Collaboration: ${perf?.collaboration_score || 'N/A'}%

${perf?.strengths ? `Strengths: ${perf.strengths}` : ''}
${perf?.improvement_areas ? `Areas to improve: ${perf.improvement_areas}` : ''}`;
  }

  if (queryType.includes('summary')) {
    const summary = results[0];
    return `📊 Project Summary:

Total Projects: ${summary?.total || 0}
Active Projects: ${summary?.active || 0}
Completed Projects: ${summary?.completed || 0}
Completion Rate: ${summary?.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}%`;
  }

  // Default table format
  return `📋 Found ${results.length} result(s):

${results.slice(0, 5).map((item, index) => 
  `${index + 1}. ${JSON.stringify(item, null, 2)}`
).join('\n\n')}

${results.length > 5 ? `\n... and ${results.length - 5} more` : ''}`;
}

export async function fetchUserContext(userId: string, workspaceId: string, supabase: any) {
  try {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status, progress, priority, health_status')
      .eq('workspace_id', workspaceId)
      .in('status', ['Active', 'In Progress'])
      .limit(5);

    const { data: tasks } = await supabase
      .from('project_tasks')
      .select('id, name, status, priority, end_date, projects(name)')
      .eq('assignee_id', userId)
      .eq('status', 'In Progress')
      .order('end_date', { ascending: true })
      .limit(5);

    const { data: performance } = await supabase
      .from('performance_profiles')
      .select('*')
      .eq('resource_id', userId)
      .single();

    return {
      activeProjects: projects || [],
      myTasks: tasks || [],
      myPerformance: performance,
      summary: {
        totalProjects: projects?.length || 0,
        activeTasks: tasks?.length || 0
      }
    };
  } catch (error) {
    console.error('Error fetching context:', error);
    return null;
  }
}

// Smart query builder with NLP
async function buildSmartQuery(input: string, userId: string, workspaceId: string, supabase: any) {
  // First try direct keyword matching
  for (const [keyword, info] of Object.entries(keywordMappings)) {
    if (input.includes(keyword)) {
      return { ...info, type: keyword.replace(/\s+/g, '_'), confidence: 0.9 };
    }
  }

  // Try pattern matching
  for (const [category, patternGroup] of Object.entries(nlpPatterns)) {
    if (category === 'greetings' || category === 'casual') continue;
    
    for (const pattern of (patternGroup as any).patterns) {
      const match = input.match(pattern.regex);
      if (match) {
        return await buildQueryFromPattern(pattern.type, match, userId, workspaceId);
      }
    }
  }

  // Try fuzzy matching for typos
  const fuzzyMatch = findFuzzyMatch(input, Object.keys(keywordMappings));
  if (fuzzyMatch) {
    return { ...keywordMappings[fuzzyMatch], type: fuzzyMatch.replace(/\s+/g, '_'), confidence: 0.7 };
  }

  return null;
}

// Execute queries based on type
async function executeSmartQuery(queryInfo: any, workspaceId: string, userId: string, supabase: any) {
  const params = [];
  if (queryInfo.params.includes('workspace_id')) params.push(workspaceId);
  if (queryInfo.params.includes('user_id')) params.push(userId);

  // Determine the table and execute appropriate query
  if (queryInfo.type.includes('task')) {
    const { data, error } = await supabase
      .from('project_tasks')
      .select('*, projects(name)')
      .eq('workspace_id', workspaceId)
      .limit(10);
    return data;
  } else if (queryInfo.type.includes('project')) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .limit(10);
    return data;
  } else if (queryInfo.type.includes('team') || queryInfo.type.includes('resource')) {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('workspace_id', workspaceId)
      .limit(10);
    return data;
  }

  return [];
}

// Natural language response formatter
async function formatNaturalResponse(queryType: string, results: any[], userInput: string, workspaceId: string, supabase: any): Promise<string> {
  const responseTemplates = {
    user_tasks: (data: any[]) => {
      if (data.length === 0) return "You don't have any active tasks right now. Great job staying on top of things! 🎉";
      
      const overdue = data.filter(t => t.end_date && new Date(t.end_date) < new Date());
      const today = data.filter(t => t.end_date && new Date(t.end_date).toDateString() === new Date().toDateString());
      
      return `I found **${data.length}** active task${data.length > 1 ? 's' : ''} assigned to you:

${data.slice(0, 5).map((task, i) => `
**${i + 1}. ${task.name}** ${overdue.some(t => t.id === task.id) ? '⚠️ **OVERDUE**' : ''}
   📁 Project: ${task.projects?.name || 'Unknown'}
   📅 Due: ${task.end_date ? new Date(task.end_date).toLocaleDateString() : 'No due date'}
   🎯 Priority: ${task.priority || 'Normal'}
   📊 Status: ${task.status}
`).join('')}${data.length > 5 ? `\n... and ${data.length - 5} more tasks` : ''}

${overdue.length > 0 ? `⚠️ **Attention:** You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}` : ''}
${today.length > 0 ? `📅 **Today:** ${today.length} task${today.length > 1 ? 's' : ''} due today` : ''}`;
    },

    at_risk_projects: (data: any[]) => {
      const atRisk = data.filter(p => p.health_status && p.health_status !== 'green');
      if (atRisk.length === 0) return "Good news! All your projects are on track. No projects are currently at risk. 🚀";
      
      return `⚠️ Found **${atRisk.length}** project${atRisk.length > 1 ? 's' : ''} that need attention:

${atRisk.map((project, i) => `
**${i + 1}. ${project.name}** ${project.health_status === 'red' ? '🔴' : '🟡'}
   Status: ${project.status}
   Progress: ${project.progress || 0}%
   Health: ${project.health_status || 'Unknown'}
   
   ${project.health_status === 'red' ? '**Critical Issues Detected**' : '**Warning Signs Present**'}
`).join('')}

💡 **Recommended Actions:**
• Review project timelines and resource allocation
• Check for blockers and dependencies
• Consider reallocating team members
• Schedule stakeholder check-ins`;
    },

    team_list: (data: any[]) => {
      if (data.length === 0) return "No team members found in your workspace.";
      
      const available = data.filter(r => r.status === 'Available');
      const busy = data.filter(r => r.status === 'Busy');
      const overloaded = data.filter(r => r.status === 'Overallocated');

      return `👥 Your team overview (**${data.length}** total members):

**🟢 Available (${available.length}):**
${available.slice(0, 3).map(r => `• ${r.name} - ${r.role}`).join('\n')}
${available.length > 3 ? `... and ${available.length - 3} more` : ''}

**🟡 Busy (${busy.length}):**
${busy.slice(0, 3).map(r => `• ${r.name} - ${r.role}`).join('\n')}
${busy.length > 3 ? `... and ${busy.length - 3} more` : ''}

${overloaded.length > 0 ? `**🔴 Overloaded (${overloaded.length}):**
${overloaded.map(r => `• ${r.name} - ${r.role} ⚠️`).join('\n')}

⚠️ **Action needed:** Consider redistributing workload for overloaded team members.` : ''}

💡 **Team Insights:**
• ${Math.round((available.length / data.length) * 100)}% of your team is available for new work
• Most common role: ${getMostCommonRole(data)}`;
    }
  };

  const formatFunction = responseTemplates[queryType as keyof typeof responseTemplates];
  if (formatFunction) {
    return formatFunction(results);
  }

  return formatSearchResults(results, queryType);
}

// Generate related suggestions
async function generateRelatedSuggestions(queryType: string, results: any[], workspaceId: string): Promise<string | null> {
  const suggestions = {
    user_tasks: () => {
      const taskCount = results.length;
      const overdue = results.filter(t => t.end_date && new Date(t.end_date) < new Date()).length;
      
      return `**💡 You might also want to check:**
• ${overdue > 0 ? '"overdue tasks" - Focus on late items' : '"tasks this week" - Plan ahead'}
• "team members" - See who can help
• "project status" - Get project updates
• "my performance" - Check your metrics`;
    },

    at_risk_projects: () => {
      return `**💡 Related information:**
• "available resources" - Find help for struggling projects
• "team performance" - Check team metrics
• "project summary" - Get overall project health
• "overdue tasks" - See what's causing delays`;
    },

    team_list: () => {
      return `**💡 Team insights you might need:**
• "available resources" - See detailed availability
• "team performance" - Check productivity metrics
• "resource allocation" - See current assignments
• "skills matrix" - View team capabilities`;
    }
  };

  const suggestionFunction = suggestions[queryType as keyof typeof suggestions];
  return suggestionFunction ? suggestionFunction() : null;
}

// Helper functions
function buildQueryFromPattern(type: string, match: RegExpMatchArray, userId: string, workspaceId: string) {
  // Implementation for building queries from regex patterns
  const baseQueries = {
    user_tasks: { query: 'SELECT * FROM project_tasks WHERE assignee_id = $1', params: ['user_id'] },
    all_projects: { query: 'SELECT * FROM projects WHERE workspace_id = $1', params: ['workspace_id'] },
    team_list: { query: 'SELECT * FROM resources WHERE workspace_id = $1', params: ['workspace_id'] }
  };
  
  return baseQueries[type as keyof typeof baseQueries] || null;
}

function findFuzzyMatch(input: string, keywords: string[]): string | null {
  // Simple fuzzy matching for common typos
  const typoMap: Record<string, string> = {
    'taks': 'my tasks',
    'projets': 'my projects',
    'tem': 'team members',
    'overdu': 'overdue tasks'
  };
  
  return typoMap[input] || null;
}

function getMostCommonRole(data: any[]): string {
  const roleCounts = data.reduce((acc, r) => {
    acc[r.role] = (acc[r.role] || 0) + 1;
    return acc;
  }, {});
  
  return Object.keys(roleCounts).reduce((a, b) => roleCounts[a] > roleCounts[b] ? a : b, 'Team Member');
}

export async function generateContextAwareChatResponse(userQuestion: string, conversationHistory: any[], userContext: any, selectedModel: string): Promise<string> {
  const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!openRouterApiKey) {
    throw new Error('OpenRouter API key not configured');
  }

  const contextInfo = userContext ? `

CURRENT WORKSPACE DATA:
- Active Projects: ${userContext.activeProjects.map((p: any) => `${p.name} (${p.status}, ${p.progress}%)`).join(', ')}
- My Current Tasks: ${userContext.myTasks.map((t: any) => `${t.name} (due: ${t.end_date})`).join(', ')}
- Performance Score: ${userContext.myPerformance?.current_score || 'N/A'}

Based on your actual workspace data, I can provide specific recommendations.` : '';

  const systemPrompt = `You are Tink, an AI assistant for Planova project management platform. You provide personalized advice based on the user's actual project data.

When answering questions:
1. Use the workspace data to provide specific, personalized answers
2. Reference actual projects and tasks when relevant
3. Provide insights based on current workload and performance
4. Be practical and actionable
5. Suggest specific next steps

Keep responses concise but informative.${contextInfo}`;

  const prompt = `${systemPrompt}

User: "${userQuestion}"

${conversationHistory.length > 0 ? `Previous context:\n${conversationHistory.slice(-3).map((msg: any) => `${msg.message_role}: ${msg.message_content}`).join('\n')}\n` : ''}

Provide helpful, data-driven project management guidance.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openRouterApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.8
    })
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
}