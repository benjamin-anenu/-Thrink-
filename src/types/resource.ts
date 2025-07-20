
export interface Resource {
  id: string;
  workspace_id: string;
  name: string;
  email?: string;
  role?: string;
  department?: string;
  status?: 'active' | 'inactive';
  isDeleted?: boolean;
  avatar?: string;
  skills?: Array<{
    id: string;
    name: string;
    proficiency?: number;
  }>;
  created_at: string;
  updated_at: string;
}
