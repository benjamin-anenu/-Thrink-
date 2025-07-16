export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      compliance_logs: {
        Row: {
          created_at: string
          description: string
          event_category: string
          event_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          retention_period: number | null
          user_agent: string | null
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          event_category: string
          event_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          retention_period?: number | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          event_category?: string
          event_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          retention_period?: number | null
          user_agent?: string | null
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      data_processing_activities: {
        Row: {
          activity_name: string
          created_at: string
          cross_border_transfers: boolean | null
          data_categories: string[]
          data_subjects: string[]
          id: string
          is_active: boolean | null
          legal_basis: string
          purpose: string
          recipients: string[] | null
          retention_period: number | null
          safeguards: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          activity_name: string
          created_at?: string
          cross_border_transfers?: boolean | null
          data_categories: string[]
          data_subjects: string[]
          id?: string
          is_active?: boolean | null
          legal_basis: string
          purpose: string
          recipients?: string[] | null
          retention_period?: number | null
          safeguards?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          activity_name?: string
          created_at?: string
          cross_border_transfers?: boolean | null
          data_categories?: string[]
          data_subjects?: string[]
          id?: string
          is_active?: boolean | null
          legal_basis?: string
          purpose?: string
          recipients?: string[] | null
          retention_period?: number | null
          safeguards?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_processing_activities_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          baseline_date: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          name: string
          progress: number | null
          project_id: string | null
          status: string | null
          task_ids: string[] | null
          updated_at: string
        }
        Insert: {
          baseline_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          progress?: number | null
          project_id?: string | null
          status?: string | null
          task_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          baseline_date?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          progress?: number | null
          project_id?: string | null
          status?: string | null
          task_ids?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string
          email_notifications: boolean | null
          full_name: string | null
          id: string
          job_title: string | null
          marketing_emails: boolean | null
          phone: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          marketing_emails?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          email_notifications?: boolean | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          marketing_emails?: boolean | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_ai_data: {
        Row: {
          created_at: string
          id: string
          project_id: string
          project_plan: string | null
          recommendations: string[] | null
          risk_assessment: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          project_plan?: string | null
          recommendations?: string[] | null
          risk_assessment?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          project_plan?: string | null
          recommendations?: string[] | null
          risk_assessment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_ai_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_assignments: {
        Row: {
          assigned_at: string
          id: string
          project_id: string | null
          resource_id: string | null
          role: string | null
        }
        Insert: {
          assigned_at?: string
          id?: string
          project_id?: string | null
          resource_id?: string | null
          role?: string | null
        }
        Update: {
          assigned_at?: string
          id?: string
          project_id?: string | null
          resource_id?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_assignments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      project_drafts: {
        Row: {
          created_at: string
          current_step: number
          draft_data: Json
          draft_name: string
          id: string
          last_modified: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          draft_data?: Json
          draft_name: string
          id?: string
          last_modified?: string
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          draft_data?: Json
          draft_name?: string
          id?: string
          last_modified?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_drafts_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      project_escalation_matrix: {
        Row: {
          contact_email: string
          contact_name: string
          contact_role: string
          created_at: string
          id: string
          issue_types: string[] | null
          level: number
          project_id: string
        }
        Insert: {
          contact_email: string
          contact_name: string
          contact_role: string
          created_at?: string
          id?: string
          issue_types?: string[] | null
          level: number
          project_id: string
        }
        Update: {
          contact_email?: string
          contact_name?: string
          contact_role?: string
          created_at?: string
          id?: string
          issue_types?: string[] | null
          level?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_escalation_matrix_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          project_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          project_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_initiation_documents: {
        Row: {
          approved: boolean | null
          created_at: string
          document_content: string | null
          id: string
          project_id: string
          signatures: Json | null
          updated_at: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          document_content?: string | null
          id?: string
          project_id: string
          signatures?: Json | null
          updated_at?: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          document_content?: string | null
          id?: string
          project_id?: string
          signatures?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_initiation_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_kickoff_data: {
        Row: {
          created_at: string
          id: string
          meeting_minutes: string | null
          objectives: string[] | null
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          meeting_minutes?: string | null
          objectives?: string[] | null
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          meeting_minutes?: string | null
          objectives?: string[] | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_kickoff_data_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_requirements: {
        Row: {
          constraints: string[] | null
          created_at: string
          functional_requirements: string[] | null
          id: string
          non_functional_requirements: string[] | null
          project_id: string
          stakeholder_signoffs: boolean[] | null
          updated_at: string
        }
        Insert: {
          constraints?: string[] | null
          created_at?: string
          functional_requirements?: string[] | null
          id?: string
          non_functional_requirements?: string[] | null
          project_id: string
          stakeholder_signoffs?: boolean[] | null
          updated_at?: string
        }
        Update: {
          constraints?: string[] | null
          created_at?: string
          functional_requirements?: string[] | null
          id?: string
          non_functional_requirements?: string[] | null
          project_id?: string
          stakeholder_signoffs?: boolean[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_requirements_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assignee_id: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          priority: string | null
          project_id: string | null
          start_date: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          priority?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          priority?: string | null
          project_id?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_team_members: {
        Row: {
          allocation: number | null
          created_at: string
          id: string
          name: string
          project_id: string
          role: string
        }
        Insert: {
          allocation?: number | null
          created_at?: string
          id?: string
          name: string
          project_id: string
          role: string
        }
        Update: {
          allocation?: number | null
          created_at?: string
          id?: string
          name?: string
          project_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          ai_processing_completed_at: string | null
          ai_processing_started_at: string | null
          ai_processing_status: string | null
          budget: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          health_score: number | null
          health_status: string | null
          id: string
          name: string
          priority: string | null
          progress: number | null
          resources: string[] | null
          stakeholder_ids: string[] | null
          start_date: string | null
          status: string | null
          tags: string[] | null
          team_size: number | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          ai_processing_completed_at?: string | null
          ai_processing_started_at?: string | null
          ai_processing_status?: string | null
          budget?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          health_score?: number | null
          health_status?: string | null
          id?: string
          name: string
          priority?: string | null
          progress?: number | null
          resources?: string[] | null
          stakeholder_ids?: string[] | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          team_size?: number | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          ai_processing_completed_at?: string | null
          ai_processing_started_at?: string | null
          ai_processing_status?: string | null
          budget?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          health_score?: number | null
          health_status?: string | null
          id?: string
          name?: string
          priority?: string | null
          progress?: number | null
          resources?: string[] | null
          stakeholder_ids?: string[] | null
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          team_size?: number | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          data: Json | null
          generated_by: string | null
          id: string
          project_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          data?: Json | null
          generated_by?: string | null
          id?: string
          project_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          data?: Json | null
          generated_by?: string | null
          id?: string
          project_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_assignments: {
        Row: {
          assigned_at: string
          id: string
          resource_id: string | null
          task_id: string | null
        }
        Insert: {
          assigned_at?: string
          id?: string
          resource_id?: string | null
          task_id?: string | null
        }
        Update: {
          assigned_at?: string
          id?: string
          resource_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_assignments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: string
          name: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stakeholders: {
        Row: {
          contact_info: Json | null
          created_at: string
          email: string | null
          escalation_level: number | null
          id: string
          influence_level: string | null
          name: string
          organization: string | null
          project_id: string | null
          role: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string
          email?: string | null
          escalation_level?: number | null
          id?: string
          influence_level?: string | null
          name: string
          organization?: string | null
          project_id?: string | null
          role?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string
          email?: string | null
          escalation_level?: number | null
          id?: string
          influence_level?: string | null
          name?: string
          organization?: string | null
          project_id?: string | null
          role?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stakeholders_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      time_tracking: {
        Row: {
          duration_minutes: number | null
          end_time: string | null
          id: string
          notes: string | null
          resource_id: string | null
          start_time: string
          task_id: string | null
        }
        Insert: {
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          start_time: string
          task_id?: string | null
        }
        Update: {
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          start_time?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_tracking_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_tracking_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          ended_at: string | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
          is_active: boolean | null
          last_activity: string | null
          login_method: string | null
          session_id: string
          user_agent: string | null
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          ended_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          login_method?: string | null
          session_id: string
          user_agent?: string | null
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          ended_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          login_method?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          metadata: Json | null
          role: string
          status: string | null
          workspace_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          metadata?: Json | null
          role?: string
          status?: string | null
          workspace_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          metadata?: Json | null
          role?: string
          status?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invitations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string | null
          permissions: Json | null
          role: string
          status: string | null
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          status?: string | null
          updated_at?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          permissions?: Json | null
          role?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          max_members: number | null
          name: string
          owner_id: string
          settings: Json | null
          slug: string
          subscription_tier: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          name: string
          owner_id: string
          settings?: Json | null
          slug: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          name?: string
          owner_id?: string
          settings?: Json | null
          slug?: string
          subscription_tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_workspace_invitation: {
        Args: { invitation_token: string }
        Returns: boolean
      }
      create_workspace_with_owner: {
        Args: {
          workspace_name: string
          workspace_description?: string
          workspace_slug?: string
        }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      track_user_session: {
        Args: {
          session_id_param: string
          workspace_id_param?: string
          ip_address_param?: unknown
          user_agent_param?: string
          device_info_param?: Json
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "owner" | "admin" | "manager" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "manager", "member", "viewer"],
    },
  },
} as const
