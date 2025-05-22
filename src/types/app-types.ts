
// Custom application types that extend or use the database types
import { Database } from '@/integrations/supabase/types';

// Model-related types
export type Model = Database['public']['Tables']['models']['Row'];
export type ModelInsert = Database['public']['Tables']['models']['Insert'];
export type ModelUpdate = Database['public']['Tables']['models']['Update'];

// Sample-related types
export type Sample = Database['public']['Tables']['samples']['Row'];
export type SampleInsert = Database['public']['Tables']['samples']['Insert'];

// Image-related types
export type Image = Database['public']['Tables']['images']['Row'];
export type ImageInsert = Database['public']['Tables']['images']['Insert'];

// Credit-related types
export type Credit = Database['public']['Tables']['credits']['Row'];
export type CreditInsert = Database['public']['Tables']['credits']['Insert'];
export type CreditUpdate = Database['public']['Tables']['credits']['Update'];

// Additional types for API responses
export interface AstriaApiResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface AstriaTuneResponse {
  id: string;
  status: string;
  progress?: number;
  message?: string;
}

export interface AstriaInferenceResponse {
  images?: string[];
  id?: string;
  status?: string;
  urls?: string[];
  error?: string;
}

// Style selection types
export type StyleOption = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
};
