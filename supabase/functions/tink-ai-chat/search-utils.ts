// Search Mode Utilities for Tink AI Chat
export async function processLocalSearch(userQuestion: string, workspaceId: string, supabase: any, userId: string): Promise<string> {
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

  const input = userQuestion.toLowerCase().trim();
  let queryInfo = null;

  // Direct match
  if (keywordMappings[input]) {
    queryInfo = keywordMappings[input];
  } else {
    // Partial match
    for (const [keyword, info] of Object.entries(keywordMappings)) {
      if (input.includes(keyword) || keyword.includes(input)) {
        queryInfo = info;
        break;
      }
    }
  }

  if (!queryInfo) {
    return `🤔 Didn't understand "${userQuestion}". Try these keywords:
• "my tasks" - Your assigned tasks
• "overdue projects" - Overdue projects
• "team members" - Team information
• "my performance" - Your performance metrics
• "project summary" - Project overview

💡 Tip: You can also search by project name`;
  }

  try {
    const params = [];
    if (queryInfo.params.includes('workspace_id')) params.push(workspaceId);
    if (queryInfo.params.includes('user_id')) params.push(userId);

    // Use basic SQL execution without RPC
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .limit(10);

    if (error) {
      console.error('Database query error:', error);
      return `❌ Error retrieving data: ${error.message}`;
    }

    return formatSearchResults(data || [], input);
  } catch (error) {
    console.error('Search error:', error);
    return `❌ Search failed: ${error.message}`;
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