import { z } from 'zod';
import { INCOME_BRACKETS, PROVINCES } from '@beyond-tomorrow/engine';
import type { StudentProfile } from '@beyond-tomorrow/engine';

export const markSchema = z.object({
  subjectCode: z.string().regex(/^[A-Z]{2,10}$/),
  percent: z.number().int().min(0).max(100),
});

export const studentProfileSchema = z
  .object({
    province: z.enum(PROVINCES).optional(),
    incomeBracket: z.enum(INCOME_BRACKETS).optional(),
    interests: z.array(z.string().trim().min(1).max(40)).max(20),
    marks: z.array(markSchema).max(12),
  })
  .strict()
  .refine((p) => new Set(p.marks.map((m) => m.subjectCode)).size === p.marks.length, {
    message: 'Duplicate subject',
    path: ['marks'],
  }) satisfies z.ZodType<StudentProfile>;
