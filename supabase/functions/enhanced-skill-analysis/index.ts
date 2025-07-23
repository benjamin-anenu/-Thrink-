
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Smart model selection based on complexity
const getModelForAnalysis = (skillMatchScore: number, overallFitScore: number) => {
  const avgScore = (skillMatchScore + overallFitScore) / 2;
  
  // Complex analysis for low-performing resources (needs detailed recommendations)
  if (avgScore < 40) {
    return 'openai/gpt-4o-mini'; // More thorough analysis for critical cases
  }
  
  // Medium complexity for moderate performers
  if (avgScore < 70) {
    return 'anthropic/claude-3-haiku'; // Good balance of speed and quality
  }
  
  // Simple analysis for high performers (basic recommendations)
  return 'mistralai/mistral-7b-instruct'; // Fast and cost-effective
};

// Model fallback chain for reliability
const modelFallbackChain = [
  'openai/gpt-4o-mini',
  'anthropic/claude-3-haiku',
  'mistralai/mistral-7b-instruct'
];

const callOpenRouter = async (prompt: string, model: string, retryCount = 0) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-app.com', // Replace with your actual domain
        'X-Title': 'AI Resource Management System',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { 
            role: 'system', 
            content: 'You are a skilled workforce development analyst that provides specific, actionable training recommendations to improve employee performance on projects. Always respond with valid JSON format.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error (${model}):`, response.status, errorText);
      
      // Try next model in fallback chain
      if (retryCount < modelFallbackChain.length - 1) {
        const nextModel = modelFallbackChain[retryCount + 1];
        console.log(`Falling back to model: ${nextModel}`);
        return await callOpenRouter(prompt, nextModel, retryCount + 1);
      }
      
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error calling OpenRouter with ${model}:`, error);
    
    // Try next model in fallback chain
    if (retryCount < modelFallbackChain.length - 1) {
      const nextModel = modelFallbackChain[retryCount + 1];
      console.log(`Falling back to model: ${nextModel}`);
      return await callOpenRouter(prompt, nextModel, retryCount + 1);
    }
    
    throw error;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resourceName, resourceSkills, projectRequirements, taskTypes, overallFitScore, skillMatchScore } = await req.json();

    // Select optimal model based on analysis complexity
    const selectedModel = getModelForAnalysis(skillMatchScore || 0, overallFitScore || 0);
    console.log(`Selected model: ${selectedModel} for analysis (skill: ${skillMatchScore}%, fit: ${overallFitScore}%)`);

    const prompt = `
    Analyze this resource assignment and provide specific, actionable training recommendations:

    Resource: ${resourceName}
    Current Skills: ${JSON.stringify(resourceSkills)}
    Project Requirements: ${JSON.stringify(projectRequirements)}
    Task Types: ${JSON.stringify(taskTypes)}
    Overall Fit Score: ${overallFitScore}%
    Skill Match Score: ${skillMatchScore}%

    Please provide a detailed analysis with:
    1. Specific skill gaps (what skills are missing or weak)
    2. Specific task types they struggle with
    3. Targeted training recommendations with actionable steps
    4. Expected impact of training on performance
    5. Priority level (High/Medium/Low)

    Respond ONLY with valid JSON in this exact format:
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

    const data = await callOpenRouter(prompt, selectedModel);
    const generatedAnalysis = data.choices[0].message.content;

    let analysisResult;
    try {
      // Clean the response to ensure valid JSON
      const cleanedResponse = generatedAnalysis.replace(/```json\n?|\n?```/g, '').trim();
      analysisResult = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Raw response:', generatedAnalysis);
      
      // Enhanced fallback with more specific recommendations
      analysisResult = {
        specificSkillGaps: resourceSkills?.length > 0 ? 
          resourceSkills.filter(skill => skill.proficiency < 3).map(skill => skill.name).slice(0, 3) : 
          ["Technical skills", "Project management"],
        strugglingTaskTypes: taskTypes?.slice(0, 2) || ["Complex analysis", "Team coordination"],
        trainingRecommendations: [{
          skill: "Priority skill development",
          training: `Focused training program based on ${overallFitScore}% fit score`,
          expectedImprovement: `${Math.max(10, 100 - overallFitScore)}% improvement expected`,
          timeToComplete: skillMatchScore < 30 ? "4-6 weeks" : "2-3 weeks"
        }],
        overallImpact: `Expected ${Math.max(15, 100 - overallFitScore)}% performance improvement through targeted skill development`,
        priority: skillMatchScore < 40 ? "High" : skillMatchScore < 70 ? "Medium" : "Low"
      };
    }

    return new Response(JSON.stringify({ 
      success: true, 
      analysis: analysisResult,
      modelUsed: selectedModel,
      metadata: {
        skillMatchScore,
        overallFitScore,
        analysisComplexity: selectedModel === 'openai/gpt-4o-mini' ? 'high' : 
                           selectedModel === 'anthropic/claude-3-haiku' ? 'medium' : 'low'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhanced-skill-analysis function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      analysis: {
        specificSkillGaps: ["Analysis temporarily unavailable"],
        strugglingTaskTypes: ["Multiple task types"],
        trainingRecommendations: [{
          skill: "General development",
          training: "Comprehensive skill assessment recommended",
          expectedImprovement: "15-25%",
          timeToComplete: "3-4 weeks"
        }],
        overallImpact: "Professional development program recommended",
        priority: "Medium"
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
