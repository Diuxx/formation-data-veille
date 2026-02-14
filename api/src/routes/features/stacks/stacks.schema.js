import { z } from 'zod';

export const createStackSchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(3000).optional().nullable(),
  icon: z.url().max(500).optional().nullable(),
});

export const createStackVersionSchema = z.object({
  version: z.string().min(1).max(100),
  releaseDate: z.string().date().optional().nullable(),
  isLts: z.number().int().min(0).max(1).optional(),
  notes: z.string().max(3000).optional().nullable(),
});

export const updateStackVersionSchema = z.object({
  version: z.string().min(1).max(100).optional(),
  releaseDate: z.string().date().optional().nullable(),
  isLts: z.number().int().min(0).max(1).optional(),
  notes: z.string().max(3000).optional().nullable(),
});
