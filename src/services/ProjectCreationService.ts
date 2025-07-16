
import { supabase } from '@/integrations/supabase/client';
import { AIProjectService } from './AIProjectService';
import { TaskManagementService } from './TaskManagementService';

export interface ProjectCreationData {
  // Basic project info
  name: string;
  description: string;
  workspaceId: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
  tags?: string[];
  
  // Kickoff data
  kickoffData?: {
    meetingMinutes: string;
    objectives: string[];
    documents?: File[];
  };
  
  // Requirements
  requirements?: {
    functional: string[];
    nonFunctional: string[];
    constraints: string[];
    stakeholderSignoffs: boolean[];
  };
  
  // Resources/Team
  resources?: {
    teamMembers: Array<{
      name: string;
      role: string;
      allocation: number;
    }>;
    budget: string;
    timeline: { start: string; end: string };
  };
  
  // Stakeholders
  stakeholders?: Array<{
    name: string;
    email: string;
    role: string;
    organization: string;
    influenceLevel: string;
    contactInfo: any;
  }>;
  
  // Escalation matrix
  escalationMatrix?: Array<{
    level: number;
    contactName: string;
    contactEmail: string;
    contactRole: string;
    issueTypes: string[];
  }>;
  
  // Milestones
  milestones?: Array<{
    name: string;
    description: string;
    date: string;
    baselineDate: string;
    status: string;
    tasks: string[];
  }>;
  
  // AI Generated content
  aiGenerated?: {
    projectPlan: string;
    riskAssessment: string;
    recommendations: string[];
  };
  
  // Initiation
  initiation?: {
    document: string;
    signatures: any[];
    approved: boolean;
  };
}

export class ProjectCreationService {
  static async createProject(data: ProjectCreationData) {
    try {
      // 1. Create the main project record with AI processing status
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          name: data.name,
          description: data.description,
          workspace_id: data.workspaceId,
          priority: data.priority || 'Medium',
          start_date: data.startDate,
          end_date: data.endDate,
          budget: data.budget,
          tags: data.tags || [],
          resources: data.resources?.teamMembers?.map(tm => tm.name) || [],
          status: 'Planning',
          progress: 0,
          health_status: 'green',
          health_score: 100,
          team_size: data.resources?.teamMembers?.length || 0,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          ai_processing_status: 'pending' // Start with pending status
        })
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error('Failed to create project');

      const projectId = project.id;

      // 2. Create kickoff data if provided
      if (data.kickoffData) {
        const { error: kickoffError } = await supabase
          .from('project_kickoff_data')
          .insert({
            project_id: projectId,
            meeting_minutes: data.kickoffData.meetingMinutes,
            objectives: data.kickoffData.objectives
          });
        
        if (kickoffError) throw kickoffError;
      }

      // 3. Create requirements if provided
      if (data.requirements) {
        const { error: reqError } = await supabase
          .from('project_requirements')
          .insert({
            project_id: projectId,
            functional_requirements: data.requirements.functional,
            non_functional_requirements: data.requirements.nonFunctional,
            constraints: data.requirements.constraints,
            stakeholder_signoffs: data.requirements.stakeholderSignoffs
          });
        
        if (reqError) throw reqError;
      }

      // 4. Create team members if provided
      if (data.resources?.teamMembers) {
        const teamMemberInserts = data.resources.teamMembers.map(member => ({
          project_id: projectId,
          name: member.name,
          role: member.role,
          allocation: member.allocation
        }));

        const { error: teamError } = await supabase
          .from('project_team_members')
          .insert(teamMemberInserts);
        
        if (teamError) throw teamError;
      }

      // 5. Create stakeholders if provided
      if (data.stakeholders) {
        const stakeholderInserts = data.stakeholders.map(stakeholder => ({
          project_id: projectId,
          workspace_id: data.workspaceId,
          name: stakeholder.name,
          email: stakeholder.email,
          role: stakeholder.role,
          organization: stakeholder.organization,
          influence_level: stakeholder.influenceLevel,
          contact_info: stakeholder.contactInfo
        }));

        const { error: stakeholderError } = await supabase
          .from('stakeholders')
          .insert(stakeholderInserts);
        
        if (stakeholderError) throw stakeholderError;
      }

