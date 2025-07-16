import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    console.log(`Starting AI processing for project: ${projectId}`);

    // Update status to processing
    await supabase
      .from('projects')
      .update({ 
        ai_processing_status: 'processing',
        ai_processing_started_at: new Date().toISOString()
      })
      .eq('id', projectId);

    // Get project data with all related information
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        project_kickoff_data(*),
        project_requirements(*),
        project_team_members(*),
        stakeholders(*),
        milestones(*)
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error(`Failed to fetch project data: ${projectError?.message}`);
    }

    // Generate AI content
    const aiContent = await generateProjectAIContent(project);
    
    // Save AI data
    await supabase
      .from('project_ai_data')
      .upsert({
        project_id: projectId,
        project_plan: aiContent.projectPlan,
        risk_assessment: aiContent.riskAssessment,
        recommendations: aiContent.recommendations
      });

    // Generate and create initial tasks
    const initialTasks = generateInitialTasks(project);
    if (initialTasks.length > 0) {
      await supabase
        .from('project_tasks')
        .insert(initialTasks.map(task => ({
          ...task,
          project_id: projectId
        })));
    }

    // Update status to completed
    await supabase
      .from('projects')
      .update({ 
        ai_processing_status: 'completed',
        ai_processing_completed_at: new Date().toISOString()
      })
      .eq('id', projectId);

    console.log(`AI processing completed for project: ${projectId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'AI processing completed successfully',
        projectId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI processing:', error);

    // Update status to failed if we have a projectId
    const { projectId } = await req.json().catch(() => ({}));
    if (projectId) {
      await supabase
        .from('projects')
        .update({ 
          ai_processing_status: 'failed',
          ai_processing_completed_at: new Date().toISOString()
        })
        .eq('id', projectId);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateProjectAIContent(projectData: any) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const projectPlan = generateRealisticProjectPlan(projectData);
  const riskAssessment = generateRiskAssessment(projectData);
  const recommendations = generateRecommendations(projectData);

  return {
    projectPlan,
    riskAssessment,
    recommendations
  };
}

function generateRealisticProjectPlan(projectData: any): string {
  const projectName = projectData.name;
  const description = projectData.description || 'Project description not provided';
  const startDate = projectData.start_date ? new Date(projectData.start_date).toLocaleDateString() : 'TBD';
  const endDate = projectData.end_date ? new Date(projectData.end_date).toLocaleDateString() : 'TBD';

  return `# ${projectName} - Project Plan

## Project Overview
${description}

**Project Timeline:** ${startDate} - ${endDate}

## Phase 1: Initiation (Week 1-2)
- Project kickoff meeting
- Stakeholder alignment and requirements gathering
- Resource allocation and team formation
- Initial risk assessment

## Phase 2: Planning (Week 3-4)
- Detailed project planning and scope definition
- Technical architecture and design review
- Timeline and milestone finalization
- Communication plan establishment

## Phase 3: Execution (Week 5-12)
- Core development and implementation
- Regular progress monitoring and reporting
- Quality assurance and testing
- Stakeholder updates and feedback incorporation

## Phase 4: Delivery (Week 13-14)
- Final testing and validation
- User acceptance testing
- Documentation and training
- Project closure and handover

## Key Deliverables
- Project charter and scope document
- Technical specifications
- Implementation deliverables
- Testing and validation reports
- Final project documentation

## Success Criteria
- Delivery within timeline and budget
- Meeting all specified requirements
- Stakeholder satisfaction
- Quality standards compliance`;
}

function generateRiskAssessment(projectData: any): string {
  return `# Risk Assessment for ${projectData.name}

## High Priority Risks

### 1. Resource Availability Risk
**Probability:** Medium | **Impact:** High
**Description:** Key team members may become unavailable during critical project phases.
**Mitigation:** Cross-train team members and maintain resource backup plans.

### 2. Technical Complexity Risk
**Probability:** Medium | **Impact:** Medium
**Description:** Technical challenges may exceed initial estimates.
**Mitigation:** Regular technical reviews and prototype validations.

### 3. Scope Creep Risk
**Probability:** High | **Impact:** Medium
**Description:** Additional requirements may be introduced during execution.
**Mitigation:** Strong change management process and stakeholder communication.

## Medium Priority Risks

### 4. Integration Challenges
**Probability:** Medium | **Impact:** Medium
**Description:** System integration may present unforeseen complications.
**Mitigation:** Early integration testing and vendor collaboration.

### 5. Timeline Pressure
**Probability:** Medium | **Impact:** Medium
**Description:** Compressed timelines may impact quality or scope.
**Mitigation:** Regular milestone reviews and scope prioritization.

## Risk Monitoring
- Weekly risk assessment reviews
- Escalation procedures for high-impact risks
- Continuous risk identification and mitigation planning`;
}

function generateRecommendations(projectData: any): string[] {
  const baseRecommendations = [
    "Establish clear communication channels with all stakeholders",
    "Implement regular checkpoint meetings and progress reviews",
    "Maintain detailed documentation throughout the project lifecycle",
    "Ensure proper change management processes are in place"
  ];

  const teamSize = projectData.team_size || 0;
  if (teamSize > 5) {
    baseRecommendations.push("Consider implementing agile methodologies for better team coordination");
  }

  const priority = projectData.priority || 'Medium';
  if (priority === 'High') {
    baseRecommendations.push("Assign dedicated project manager for daily oversight");
    baseRecommendations.push("Implement daily standup meetings for rapid issue resolution");
  }

  return baseRecommendations;
}

function generateInitialTasks(projectData: any) {
  const tasks = [
    {
      name: "Project Kickoff Meeting",
      description: "Initial meeting with all stakeholders to align on project goals and expectations",
      status: "Pending",
      priority: "High",
      start_date: projectData.start_date,
      end_date: projectData.start_date
    },
    {
      name: "Requirements Documentation",
      description: "Document detailed project requirements and acceptance criteria",
      status: "Pending",
      priority: "High"
    },
    {
      name: "Resource Planning",
      description: "Finalize team assignments and resource allocation",
      status: "Pending",
      priority: "Medium"
    },
    {
      name: "Risk Assessment Review",
      description: "Review and validate identified risks and mitigation strategies",
      status: "Pending",
      priority: "Medium"
    }
  ];

  // Add milestone-specific tasks
  if (projectData.milestones && projectData.milestones.length > 0) {
    projectData.milestones.forEach((milestone: any, index: number) => {
      tasks.push({
        name: `Milestone ${index + 1}: ${milestone.name}`,
        description: milestone.description || `Work towards completing ${milestone.name}`,
        status: "Pending",
        priority: "Medium",
        end_date: milestone.due_date
      });
    });
  }

  return tasks;
}