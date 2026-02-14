export interface ToolType {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tool {
  id: string;
  toolTypeId: string;
  toolTypeName?: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  url?: string | null;
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateToolTypePayload {
  name: string;
  description?: string | null;
}

export interface CreateToolPayload {
  toolTypeId: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  url?: string | null;
  isActive?: number;
}

export type UpdateToolPayload = Partial<CreateToolPayload>;
