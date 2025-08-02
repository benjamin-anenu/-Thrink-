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
      ai_assignment_recommendations: {
        Row: {
          alternative_assignments: Json | null
          availability_score: number | null
          collaboration_fit_score: number | null
          complexity_handling_fit_score: number | null
          context_switching_impact: number | null
          created_at: string | null
          expires_at: string | null
          id: string
          learning_opportunity_score: number | null
          overall_fit_score: number | null
          overload_risk_score: number | null
          project_id: string | null
          quality_prediction: number | null
          reasoning: Json | null
          recommended_task_count: number | null
          resource_id: string | null
          skill_gap_risk_score: number | null
          skill_match_score: number | null
          success_probability: number | null
          task_capacity_fit_score: number | null
          task_completion_forecast: number | null
          timeline_confidence: number | null
          workspace_id: string | null
        }
        Insert: {
          alternative_assignments?: Json | null
          availability_score?: number | null
          collaboration_fit_score?: number | null
          complexity_handling_fit_score?: number | null
          context_switching_impact?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          learning_opportunity_score?: number | null
          overall_fit_score?: number | null
          overload_risk_score?: number | null
          project_id?: string | null
          quality_prediction?: number | null
          reasoning?: Json | null
          recommended_task_count?: number | null
          resource_id?: string | null
          skill_gap_risk_score?: number | null
          skill_match_score?: number | null
          success_probability?: number | null
          task_capacity_fit_score?: number | null
          task_completion_forecast?: number | null
          timeline_confidence?: number | null
          workspace_id?: string | null
        }
        Update: {
          alternative_assignments?: Json | null
          availability_score?: number | null
          collaboration_fit_score?: number | null
          complexity_handling_fit_score?: number | null
          context_switching_impact?: number | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          learning_opportunity_score?: number | null
          overall_fit_score?: number | null
          overload_risk_score?: number | null
          project_id?: string | null
          quality_prediction?: number | null
          reasoning?: Json | null
          recommended_task_count?: number | null
          resource_id?: string | null
          skill_gap_risk_score?: number | null
          skill_match_score?: number | null
          success_probability?: number | null
          task_capacity_fit_score?: number | null
          task_completion_forecast?: number | null
          timeline_confidence?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_assignment_recommendations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_assignment_recommendations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_assignment_recommendations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversation_history: {
        Row: {
          context_data: Json | null
          conversation_type: string
          created_at: string
          id: string
          message_content: string
          message_role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          context_data?: Json | null
          conversation_type?: string
          created_at?: string
          id?: string
          message_content: string
          message_role: string
          user_id: string
          workspace_id: string
        }
        Update: {
          context_data?: Json | null
          conversation_type?: string
          created_at?: string
          id?: string
          message_content?: string
          message_role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_user_settings: {
        Row: {
          chat_personality: string
          context_awareness_level: string
          conversation_history_enabled: boolean
          created_at: string
          id: string
          preferred_model: string
          updated_at: string
          use_ai_analysis: boolean
          user_id: string
          workspace_id: string
        }
        Insert: {
          chat_personality?: string
          context_awareness_level?: string
          conversation_history_enabled?: boolean
          created_at?: string
          id?: string
          preferred_model?: string
          updated_at?: string
          use_ai_analysis?: boolean
          user_id: string
          workspace_id: string
        }
        Update: {
          chat_personality?: string
          context_awareness_level?: string
          conversation_history_enabled?: boolean
          created_at?: string
          id?: string
          preferred_model?: string
          updated_at?: string
          use_ai_analysis?: boolean
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ai_settings_workspace"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
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
      baseline_versions: {
        Row: {
          approval_status: string | null
          baseline_type: string | null
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          end_date: string
          id: string
          project_id: string | null
          start_date: string
          task_id: string | null
          version_number: number
        }
        Insert: {
          approval_status?: string | null
          baseline_type?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          end_date: string
          id?: string
          project_id?: string | null
          start_date: string
          task_id?: string | null
          version_number: number
        }
        Update: {
          approval_status?: string | null
          baseline_type?: string | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          end_date?: string
          id?: string
          project_id?: string | null
          start_date?: string
          task_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "baseline_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baseline_versions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean | null
          attendees: Json | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          event_type: string | null
          id: string
          location: string | null
          project_id: string | null
          recurrence_rule: string | null
          start_date: string
          task_id: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          all_day?: boolean | null
          attendees?: Json | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          event_type?: string | null
          id?: string
          location?: string | null
          project_id?: string | null
          recurrence_rule?: string | null
          start_date: string
          task_id?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          all_day?: boolean | null
          attendees?: Json | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          event_type?: string | null
          id?: string
          location?: string | null
          project_id?: string | null
          recurrence_rule?: string | null
          start_date?: string
          task_id?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      change_control_board: {
        Row: {
          attendees: string[]
          conditions: string[] | null
          created_at: string | null
          decision: string | null
          id: string
          meeting_date: string
          meeting_notes: string | null
          request_id: string | null
          risk_mitigation_plan: string | null
        }
        Insert: {
          attendees: string[]
          conditions?: string[] | null
          created_at?: string | null
          decision?: string | null
          id?: string
          meeting_date: string
          meeting_notes?: string | null
          request_id?: string | null
          risk_mitigation_plan?: string | null
        }
        Update: {
          attendees?: string[]
          conditions?: string[] | null
          created_at?: string | null
          decision?: string | null
          id?: string
          meeting_date?: string
          meeting_notes?: string | null
          request_id?: string | null
          risk_mitigation_plan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "change_control_board_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "rebaseline_requests_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      client_satisfaction: {
        Row: {
          client_email: string | null
          client_name: string
          created_at: string
          feedback_text: string | null
          id: string
          project_id: string | null
          satisfaction_score: number
          survey_date: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          project_id?: string | null
          satisfaction_score: number
          survey_date?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          created_at?: string
          feedback_text?: string | null
          id?: string
          project_id?: string | null
          satisfaction_score?: number
          survey_date?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_satisfaction_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      critical_path_analysis: {
        Row: {
          analysis_data: Json | null
          analysis_date: string
          created_at: string
          created_by: string
          critical_path_tasks: string[] | null
          id: string
          project_id: string
          slack_days: number | null
          total_duration_days: number | null
        }
        Insert: {
          analysis_data?: Json | null
          analysis_date?: string
          created_at?: string
          created_by: string
          critical_path_tasks?: string[] | null
          id?: string
          project_id: string
          slack_days?: number | null
          total_duration_days?: number | null
        }
        Update: {
          analysis_data?: Json | null
          analysis_date?: string
          created_at?: string
          created_by?: string
          critical_path_tasks?: string[] | null
          id?: string
          project_id?: string
          slack_days?: number | null
          total_duration_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "critical_path_analysis_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      departments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      document_folders: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          parent_folder_id: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          parent_folder_id?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          parent_folder_id?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "document_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_assignments: {
        Row: {
          created_at: string
          id: string
          level_id: string
          stakeholder_id: string
          trigger_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_id: string
          stakeholder_id: string
          trigger_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level_id?: string
          stakeholder_id?: string
          trigger_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalation_assignments_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "escalation_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_assignments_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_assignments_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "escalation_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_history: {
        Row: {
          acknowledged_at: string | null
          acknowledgment_token: string | null
          created_at: string
          id: string
          level_id: string
          project_id: string
          sent_at: string
          stakeholder_id: string
          status: string
          trigger_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledgment_token?: string | null
          created_at?: string
          id?: string
          level_id: string
          project_id: string
          sent_at?: string
          stakeholder_id: string
          status?: string
          trigger_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledgment_token?: string | null
          created_at?: string
          id?: string
          level_id?: string
          project_id?: string
          sent_at?: string
          stakeholder_id?: string
          status?: string
          trigger_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalation_history_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "escalation_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_stakeholder_id_fkey"
            columns: ["stakeholder_id"]
            isOneToOne: false
            referencedRelation: "stakeholders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_trigger_id_fkey"
            columns: ["trigger_id"]
            isOneToOne: false
            referencedRelation: "escalation_triggers"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_levels: {
        Row: {
          created_at: string
          id: string
          level_order: number
          name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_order: number
          name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level_order?: number
          name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      escalation_triggers: {
        Row: {
          condition_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          threshold_unit: string | null
          threshold_value: number | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          condition_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          threshold_unit?: string | null
          threshold_value?: number | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          condition_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          threshold_unit?: string | null
          threshold_value?: number | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalation_triggers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      external_calendar_integrations: {
        Row: {
          access_token: string | null
          account_email: string
          created_at: string
          created_by: string
          id: string
          last_sync_at: string | null
          provider: string
          refresh_token: string | null
          sync_enabled: boolean | null
          sync_errors: Json | null
          token_expires_at: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          access_token?: string | null
          account_email: string
          created_at?: string
          created_by: string
          id?: string
          last_sync_at?: string | null
          provider: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_errors?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          access_token?: string | null
          account_email?: string
          created_at?: string
          created_by?: string
          id?: string
          last_sync_at?: string | null
          provider?: string
          refresh_token?: string | null
          sync_enabled?: boolean | null
          sync_errors?: Json | null
          token_expires_at?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_calendar_integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_comments: {
        Row: {
          comment_text: string
          comment_type: string
          created_at: string
          id: string
          issue_id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          comment_text: string
          comment_type?: string
          created_at?: string
          id?: string
          issue_id: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          comment_text?: string
          comment_type?: string
          created_at?: string
          id?: string
          issue_id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_issue_comments_issue"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "project_issues"
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
          phase_id: string | null
          progress: number | null
          project_id: string | null
          sort_order_in_phase: number | null
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
          phase_id?: string | null
          progress?: number | null
          project_id?: string | null
          sort_order_in_phase?: number | null
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
          phase_id?: string | null
          progress?: number | null
          project_id?: string | null
          sort_order_in_phase?: number | null
          status?: string | null
          task_ids?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_performance_reports: {
        Row: {
          achievements: string[] | null
          ai_insights: string[] | null
          challenges: string[] | null
          collaboration_score: number
          communication_score: number
          created_at: string
          deadline_adherence_score: number
          generated_at: string
          goals: string[] | null
          id: string
          manager_notes: string | null
          month: string
          overall_score: number
          productivity_score: number
          quality_score: number
          resource_id: string
          workspace_id: string
          year: number
        }
        Insert: {
          achievements?: string[] | null
          ai_insights?: string[] | null
          challenges?: string[] | null
          collaboration_score?: number
          communication_score?: number
          created_at?: string
          deadline_adherence_score?: number
          generated_at?: string
          goals?: string[] | null
          id?: string
          manager_notes?: string | null
          month: string
          overall_score?: number
          productivity_score?: number
          quality_score?: number
          resource_id: string
          workspace_id: string
          year: number
        }
        Update: {
          achievements?: string[] | null
          ai_insights?: string[] | null
          challenges?: string[] | null
          collaboration_score?: number
          communication_score?: number
          created_at?: string
          deadline_adherence_score?: number
          generated_at?: string
          goals?: string[] | null
          id?: string
          manager_notes?: string | null
          month?: string
          overall_score?: number
          productivity_score?: number
          quality_score?: number
          resource_id?: string
          workspace_id?: string
          year?: number
        }
        Relationships: []
      }
      notification_queue: {
        Row: {
          category: string
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          priority: string
          read: boolean | null
          read_at: string | null
          sent_at: string | null
          sent_via: string[] | null
          title: string
          type: string
          user_id: string | null
          workspace_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          priority: string
          read?: boolean | null
          read_at?: string | null
          sent_at?: string | null
          sent_via?: string[] | null
          title: string
          type: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          priority?: string
          read?: boolean | null
          read_at?: string | null
          sent_at?: string | null
          sent_via?: string[] | null
          title?: string
          type?: string
          user_id?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
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
      performance_metrics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          project_id: string | null
          resource_id: string
          task_id: string | null
          timestamp: string
          type: string
          value: number
          weight: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          resource_id: string
          task_id?: string | null
          timestamp?: string
          type: string
          value?: number
          weight?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          project_id?: string | null
          resource_id?: string
          task_id?: string | null
          timestamp?: string
          type?: string
          value?: number
          weight?: number
          workspace_id?: string
        }
        Relationships: []
      }
      performance_profiles: {
        Row: {
          created_at: string
          current_score: number
          id: string
          improvement_areas: string[] | null
          last_updated: string
          monthly_score: number
          resource_id: string
          resource_name: string
          risk_level: string
          strengths: string[] | null
          trend: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          current_score?: number
          id?: string
          improvement_areas?: string[] | null
          last_updated?: string
          monthly_score?: number
          resource_id: string
          resource_name: string
          risk_level?: string
          strengths?: string[] | null
          trend?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          current_score?: number
          id?: string
          improvement_areas?: string[] | null
          last_updated?: string
          monthly_score?: number
          resource_id?: string
          resource_name?: string
          risk_level?: string
          strengths?: string[] | null
          trend?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      phases: {
        Row: {
          baseline_end_date: string | null
          baseline_start_date: string | null
          color: string | null
          computed_end_date: string | null
          computed_start_date: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          priority: string | null
          progress: number | null
          project_id: string
          sort_order: number
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          baseline_end_date?: string | null
          baseline_start_date?: string | null
          color?: string | null
          computed_end_date?: string | null
          computed_start_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          priority?: string | null
          progress?: number | null
          project_id: string
          sort_order?: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          baseline_end_date?: string | null
          baseline_start_date?: string | null
          color?: string | null
          computed_end_date?: string | null
          computed_start_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          priority?: string | null
          progress?: number | null
          project_id?: string
          sort_order?: number
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      project_budgets: {
        Row: {
          allocated_amount: number
          budget_category: string
          created_at: string
          currency: string
          id: string
          project_id: string | null
          spent_amount: number
          updated_at: string
        }
        Insert: {
          allocated_amount?: number
          budget_category: string
          created_at?: string
          currency?: string
          id?: string
          project_id?: string | null
          spent_amount?: number
          updated_at?: string
        }
        Update: {
          allocated_amount?: number
          budget_category?: string
          created_at?: string
          currency?: string
          id?: string
          project_id?: string | null
          spent_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_budgets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_daily_checkins: {
        Row: {
          blockers: string[] | null
          checkin_date: string
          created_at: string | null
          id: string
          key_accomplishments: string[] | null
          next_steps: string[] | null
          progress_update: number | null
          project_id: string | null
          project_manager_id: string | null
          stakeholder_notes: string | null
          status_update: string | null
        }
        Insert: {
          blockers?: string[] | null
          checkin_date: string
          created_at?: string | null
          id?: string
          key_accomplishments?: string[] | null
          next_steps?: string[] | null
          progress_update?: number | null
          project_id?: string | null
          project_manager_id?: string | null
          stakeholder_notes?: string | null
          status_update?: string | null
        }
        Update: {
          blockers?: string[] | null
          checkin_date?: string
          created_at?: string | null
          id?: string
          key_accomplishments?: string[] | null
          next_steps?: string[] | null
          progress_update?: number | null
          project_id?: string | null
          project_manager_id?: string | null
          stakeholder_notes?: string | null
          status_update?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_daily_checkins_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          folder_name: string | null
          id: string
          project_id: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          folder_name?: string | null
          id?: string
          project_id: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          folder_name?: string | null
          id?: string
          project_id?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
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
      project_issues: {
        Row: {
          assignee_id: string | null
          attachments: Json | null
          category: string
          created_at: string
          created_by: string
          date_identified: string
          description: string | null
          due_date: string | null
          estimated_delay_days: number | null
          id: string
          impact_summary: string | null
          linked_milestone_id: string | null
          linked_task_id: string | null
          priority: string
          project_id: string
          resolved_at: string | null
          severity: string
          source: string | null
          status: string
          suggested_action: string | null
          suggested_resolver: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          attachments?: Json | null
          category?: string
          created_at?: string
          created_by: string
          date_identified?: string
          description?: string | null
          due_date?: string | null
          estimated_delay_days?: number | null
          id?: string
          impact_summary?: string | null
          linked_milestone_id?: string | null
          linked_task_id?: string | null
          priority?: string
          project_id: string
          resolved_at?: string | null
          severity?: string
          source?: string | null
          status?: string
          suggested_action?: string | null
          suggested_resolver?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          attachments?: Json | null
          category?: string
          created_at?: string
          created_by?: string
          date_identified?: string
          description?: string | null
          due_date?: string | null
          estimated_delay_days?: number | null
          id?: string
          impact_summary?: string | null
          linked_milestone_id?: string | null
          linked_task_id?: string | null
          priority?: string
          project_id?: string
          resolved_at?: string | null
          severity?: string
          source?: string | null
          status?: string
          suggested_action?: string | null
          suggested_resolver?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_issues_assignee"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_issues_milestone"
            columns: ["linked_milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_issues_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_issues_task"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
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
          actual_complexity: number | null
          assigned_resources: string[] | null
          assigned_stakeholders: string[] | null
          assignee_id: string | null
          baseline_end_date: string | null
          baseline_start_date: string | null
          blocker_count: number | null
          collaboration_intensity: string | null
          completed_at: string | null
          complexity_score: number | null
          confidence_level: number | null
          context_switching_penalty: number | null
          created_at: string
          dependencies: string[] | null
          dependency_weight: number | null
          description: string | null
          duration: number | null
          effort_points: number | null
          end_date: string | null
          hierarchy_level: number | null
          id: string
          knowledge_transfer_required: boolean | null
          manual_override_dates: boolean | null
          milestone_id: string | null
          name: string
          parallel_task_capacity: number | null
          parent_task_id: string | null
          priority: string | null
          progress: number | null
          project_id: string | null
          requires_deep_focus: boolean | null
          rework_cycles: number | null
          sort_order: number | null
          start_date: string | null
          status: string | null
          task_size: string | null
          updated_at: string
        }
        Insert: {
          actual_complexity?: number | null
          assigned_resources?: string[] | null
          assigned_stakeholders?: string[] | null
          assignee_id?: string | null
          baseline_end_date?: string | null
          baseline_start_date?: string | null
          blocker_count?: number | null
          collaboration_intensity?: string | null
          completed_at?: string | null
          complexity_score?: number | null
          confidence_level?: number | null
          context_switching_penalty?: number | null
          created_at?: string
          dependencies?: string[] | null
          dependency_weight?: number | null
          description?: string | null
          duration?: number | null
          effort_points?: number | null
          end_date?: string | null
          hierarchy_level?: number | null
          id?: string
          knowledge_transfer_required?: boolean | null
          manual_override_dates?: boolean | null
          milestone_id?: string | null
          name: string
          parallel_task_capacity?: number | null
          parent_task_id?: string | null
          priority?: string | null
          progress?: number | null
          project_id?: string | null
          requires_deep_focus?: boolean | null
          rework_cycles?: number | null
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          task_size?: string | null
          updated_at?: string
        }
        Update: {
          actual_complexity?: number | null
          assigned_resources?: string[] | null
          assigned_stakeholders?: string[] | null
          assignee_id?: string | null
          baseline_end_date?: string | null
          baseline_start_date?: string | null
          blocker_count?: number | null
          collaboration_intensity?: string | null
          completed_at?: string | null
          complexity_score?: number | null
          confidence_level?: number | null
          context_switching_penalty?: number | null
          created_at?: string
          dependencies?: string[] | null
          dependency_weight?: number | null
          description?: string | null
          duration?: number | null
          effort_points?: number | null
          end_date?: string | null
          hierarchy_level?: number | null
          id?: string
          knowledge_transfer_required?: boolean | null
          manual_override_dates?: boolean | null
          milestone_id?: string | null
          name?: string
          parallel_task_capacity?: number | null
          parent_task_id?: string | null
          priority?: string | null
          progress?: number | null
          project_id?: string | null
          requires_deep_focus?: boolean | null
          rework_cycles?: number | null
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          task_size?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_milestone_id"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
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
          deleted_at: string | null
          deleted_by: string | null
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
          deleted_at?: string | null
          deleted_by?: string | null
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
          deleted_at?: string | null
          deleted_by?: string | null
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
      rebaseline_approvals: {
        Row: {
          confirmation_id: string | null
          created_at: string | null
          decision_date: string | null
          decision_notes: string | null
          id: string
          impact_analysis: string | null
          original_date: string
          project_manager_id: string | null
          proposed_date: string
          reason: string
          status: string | null
        }
        Insert: {
          confirmation_id?: string | null
          created_at?: string | null
          decision_date?: string | null
          decision_notes?: string | null
          id?: string
          impact_analysis?: string | null
          original_date: string
          project_manager_id?: string | null
          proposed_date: string
          reason: string
          status?: string | null
        }
        Update: {
          confirmation_id?: string | null
          created_at?: string | null
          decision_date?: string | null
          decision_notes?: string | null
          id?: string
          impact_analysis?: string | null
          original_date?: string
          project_manager_id?: string | null
          proposed_date?: string
          reason?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rebaseline_approvals_confirmation_id_fkey"
            columns: ["confirmation_id"]
            isOneToOne: false
            referencedRelation: "resource_delivery_confirmations"
            referencedColumns: ["id"]
          },
        ]
      }
      rebaseline_approvals_workflow: {
        Row: {
          approval_level: number
          approver_id: string | null
          approver_role: string
          comments: string | null
          conditions: string[] | null
          created_at: string | null
          decision: string | null
          decision_date: string | null
          id: string
          request_id: string | null
        }
        Insert: {
          approval_level: number
          approver_id?: string | null
          approver_role: string
          comments?: string | null
          conditions?: string[] | null
          created_at?: string | null
          decision?: string | null
          decision_date?: string | null
          id?: string
          request_id?: string | null
        }
        Update: {
          approval_level?: number
          approver_id?: string | null
          approver_role?: string
          comments?: string | null
          conditions?: string[] | null
          created_at?: string | null
          decision?: string | null
          decision_date?: string | null
          id?: string
          request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rebaseline_approvals_workflow_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "rebaseline_requests_enhanced"
            referencedColumns: ["id"]
          },
        ]
      }
      rebaseline_history: {
        Row: {
          affected_task_ids: string[] | null
          affected_tasks_count: number | null
          cascade_method: string | null
          created_at: string | null
          created_by: string | null
          id: string
          new_end_date: string | null
          new_start_date: string | null
          old_end_date: string | null
          old_start_date: string | null
          project_id: string | null
          reason: string
          rebaseline_type: string | null
          task_id: string | null
        }
        Insert: {
          affected_task_ids?: string[] | null
          affected_tasks_count?: number | null
          cascade_method?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_end_date?: string | null
          new_start_date?: string | null
          old_end_date?: string | null
          old_start_date?: string | null
          project_id?: string | null
          reason: string
          rebaseline_type?: string | null
          task_id?: string | null
        }
        Update: {
          affected_task_ids?: string[] | null
          affected_tasks_count?: number | null
          cascade_method?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_end_date?: string | null
          new_start_date?: string | null
          old_end_date?: string | null
          old_start_date?: string | null
          project_id?: string | null
          reason?: string
          rebaseline_type?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rebaseline_history_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rebaseline_history_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      rebaseline_requests: {
        Row: {
          created_at: string
          id: string
          impact: string | null
          original_deadline: string
          proposed_deadline: string
          reasons: string[]
          resource_id: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submitted_at: string
          task_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          impact?: string | null
          original_deadline: string
          proposed_deadline: string
          reasons?: string[]
          resource_id: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          task_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          impact?: string | null
          original_deadline?: string
          proposed_deadline?: string
          reasons?: string[]
          resource_id?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submitted_at?: string
          task_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      rebaseline_requests_enhanced: {
        Row: {
          affected_milestones: string[] | null
          affected_tasks: string[] | null
          approval_chain: Json | null
          approval_level_required: number | null
          approved_at: string | null
          cost_impact: number | null
          created_at: string | null
          current_approval_level: number | null
          current_end_date: string
          current_start_date: string
          detailed_justification: string
          id: string
          impact_analysis: Json | null
          implemented_at: string | null
          priority: string | null
          project_id: string | null
          proposed_end_date: string
          proposed_start_date: string
          reason_category: string | null
          request_number: string
          request_type: string | null
          requested_by: string | null
          risk_assessment: string | null
          status: string | null
          submitted_at: string | null
          task_id: string | null
          variance_days: number | null
        }
        Insert: {
          affected_milestones?: string[] | null
          affected_tasks?: string[] | null
          approval_chain?: Json | null
          approval_level_required?: number | null
          approved_at?: string | null
          cost_impact?: number | null
          created_at?: string | null
          current_approval_level?: number | null
          current_end_date: string
          current_start_date: string
          detailed_justification: string
          id?: string
          impact_analysis?: Json | null
          implemented_at?: string | null
          priority?: string | null
          project_id?: string | null
          proposed_end_date: string
          proposed_start_date: string
          reason_category?: string | null
          request_number: string
          request_type?: string | null
          requested_by?: string | null
          risk_assessment?: string | null
          status?: string | null
          submitted_at?: string | null
          task_id?: string | null
          variance_days?: number | null
        }
        Update: {
          affected_milestones?: string[] | null
          affected_tasks?: string[] | null
          approval_chain?: Json | null
          approval_level_required?: number | null
          approved_at?: string | null
          cost_impact?: number | null
          created_at?: string | null
          current_approval_level?: number | null
          current_end_date?: string
          current_start_date?: string
          detailed_justification?: string
          id?: string
          impact_analysis?: Json | null
          implemented_at?: string | null
          priority?: string | null
          project_id?: string | null
          proposed_end_date?: string
          proposed_start_date?: string
          reason_category?: string | null
          request_number?: string
          request_type?: string | null
          requested_by?: string | null
          risk_assessment?: string | null
          status?: string | null
          submitted_at?: string | null
          task_id?: string | null
          variance_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rebaseline_requests_enhanced_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rebaseline_requests_enhanced_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      report_recipients: {
        Row: {
          created_at: string
          id: string
          recipient_email: string
          recipient_id: string
          recipient_name: string
          recipient_type: string
          scheduled_report_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_email: string
          recipient_id: string
          recipient_name: string
          recipient_type: string
          scheduled_report_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_email?: string
          recipient_id?: string
          recipient_name?: string
          recipient_type?: string
          scheduled_report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_recipients_scheduled_report_id_fkey"
            columns: ["scheduled_report_id"]
            isOneToOne: false
            referencedRelation: "scheduled_reports"
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
      resource_comparisons: {
        Row: {
          availability_comparison_data: Json | null
          comparison_type: string | null
          complementary_skills_analysis: Json | null
          cost_comparison_data: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          optimal_pairing_suggestions: Json | null
          performance_comparison_data: Json | null
          resource_ids: string[]
          skill_comparison_data: Json | null
          team_synergy_prediction: Json | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          availability_comparison_data?: Json | null
          comparison_type?: string | null
          complementary_skills_analysis?: Json | null
          cost_comparison_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          optimal_pairing_suggestions?: Json | null
          performance_comparison_data?: Json | null
          resource_ids: string[]
          skill_comparison_data?: Json | null
          team_synergy_prediction?: Json | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          availability_comparison_data?: Json | null
          comparison_type?: string | null
          complementary_skills_analysis?: Json | null
          cost_comparison_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          optimal_pairing_suggestions?: Json | null
          performance_comparison_data?: Json | null
          resource_ids?: string[]
          skill_comparison_data?: Json | null
          team_synergy_prediction?: Json | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_comparisons_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_delivery_confirmations: {
        Row: {
          confirmation_token: string | null
          created_at: string | null
          id: string
          proposed_new_date: string | null
          rebaseline_reason: string | null
          resource_id: string | null
          response_date: string | null
          scheduled_date: string
          status: string | null
          task_id: string | null
        }
        Insert: {
          confirmation_token?: string | null
          created_at?: string | null
          id?: string
          proposed_new_date?: string | null
          rebaseline_reason?: string | null
          resource_id?: string | null
          response_date?: string | null
          scheduled_date: string
          status?: string | null
          task_id?: string | null
        }
        Update: {
          confirmation_token?: string | null
          created_at?: string | null
          id?: string
          proposed_new_date?: string | null
          rebaseline_reason?: string | null
          resource_id?: string | null
          response_date?: string | null
          scheduled_date?: string
          status?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_delivery_confirmations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_delivery_confirmations_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_profiles: {
        Row: {
          career_aspirations: string[] | null
          collaboration_effectiveness: number | null
          complexity_handling_score: number | null
          contract_end_date: string | null
          created_at: string | null
          current_projects: string[] | null
          employee_id: string | null
          employment_type: string | null
          growth_areas: string[] | null
          historical_task_velocity: number | null
          id: string
          last_activity: string | null
          learning_task_success_rate: number | null
          mentorship_capacity: boolean | null
          new_project_ramp_up_tasks: number | null
          optimal_task_count_per_day: number | null
          optimal_task_count_per_week: number | null
          peak_productivity_periods: string[] | null
          planned_time_off: Json | null
          preferred_work_style: string | null
          recurring_commitments: Json | null
          resource_id: string | null
          seniority_level: string | null
          strength_keywords: string[] | null
          task_switching_penalty_score: number | null
          task_switching_preference: string | null
          timezone: string | null
          updated_at: string | null
          work_days: string[] | null
          workspace_id: string | null
        }
        Insert: {
          career_aspirations?: string[] | null
          collaboration_effectiveness?: number | null
          complexity_handling_score?: number | null
          contract_end_date?: string | null
          created_at?: string | null
          current_projects?: string[] | null
          employee_id?: string | null
          employment_type?: string | null
          growth_areas?: string[] | null
          historical_task_velocity?: number | null
          id?: string
          last_activity?: string | null
          learning_task_success_rate?: number | null
          mentorship_capacity?: boolean | null
          new_project_ramp_up_tasks?: number | null
          optimal_task_count_per_day?: number | null
          optimal_task_count_per_week?: number | null
          peak_productivity_periods?: string[] | null
          planned_time_off?: Json | null
          preferred_work_style?: string | null
          recurring_commitments?: Json | null
          resource_id?: string | null
          seniority_level?: string | null
          strength_keywords?: string[] | null
          task_switching_penalty_score?: number | null
          task_switching_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
          work_days?: string[] | null
          workspace_id?: string | null
        }
        Update: {
          career_aspirations?: string[] | null
          collaboration_effectiveness?: number | null
          complexity_handling_score?: number | null
          contract_end_date?: string | null
          created_at?: string | null
          current_projects?: string[] | null
          employee_id?: string | null
          employment_type?: string | null
          growth_areas?: string[] | null
          historical_task_velocity?: number | null
          id?: string
          last_activity?: string | null
          learning_task_success_rate?: number | null
          mentorship_capacity?: boolean | null
          new_project_ramp_up_tasks?: number | null
          optimal_task_count_per_day?: number | null
          optimal_task_count_per_week?: number | null
          peak_productivity_periods?: string[] | null
          planned_time_off?: Json | null
          preferred_work_style?: string | null
          recurring_commitments?: Json | null
          resource_id?: string | null
          seniority_level?: string | null
          strength_keywords?: string[] | null
          task_switching_penalty_score?: number | null
          task_switching_preference?: string | null
          timezone?: string | null
          updated_at?: string | null
          work_days?: string[] | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_profiles_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_profiles_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_skills: {
        Row: {
          created_at: string
          id: string
          proficiency: number | null
          resource_id: string
          skill_id: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          proficiency?: number | null
          resource_id: string
          skill_id: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          proficiency?: number | null
          resource_id?: string
          skill_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_skills_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_utilization_metrics: {
        Row: {
          average_task_quality: number | null
          bottleneck_risk_score: number | null
          collaboration_tasks: number | null
          complex_tasks: number | null
          context_switch_penalty: number | null
          created_at: string | null
          id: string
          learning_tasks: number | null
          medium_tasks: number | null
          period_end: string
          period_start: string
          period_type: string | null
          resource_id: string | null
          simple_tasks: number | null
          task_capacity: number | null
          task_count: number | null
          tasks_completed: number | null
          updated_at: string | null
          utilization_percentage: number | null
          utilization_status: string | null
          weighted_capacity: number | null
          weighted_task_load: number | null
          weighted_utilization: number | null
          workspace_id: string | null
        }
        Insert: {
          average_task_quality?: number | null
          bottleneck_risk_score?: number | null
          collaboration_tasks?: number | null
          complex_tasks?: number | null
          context_switch_penalty?: number | null
          created_at?: string | null
          id?: string
          learning_tasks?: number | null
          medium_tasks?: number | null
          period_end: string
          period_start: string
          period_type?: string | null
          resource_id?: string | null
          simple_tasks?: number | null
          task_capacity?: number | null
          task_count?: number | null
          tasks_completed?: number | null
          updated_at?: string | null
          utilization_percentage?: number | null
          utilization_status?: string | null
          weighted_capacity?: number | null
          weighted_task_load?: number | null
          weighted_utilization?: number | null
          workspace_id?: string | null
        }
        Update: {
          average_task_quality?: number | null
          bottleneck_risk_score?: number | null
          collaboration_tasks?: number | null
          complex_tasks?: number | null
          context_switch_penalty?: number | null
          created_at?: string | null
          id?: string
          learning_tasks?: number | null
          medium_tasks?: number | null
          period_end?: string
          period_start?: string
          period_type?: string | null
          resource_id?: string | null
          simple_tasks?: number | null
          task_capacity?: number | null
          task_count?: number | null
          tasks_completed?: number | null
          updated_at?: string | null
          utilization_percentage?: number | null
          utilization_status?: string | null
          weighted_capacity?: number | null
          weighted_task_load?: number | null
          weighted_utilization?: number | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_utilization_metrics_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_utilization_metrics_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          department: string | null
          department_id: string | null
          email: string | null
          id: string
          name: string
          role: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          department_id?: string | null
          email?: string | null
          id?: string
          name: string
          role?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          department_id?: string | null
          email?: string | null
          id?: string
          name?: string
          role?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_reports: {
        Row: {
          created_at: string
          created_by: string
          date_range_end: string | null
          date_range_start: string | null
          format: string | null
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          next_run_at: string | null
          report_type: string
          sections: string[] | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          date_range_end?: string | null
          date_range_start?: string | null
          format?: string | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          report_type: string
          sections?: string[] | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          date_range_end?: string | null
          date_range_start?: string | null
          format?: string | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          next_run_at?: string | null
          report_type?: string
          sections?: string[] | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      skill_proficiencies: {
        Row: {
          certification_level: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          improvement_trend: string | null
          last_used: string | null
          proficiency_level: number | null
          resource_id: string | null
          skill_id: string | null
          updated_at: string | null
          workspace_id: string | null
          years_experience: number | null
        }
        Insert: {
          certification_level?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          improvement_trend?: string | null
          last_used?: string | null
          proficiency_level?: number | null
          resource_id?: string | null
          skill_id?: string | null
          updated_at?: string | null
          workspace_id?: string | null
          years_experience?: number | null
        }
        Update: {
          certification_level?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          improvement_trend?: string | null
          last_used?: string | null
          proficiency_level?: number | null
          resource_id?: string | null
          skill_id?: string | null
          updated_at?: string | null
          workspace_id?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skill_proficiencies_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_proficiencies_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skill_proficiencies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      stakeholders: {
        Row: {
          avatar: string | null
          communication_preference: string | null
          contact_info: Json | null
          created_at: string
          department: string | null
          department_id: string | null
          email: string | null
          escalation_level: number | null
          id: string
          influence: string | null
          influence_level: string | null
          interest: string | null
          name: string
          notes: string | null
          organization: string | null
          phone: string | null
          project_id: string | null
          projects: string[] | null
          role: string | null
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          avatar?: string | null
          communication_preference?: string | null
          contact_info?: Json | null
          created_at?: string
          department?: string | null
          department_id?: string | null
          email?: string | null
          escalation_level?: number | null
          id?: string
          influence?: string | null
          influence_level?: string | null
          interest?: string | null
          name: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          project_id?: string | null
          projects?: string[] | null
          role?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          avatar?: string | null
          communication_preference?: string | null
          contact_info?: Json | null
          created_at?: string
          department?: string | null
          department_id?: string | null
          email?: string | null
          escalation_level?: number | null
          id?: string
          influence?: string | null
          influence_level?: string | null
          interest?: string | null
          name?: string
          notes?: string | null
          organization?: string | null
          phone?: string | null
          project_id?: string | null
          projects?: string[] | null
          role?: string | null
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stakeholders_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
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
      task_deadline_reminders: {
        Row: {
          created_at: string
          deadline: string
          id: string
          project_id: string
          project_name: string
          reminder_type: string
          resource_email: string
          resource_id: string
          resource_name: string
          response_data: Json | null
          response_received: boolean | null
          response_required: boolean
          sent: boolean
          sent_at: string | null
          task_id: string
          task_name: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          deadline: string
          id?: string
          project_id: string
          project_name: string
          reminder_type: string
          resource_email: string
          resource_id: string
          resource_name: string
          response_data?: Json | null
          response_received?: boolean | null
          response_required?: boolean
          sent?: boolean
          sent_at?: string | null
          task_id: string
          task_name: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          deadline?: string
          id?: string
          project_id?: string
          project_name?: string
          reminder_type?: string
          resource_email?: string
          resource_id?: string
          resource_name?: string
          response_data?: Json | null
          response_received?: boolean | null
          response_required?: boolean
          sent?: boolean
          sent_at?: string | null
          task_id?: string
          task_name?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: []
      }
      task_dependencies: {
        Row: {
          created_at: string
          dependency_type: string | null
          depends_on_task_id: string
          id: string
          lag_days: number | null
          task_id: string
        }
        Insert: {
          created_at?: string
          dependency_type?: string | null
          depends_on_task_id: string
          id?: string
          lag_days?: number | null
          task_id: string
        }
        Update: {
          created_at?: string
          dependency_type?: string | null
          depends_on_task_id?: string
          id?: string
          lag_days?: number | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_reminders: {
        Row: {
          created_at: string
          created_by: string
          id: string
          message: string | null
          reminder_time: string
          reminder_type: string | null
          sent: boolean | null
          sent_at: string | null
          task_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          message?: string | null
          reminder_time: string
          reminder_type?: string | null
          sent?: boolean | null
          sent_at?: string | null
          task_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          message?: string | null
          reminder_time?: string
          reminder_type?: string | null
          sent?: boolean | null
          sent_at?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_reminders_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_skill_requirements: {
        Row: {
          created_at: string | null
          id: string
          minimum_proficiency: number | null
          requirement_type: string | null
          skill_id: string | null
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          minimum_proficiency?: number | null
          requirement_type?: string | null
          skill_id?: string | null
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          minimum_proficiency?: number | null
          requirement_type?: string | null
          skill_id?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_skill_requirements_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_skill_requirements_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_time_tracking: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          start_time: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_time_tracking_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_resources: string[] | null
          assigned_stakeholders: string[] | null
          baseline_end_date: string | null
          baseline_start_date: string | null
          created_at: string
          dependencies: string[] | null
          description: string | null
          duration: number | null
          end_date: string | null
          hierarchy_level: number | null
          id: string
          milestone_id: string | null
          name: string
          parent_task_id: string | null
          priority: string
          progress: number | null
          project_id: string
          sort_order: number | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_resources?: string[] | null
          assigned_stakeholders?: string[] | null
          baseline_end_date?: string | null
          baseline_start_date?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          duration?: number | null
          end_date?: string | null
          hierarchy_level?: number | null
          id?: string
          milestone_id?: string | null
          name: string
          parent_task_id?: string | null
          priority?: string
          progress?: number | null
          project_id: string
          sort_order?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_resources?: string[] | null
          assigned_stakeholders?: string[] | null
          baseline_end_date?: string | null
          baseline_start_date?: string | null
          created_at?: string
          dependencies?: string[] | null
          description?: string | null
          duration?: number | null
          end_date?: string | null
          hierarchy_level?: number | null
          id?: string
          milestone_id?: string | null
          name?: string
          parent_task_id?: string | null
          priority?: string
          progress?: number | null
          project_id?: string
          sort_order?: number | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
          user_id: string | null
        }
        Insert: {
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          start_time: string
          task_id?: string | null
          user_id?: string | null
        }
        Update: {
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          resource_id?: string | null
          start_time?: string
          task_id?: string | null
          user_id?: string | null
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
          is_system_owner: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_system_owner?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_system_owner?: boolean | null
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
      calculate_milestone_progress: {
        Args: { milestone_id_param: string }
        Returns: number
      }
      calculate_task_dates_from_dependencies: {
        Args: {
          task_id_param: string
          task_duration: number
          task_dependencies: string[]
        }
        Returns: {
          suggested_start_date: string
          suggested_end_date: string
          has_conflicts: boolean
        }[]
      }
      calculate_task_duration: {
        Args: { task_uuid: string }
        Returns: number
      }
      cascade_dependency_updates: {
        Args: { updated_task_id: string }
        Returns: undefined
      }
      check_circular_dependency: {
        Args: { task_id_param: string; new_dependency_id: string }
        Returns: boolean
      }
      check_circular_dependency_recursive: {
        Args: {
          current_task_id: string
          target_task_id: string
          visited_tasks: string[]
        }
        Returns: boolean
      }
      check_project_dependencies: {
        Args: { project_id_param: string }
        Returns: {
          dependency_type: string
          dependency_count: number
          details: string
        }[]
      }
      check_task_dependencies: {
        Args: { task_id_param: string }
        Returns: {
          dependent_task_id: string
          dependent_task_name: string
          dependency_type: string
        }[]
      }
      cleanup_deleted_projects: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_milestone: {
        Args: {
          p_project_id: string
          p_name: string
          p_description?: string
          p_due_date?: string
        }
        Returns: string
      }
      create_workspace_with_owner: {
        Args: {
          workspace_name: string
          workspace_description?: string
          workspace_slug?: string
        }
        Returns: string
      }
      execute_sql: {
        Args: { query: string }
        Returns: Json
      }
      get_critical_path: {
        Args: { project_uuid: string }
        Returns: string[]
      }
      get_milestone_date_range: {
        Args: { milestone_id_param: string }
        Returns: {
          start_date: string
          end_date: string
        }[]
      }
      get_project_phase_date_range: {
        Args: { project_id_param: string }
        Returns: {
          start_date: string
          end_date: string
        }[]
      }
      get_task_hierarchy: {
        Args: { p_project_id: string }
        Returns: {
          id: string
          name: string
          parent_task_id: string
          hierarchy_level: number
          sort_order: number
          has_children: boolean
          path: string[]
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args:
          | { _user_id: string; _role: Database["public"]["Enums"]["app_role"] }
          | { check_role: string }
        Returns: boolean
      }
      is_system_owner: {
        Args: { user_id_param?: string }
        Returns: boolean
      }
      is_workspace_admin: {
        Args: { workspace_id_param: string; user_id_param: string }
        Returns: boolean
      }
      is_workspace_member: {
        Args: { workspace_id_param: string; user_id_param: string }
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
