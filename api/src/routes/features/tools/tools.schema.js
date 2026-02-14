import { z } from 'zod';

export const createToolTypeSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional().nullable(),
});

export const createToolSchema = z.object({
  toolTypeId: z.string().uuid(),
  name: z.string().min(2).max(255),
  description: z.string().max(3000).optional().nullable(),
  icon: z.url().max(500).optional().nullable(),
  url: z.url().max(500).optional().nullable(),
  isActive: z.number().int().min(0).max(1).optional(),
});

export const updateToolSchema = z.object({
  toolTypeId: z.string().uuid().optional(),
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(3000).optional().nullable(),
  icon: z.url().max(500).optional().nullable(),
  url: z.url().max(500).optional().nullable(),
  isActive: z.number().int().min(0).max(1).optional(),
});
