export interface Enterprise {
  id: string;
  name: string;
  description?: string;
  slug: string;
  owner_id: string;
  settings: Record<string, any> | string | null;
  created_at: string;
  updated_at: string;
}

export interface EnterpriseContextType {
  currentEnterprise: Enterprise | null;
  enterprises: Enterprise[];
  loading: boolean;
  error: string | null;
  setCurrentEnterprise: (enterprise: Enterprise | null) => void;
  refreshEnterprises: () => Promise<void>;
  createEnterprise: (name: string, description?: string) => Promise<Enterprise | null>;
  updateEnterprise: (id: string, updates: Partial<Enterprise>) => Promise<void>;
}