      // 6. Create escalation matrix if provided
      if (data.escalationMatrix) {
        const escalationInserts = data.escalationMatrix.map(escalation => ({
          project_id: projectId,
          level: escalation.level,
          contact_name: escalation.contactName,
          contact_email: escalation.contactEmail,
          contact_role: escalation.contactRole,
          issue_types: escalation.issueTypes
        }));

        const { error: escalationError } = await supabase
          .from('project_escalation_matrix')
          .insert(escalationInserts);
        
        if (escalationError) throw escalationError;
      }

      // 7. Create milestones if provided
      if (data.milestones) {
        const milestoneInserts = data.milestones.map(milestone => ({
          project_id: projectId,
          name: milestone.name,
          description: milestone.description,
          due_date: milestone.date,
          baseline_date: milestone.baselineDate,
          status: milestone.status,
          task_ids: milestone.tasks,
          progress: 0
        }));

        const { error: milestoneError } = await supabase
          .from('milestones')
          .insert(milestoneInserts);
        
        if (milestoneError) throw milestoneError;
      }

      // 8. Trigger background AI processing (non-blocking)
      this.triggerBackgroundAIProcessing(projectId);

      // 10. Create initiation document if provided
      if (data.initiation) {
        const { error: initiationError } = await supabase
          .from('project_initiation_documents')
          .insert({
            project_id: projectId,
            document_content: data.initiation.document,
            signatures: data.initiation.signatures,
            approved: data.initiation.approved
          });
        
        if (initiationError) throw initiationError;
      }

      // 11. Handle file uploads if provided
      if (data.kickoffData?.documents && data.kickoffData.documents.length > 0) {
        await this.uploadProjectFiles(projectId, data.kickoffData.documents);
      }

      return {
        ...project,
        tasks: [], // Tasks will be created in background
        milestones: data.milestones || []
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  // Trigger background AI processing without blocking
  private static async triggerBackgroundAIProcessing(projectId: string) {
    try {
      // Call the edge function asynchronously
      supabase.functions.invoke('process-project-ai', {
        body: { projectId }
      }).catch(error => {
        console.error('Background AI processing failed:', error);
        // Update status to failed
        supabase
          .from('projects')
          .update({ 
            ai_processing_status: 'failed',
            ai_processing_completed_at: new Date().toISOString()
          })
          .eq('id', projectId);
      });
    } catch (error) {
      console.error('Failed to trigger background AI processing:', error);
    }
  }

  static async uploadProjectFiles(projectId: string, files: File[]) {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Record file metadata in database
      const { error: dbError } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;
      
      return uploadData;
    });

    return Promise.all(uploadPromises);
  }

  static async getProjectWithDetails(projectId: string) {
    try {
      // Get main project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Get all related data
      const [
        { data: kickoffData },
        { data: requirements },
        { data: teamMembers },
        { data: stakeholders },
        { data: escalationMatrix },
        { data: milestones },
        { data: aiData },
        { data: initiationDoc },
        { data: files }
      ] = await Promise.all([
        supabase.from('project_kickoff_data').select('*').eq('project_id', projectId).maybeSingle(),
        supabase.from('project_requirements').select('*').eq('project_id', projectId).maybeSingle(),
        supabase.from('project_team_members').select('*').eq('project_id', projectId),
        supabase.from('stakeholders').select('*').eq('project_id', projectId),
        supabase.from('project_escalation_matrix').select('*').eq('project_id', projectId),
        supabase.from('milestones').select('*').eq('project_id', projectId),
        supabase.from('project_ai_data').select('*').eq('project_id', projectId).maybeSingle(),
        supabase.from('project_initiation_documents').select('*').eq('project_id', projectId).maybeSingle(),
        supabase.from('project_files').select('*').eq('project_id', projectId)
      ]);

      return {
        ...project,
        kickoffData,
        requirements,
        teamMembers,
        stakeholders,
        escalationMatrix,
        milestones,
        aiData,
        initiationDoc,
        files
      };
    } catch (error) {
      console.error('Error fetching project details:', error);
      throw error;
    }
  }
}
