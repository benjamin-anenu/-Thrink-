import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resourceName, resourceSkills, projectRequirements, taskTypes, overallFitScore, skillMatchScore } = await req.json();

    const prompt = `
    Analyze this resource assignment and provide specific, actionable training recommendations:

    Resource: ${resourceName}
    Current Skills: ${JSON.stringify(resourceSkills)}
    Project Requirements: ${JSON.stringify(projectRequirements)}
    Task Types: ${JSON.stringify(taskTypes)}
    Overall Fit Score: ${overallFitScore}%
    Skill Match Score: ${skillMatchScore}%

    Please provide:
    1. Specific skill gaps (what skills are missing or weak)
    2. Specific task types they struggle with
    3. Targeted training recommendations
    4. Expected impact of training on performance
    5. Priority level (High/Medium/Low)

    Format as JSON:
    {
      "specificSkillGaps": ["skill1", "skill2"],
      "strugglingTaskTypes": ["task_type1", "task_type2"],
      "trainingRecommendations": [
        {
          "skill": "skill_name",
          "training": "specific training needed",
          "expectedImprovement": "% improvement expected",
          "timeToComplete": "estimated time"
        }
      ],
      "overallImpact": "description of expected performance improvement",
      "priority": "High/Medium/Low"
    }
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a skilled workforce development analyst that provides specific, actionable training recommendations to improve employee performance on projects.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedAnalysis = data.choices[0].message.content;

    let analysisResult;
    try {
      analysisResult = JSON.parse(generatedAnalysis);
    } catch (parseError) {
      // Fallback if JSON parsing fails
      analysisResult = {
        specificSkillGaps: ["Analysis unavailable"],
        strugglingTaskTypes: ["Various tasks"],
        trainingRecommendations: [{
          skill: "General skills",
          training: "Additional training recommended",
          expectedImprovement: "10-20%",
          timeToComplete: "2-4 weeks"
        }],
        overallImpact: "General performance improvement expected",
        priority: "Medium"
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysisResult 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhanced-skill-analysis function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      analysis: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});