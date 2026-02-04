import { z } from 'zod';
import prisma from '../../../database/prisma.js';

export const createUserSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    name: z.string().min(4, "Name must be at least 4 characters long"),
    role: z.enum(["USER", "ADMIN"]).optional(),
    isActive: z.number().int().min(0).max(1).optional(),
  })
  .superRefine(async (data, ctx) => {
    if (data.email) {
      const exists = await prisma.users.findUnique({
        where: { email: data.email }
      });
  
      if (exists) {
        ctx.addIssue({
          code: 'custom',
          message: "Email already in use",
          path: ["email"],
        });
      }
    }
  });

export const updateUserSchema = z
  .object({
    email: z.email().optional(),
    password: z.string().min(8, "Password must be at least 8 characters long").optional(),
    name: z.string().min(4, "Name must be at least 4 characters long").optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    isActive: z.number().int().min(0).max(1).optional()
  })
  .superRefine(async (data, ctx) => {
    if (data.email) {
      const exists = await prisma.users.findUnique({
        where: { email: data.email }
      });

      if (exists) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom, // use raw string instead of ZodIssueCode.
          message: "Email already in use",
          path: ["email"],
        });
      }
    }
  });