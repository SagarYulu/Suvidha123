
import { Json } from '@/integrations/supabase/types';

export interface Role {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface City {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cluster {
  id: string;
  name: string;
  cityId: string;
  cityName?: string; // For convenience when displaying
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  entityType: 'role' | 'city' | 'cluster';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  changes: Json; // Changed from Record<string, any> to Json
  createdBy: string; // User ID
  createdAt: string;
  userName?: string; // For convenience when displaying
}
