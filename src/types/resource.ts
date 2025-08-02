
export interface Resource {
  id: string;
  workspace_id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}
