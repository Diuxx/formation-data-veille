export interface Stack {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  versionsCount?: number;
  versions: StackVersion[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StackVersion {
  id: string;
  stackId: string;
  version: string;
  releaseDate?: string | null;
  isLts: number;
  notes?: string | null;
  link?: string | null; // add link property to StackVersion
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStackPayload {
  name: string;
  description?: string | null;
  icon?: string | null;
}

export interface CreateStackVersionPayload {
  version: string;
  releaseDate?: string | null;
  isLts?: number;
  notes?: string | null;
}

export type UpdateStackVersionPayload = Partial<CreateStackVersionPayload>;
